// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Readers pick one writer at a time to support at a streaming ETH
/// rate; the writer withdraws their accumulated earnings themselves. Reader
/// funds never leave the reader's control except through their own deposits,
/// and never reach a writer except through the writer's own withdraw() call —
/// there is no contract-initiated push to an arbitrary address.
///
/// Deliberately separate from TruthVerification.sol: unrelated money, unrelated
/// governance need. This is a brand-new, unproven contract, so pause control is
/// a simple deployer-owned Ownable rather than TruthVerification's board/
/// TimelockController pattern — there's no board precedent yet for financial
/// decisions on this contract, and a single owner can react faster to a bug
/// report than a 48h appeal window would allow.
contract WriterSubscriptions is ReentrancyGuard, Pausable, Ownable {
    struct Subscription {
        address writer; // address(0) = no active subscription
        uint256 ratePerSecond; // wei/sec, computed off-chain from a monthly amount
        uint256 lastSettled; // timestamp accrual was last run for this reader
        uint256 balance; // reader's remaining deposit — hard cap on what can accrue out
    }

    /// @notice One active subscription per reader — enforces "a reader
    /// supports one writer at a time" at the data-model level, not just in UI.
    mapping(address => Subscription) public subscriptions;
    /// @notice Writer-side accumulator. A writer can have unboundedly many
    /// readers, so this is a running total rather than a per-reader ledger —
    /// avoids ever iterating readers on-chain.
    mapping(address => uint256) public earnings;

    event Subscribed(address indexed reader, address indexed writer, uint256 ratePerSecond);
    event RateChanged(address indexed reader, address indexed writer, uint256 ratePerSecond);
    event WriterSwitched(address indexed reader, address indexed oldWriter, address indexed newWriter, uint256 settledAmount);
    event Deposited(address indexed reader, uint256 amount);
    event Unsubscribed(address indexed reader, address indexed writer, uint256 settledAmount);
    event Reclaimed(address indexed reader, uint256 amount);
    event Withdrawn(address indexed writer, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /// @notice Settles accrued earnings for `reader` up to now, capped at their
    /// remaining balance. `lastSettled` always advances to `block.timestamp`,
    /// even when the balance ran out before covering the full elapsed time —
    /// the uncovered gap is simply never charged, not retroactively collected
    /// once the reader tops up. This is the one non-obvious behavior in the
    /// contract: a stream that starved for a day doesn't "catch up" a day's
    /// worth the moment it's refunded.
    function _settle(address reader) internal {
        Subscription storage s = subscriptions[reader];
        if (s.writer == address(0)) {
            s.lastSettled = block.timestamp;
            return;
        }
        uint256 elapsed = block.timestamp - s.lastSettled;
        uint256 owed = elapsed * s.ratePerSecond; // both whole units — no on-chain division, no truncation dust
        uint256 paid = owed > s.balance ? s.balance : owed;
        s.balance -= paid;
        earnings[s.writer] += paid;
        s.lastSettled = block.timestamp;
    }

    /// @notice Subscribe to `writer` at `ratePerSecond`, depositing `msg.value`.
    /// Three cases: first-ever subscription, a rate change on the same writer
    /// (settles at the OLD rate first), or a switch to a different writer
    /// (settles against the OLD writer/rate BEFORE the writer is overwritten,
    /// so the old writer is paid exactly up to the switch instant and the new
    /// writer starts accruing from zero — reversing this order would let the
    /// new rate retroactively apply to time the reader spent with the old
    /// writer, or vice versa).
    function subscribe(address writer, uint256 ratePerSecond) external payable whenNotPaused nonReentrant {
        require(writer != address(0), "Writer required");
        require(writer != msg.sender, "Cannot subscribe to self");

        Subscription storage s = subscriptions[msg.sender];
        address previousWriter = s.writer;

        if (previousWriter == address(0)) {
            s.lastSettled = block.timestamp;
            s.writer = writer;
            s.ratePerSecond = ratePerSecond;
            s.balance += msg.value;
            emit Subscribed(msg.sender, writer, ratePerSecond);
        } else if (previousWriter == writer) {
            _settle(msg.sender);
            s.ratePerSecond = ratePerSecond;
            s.balance += msg.value;
            emit RateChanged(msg.sender, writer, ratePerSecond);
        } else {
            _settle(msg.sender); // pays `previousWriter` up to now, at the OLD rate
            uint256 settledAmount = earnings[previousWriter];
            s.writer = writer;
            s.ratePerSecond = ratePerSecond;
            s.balance += msg.value;
            emit WriterSwitched(msg.sender, previousWriter, writer, settledAmount);
        }
    }

    /// @notice Add funds to the reader's existing subscription without
    /// changing writer or rate.
    function topUp() external payable whenNotPaused {
        require(subscriptions[msg.sender].writer != address(0), "No active subscription");
        _settle(msg.sender);
        subscriptions[msg.sender].balance += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Change the streaming rate to the currently subscribed writer.
    /// Settles at the old rate first so the rate change only applies going
    /// forward.
    function changeRate(uint256 newRatePerSecond) external whenNotPaused {
        Subscription storage s = subscriptions[msg.sender];
        require(s.writer != address(0), "No active subscription");
        _settle(msg.sender);
        s.ratePerSecond = newRatePerSecond;
        emit RateChanged(msg.sender, s.writer, newRatePerSecond);
    }

    /// @notice Stop supporting the current writer. Settles the final accrual;
    /// any unspent balance stays on the subscription, reclaimable via
    /// reclaim() — unsubscribing does not auto-refund.
    function unsubscribe() external nonReentrant whenNotPaused {
        Subscription storage s = subscriptions[msg.sender];
        address writer = s.writer;
        require(writer != address(0), "No active subscription");
        _settle(msg.sender);
        uint256 settledAmount = earnings[writer];
        s.writer = address(0);
        s.ratePerSecond = 0;
        emit Unsubscribed(msg.sender, writer, settledAmount);
    }

    /// @notice Reader reclaims up to `amount` of their own unspent balance.
    /// Settles first so a reclaim can never pull back funds that already
    /// accrued to the writer. Deliberately NOT gated by whenNotPaused — a
    /// reader must always be able to recover their own unspent funds, even
    /// during an emergency pause.
    function reclaim(uint256 amount) external nonReentrant {
        _settle(msg.sender);
        Subscription storage s = subscriptions[msg.sender];
        require(amount <= s.balance, "Insufficient balance");
        s.balance -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        emit Reclaimed(msg.sender, amount);
    }

    /// @notice Writer withdraws their own accumulated earnings, straight to
    /// their own connected wallet — a pull the writer initiates themselves,
    /// not a push the contract initiates to an arbitrary address.
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount <= earnings[msg.sender], "Insufficient earnings");
        earnings[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    function pendingEarnings(address writer) external view returns (uint256) {
        return earnings[writer];
    }

    /// @notice Read-only projection of what _settle(reader) would do right
    /// now, for UI display, without spending gas or mutating state.
    function previewAccrual(address reader) external view returns (uint256 settleable, uint256 remainingBalance) {
        Subscription storage s = subscriptions[reader];
        if (s.writer == address(0)) {
            return (0, s.balance);
        }
        uint256 elapsed = block.timestamp - s.lastSettled;
        uint256 owed = elapsed * s.ratePerSecond;
        uint256 paid = owed > s.balance ? s.balance : owed;
        return (paid, s.balance - paid);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
