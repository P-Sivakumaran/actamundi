# Protocol tooling and governance

Run contract commands from this directory. It is an ESM package so Hardhat 3
does not require converting the Next.js application's CommonJS config files.
Dependencies and the lockfile remain in the repository root.

```sh
# From the repository root:
npm ci
cd contracts
npx hardhat compile
npx hardhat test
npx tsc --noEmit -p tsconfig.json
```

From the repository root, `npm run contracts:compile` and
`npm run contracts:test` run the same commands. Hardhat 3's official
ethers/Mocha toolbox supplies Chai matchers, network helpers, and Ignition.
The old `@nomicfoundation/hardhat-toolbox@7` package is a deprecation shim.
Solidity 0.8.34 is pinned in the config. Hardhat downloads it by default;
`ACTAMUNDI_SOLC_PATH` can point to a local 0.8.34 `soljson.js` for offline use
(install with `npm install -D --save-exact solc@0.8.34`). Optimization and
`viaIR` support the contract's large struct getters without changing its API.

## Deploy

Create a parameters JSON file with real board addresses:

```json
{
  "TruthVerificationGovernance": {
    "boardAddrs": ["<BOARD_1_ADDRESS>", "<BOARD_2_ADDRESS>"],
    "minDelay": 172800
  }
}
```

`boardAddrs` has no default. Supply a non-empty list of distinct, controlled,
nonzero wallets. OZ's TimelockController itself accepts an empty board and a
zero delay; the module does not add constructor constraints to OZ. An empty
board permanently locks administration; zero delay removes the appeal window.
`minDelay` is seconds and defaults to 48 hours when omitted.

```sh
# Ephemeral local deployment (no public-chain transaction):
npx hardhat ignition deploy ignition/modules/TruthVerification.ts --parameters ./parameters.json

# Testnet: set SEPOLIA_RPC_URL and SEPOLIA_PRIVATE_KEY in the environment first.
npx hardhat ignition deploy ignition/modules/TruthVerification.ts --parameters ./parameters.json --network sepolia
```

The timelock constructor grants both PROPOSER_ROLE and CANCELLER_ROLE to each
initial board member. EXECUTOR_ROLE is open via address(0); execution still
requires a ready, scheduled operation. DEFAULT_ADMIN_ROLE belongs only to the
timelock itself: the deployer receives no bypass role. TruthVerification starts
paused. Schedule initial verifier/source setup and `unpause`, wait the delay,
then execute; there is deliberately no instant bootstrap exception.

Each admin call is encoded with TruthVerification's ABI, scheduled with the
contract's address, value 0, predecessor bytes32(0), a unique salt, and at least
the timelock's current minDelay. Any board canceller may cancel the operation
hash during the window. Anyone may execute it once ready. Role changes and
delay changes must themselves be scheduled calls targeting the timelock.
Changing proposer membership later does **not** automatically change canceller
membership: schedule both role changes explicitly.

## Boundaries and existing behavior

- A proposer can act alone unless another board member vetoes. This is not
  majority-vote approval, and cancelling does not prevent a fresh proposal.
- The immutable governor constructor checks only nonzero, not contract type.
  Use this Ignition module to get the intended timelock governance.
- The regression tests preserve existing logic rather than changing economics:
  evidence votes at/after the third vote earn reputation; claim verification
  at/after threshold increments source verifiedClaims; `totalStake` remains
  cumulative on withdrawal; falsehood score uses a rolling average and a
  threshold of 5. `_reason` is currently unused by `detectFalsehood`.
- These existing behaviors merit a separate economic/security review. In
  particular, repeat qualifying evidence/claim votes can inflate reputation or
  source statistics. This change does not silently redesign those rules.

References checked against the installed Hardhat 3.18.0/OZ 5.6.1 sources:
[Hardhat setup](https://hardhat.org/docs/getting-started),
[configuration](https://hardhat.org/docs/reference/configuration),
[Ignition](https://hardhat.org/ignition/docs/getting-started).
