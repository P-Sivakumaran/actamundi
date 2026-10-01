// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @notice Board-governed in place of single-owner control: `governor` is a
/// TimelockController (see deployment), not an EOA. Board members hold
/// PROPOSER_ROLE/CANCELLER_ROLE on that timelock — admin actions here go
/// through its schedule -> minDelay (the appeal window, during which any
/// board member can cancel) -> execute flow rather than taking effect
/// instantly from a single address. See docs for the Phase 1 rationale.
contract TruthVerification is ReentrancyGuard, Pausable {
    using Strings for uint256;

    /// @notice The only address authorized to call governor-gated functions —
    /// set once at deployment to a TimelockController address. Immutable: a
    /// governor swap (e.g. retiring the timelock for a new one) is itself a
    /// board-governed action performed by deploying a new TruthVerification
    /// instance, not a backdoor on this one.
    address public immutable governor;

    modifier onlyGovernor() {
        require(msg.sender == governor, "Not the governor");
        _;
    }

    struct Claim {
        string content;
        string source;
        uint256 timestamp;
        address author;
        uint256 verificationCount;
        uint256 disputeCount;
        bool isVerified;
        bool isDisputed;
        bool isFalsehood;
        uint256 verificationThreshold;
        uint256 disputeThreshold;
        uint256 falsehoodScore;
        string[] supportingEvidence;
        string[] contradictingEvidence;
        mapping(address => bool) hasVerified;
        mapping(address => bool) hasDisputed;
        mapping(address => uint256) verificationTimestamp;
        mapping(address => uint256) disputeTimestamp;
        mapping(address => uint256) falsehoodScoreContribution;
    }

    struct Verifier {
        uint256 reputation;
        uint256 successfulVerifications;
        uint256 failedVerifications;
        uint256 successfulDisputes;
        uint256 failedDisputes;
        uint256 successfulFalsehoodDetections;
        uint256 failedFalsehoodDetections;
        bool isActive;
        uint256 joinDate;
        uint256 lastActivity;
        uint256 totalStake;
        uint256 lockedStake;
        uint256 expertiseLevel;
        string[] expertiseAreas;
    }

    struct Source {
        uint256 reliability;
        uint256 totalClaims;
        uint256 verifiedClaims;
        uint256 disputedClaims;
        uint256 falsehoodClaims;
        bool isWhitelisted;
        uint256 lastUpdate;
        uint256 falsehoodRate;
        mapping(string => uint256) categoryReliability;
    }

    struct Evidence {
        string content;
        string source;
        uint256 timestamp;
        address submitter;
        bool isVerified;
        uint256 verificationCount;
        mapping(address => bool) hasVerified;
    }

    mapping(bytes32 => Claim) public claims;
    mapping(address => Verifier) public verifiers;
    mapping(string => Source) public sources;
    mapping(bytes32 => Evidence) public evidence;
    mapping(address => uint256) public lastVerificationTime;
    mapping(address => uint256) public lastDisputeTime;
    mapping(address => uint256) public lastFalsehoodDetectionTime;
    mapping(address => uint256) public stakeAmount;
    mapping(string => uint256) public categoryThresholds;
    
    uint256 private _claimCounter;
    uint256 private _evidenceCounter;
    
    uint256 public constant VERIFICATION_COOLDOWN = 1 hours;
    uint256 public constant DISPUTE_COOLDOWN = 2 hours;
    uint256 public constant FALSEHOOD_DETECTION_COOLDOWN = 4 hours;
    uint256 public constant MIN_REPUTATION_TO_VERIFY = 100;
    uint256 public constant MIN_REPUTATION_TO_DISPUTE = 150;
    uint256 public constant MIN_REPUTATION_TO_DETECT_FALSEHOOD = 200;
    uint256 public constant REPUTATION_REWARD = 10;
    uint256 public constant REPUTATION_PENALTY = 20;
    uint256 public constant MIN_STAKE = 0.1 ether;
    uint256 public constant MAX_STAKE = 10 ether;
    uint256 public constant DEFAULT_VERIFICATION_THRESHOLD = 3;
    uint256 public constant DEFAULT_DISPUTE_THRESHOLD = 3;
    uint256 public constant SOURCE_RELIABILITY_THRESHOLD = 70;
    uint256 public constant FALSEHOOD_DETECTION_THRESHOLD = 5;
    uint256 public constant MAX_FALSEHOOD_SCORE = 100;
    
    event ClaimSubmitted(bytes32 indexed claimId, string content, string source, address author);
    event ClaimVerified(bytes32 indexed claimId, address verifier);
    event ClaimDisputed(bytes32 indexed claimId, address disputer);
    event FalsehoodDetected(bytes32 indexed claimId, address detector, uint256 score);
    event EvidenceSubmitted(bytes32 indexed claimId, bytes32 indexed evidenceId, string content, string source, address submitter);
    event EvidenceVerified(bytes32 indexed evidenceId, address verifier);
    event VerifierRegistered(address indexed verifier);
    event VerifierDeactivated(address indexed verifier);
    event StakeDeposited(address indexed verifier, uint256 amount);
    event StakeWithdrawn(address indexed verifier, uint256 amount);
    event SourceWhitelisted(string indexed source);
    event SourceBlacklisted(string indexed source);
    event CategoryThresholdUpdated(string indexed category, uint256 threshold);
    
    constructor(address _governor) {
        require(_governor != address(0), "Governor required");
        governor = _governor;
        _pause(); // Start paused for initial setup
        // Initialize default category thresholds
        categoryThresholds["factual"] = 80;
        categoryThresholds["opinion"] = 50;
        categoryThresholds["analysis"] = 70;
    }
    
    function submitClaim(string memory _content, string memory _source) external whenNotPaused returns (bytes32) {
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_source).length > 0, "Source cannot be empty");
        require(sources[_source].isWhitelisted || sources[_source].reliability >= SOURCE_RELIABILITY_THRESHOLD, "Source not trusted");
        
        _claimCounter++;
        bytes32 claimId = keccak256(abi.encodePacked(_content, msg.sender, block.timestamp, _claimCounter));
        
        Claim storage newClaim = claims[claimId];
        newClaim.content = _content;
        newClaim.source = _source;
        newClaim.timestamp = block.timestamp;
        newClaim.author = msg.sender;
        newClaim.verificationThreshold = DEFAULT_VERIFICATION_THRESHOLD;
        newClaim.disputeThreshold = DEFAULT_DISPUTE_THRESHOLD;
        
        // Update source statistics
        sources[_source].totalClaims++;
        sources[_source].lastUpdate = block.timestamp;
        
        emit ClaimSubmitted(claimId, _content, _source, msg.sender);
        return claimId;
    }
    
    function submitEvidence(bytes32 _claimId, string memory _content, string memory _source, bool _isSupporting) external whenNotPaused {
        require(claims[_claimId].timestamp > 0, "Claim does not exist");
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_source).length > 0, "Source cannot be empty");
        
        _evidenceCounter++;
        bytes32 evidenceId = keccak256(abi.encodePacked(_content, msg.sender, block.timestamp, _evidenceCounter));
        
        Evidence storage newEvidence = evidence[evidenceId];
        newEvidence.content = _content;
        newEvidence.source = _source;
        newEvidence.timestamp = block.timestamp;
        newEvidence.submitter = msg.sender;
        
        if (_isSupporting) {
            claims[_claimId].supportingEvidence.push(_content);
        } else {
            claims[_claimId].contradictingEvidence.push(_content);
        }
        
        emit EvidenceSubmitted(_claimId, evidenceId, _content, _source, msg.sender);
    }
    
    function verifyEvidence(bytes32 _evidenceId) external nonReentrant whenNotPaused {
        require(verifiers[msg.sender].isActive, "Not an active verifier");
        require(verifiers[msg.sender].reputation >= MIN_REPUTATION_TO_VERIFY, "Insufficient reputation");
        require(verifiers[msg.sender].lockedStake >= MIN_STAKE, "Insufficient stake");
        require(!evidence[_evidenceId].hasVerified[msg.sender], "Already verified");
        
        Evidence storage ev = evidence[_evidenceId];
        require(ev.timestamp > 0, "Evidence does not exist");
        
        ev.hasVerified[msg.sender] = true;
        ev.verificationCount++;
        
        if (ev.verificationCount >= 3) {
            ev.isVerified = true;
            verifiers[msg.sender].reputation += REPUTATION_REWARD;
            verifiers[msg.sender].successfulVerifications++;
        }
        
        emit EvidenceVerified(_evidenceId, msg.sender);
    }
    
    function detectFalsehood(bytes32 _claimId, uint256 _score, string memory _reason) external nonReentrant whenNotPaused {
        require(verifiers[msg.sender].isActive, "Not an active verifier");
        require(verifiers[msg.sender].reputation >= MIN_REPUTATION_TO_DETECT_FALSEHOOD, "Insufficient reputation");
        require(verifiers[msg.sender].lockedStake >= MIN_STAKE, "Insufficient stake");
        require(block.timestamp >= lastFalsehoodDetectionTime[msg.sender] + FALSEHOOD_DETECTION_COOLDOWN, "Falsehood detection cooldown active");
        require(_score <= MAX_FALSEHOOD_SCORE, "Invalid falsehood score");
        
        Claim storage claim = claims[_claimId];
        require(claim.timestamp > 0, "Claim does not exist");
        require(!claim.isFalsehood, "Already marked as falsehood");
        
        claim.falsehoodScoreContribution[msg.sender] = _score;
        claim.falsehoodScore = (claim.falsehoodScore + _score) / 2;
        
        if (claim.falsehoodScore >= FALSEHOOD_DETECTION_THRESHOLD) {
            claim.isFalsehood = true;
            verifiers[msg.sender].reputation += REPUTATION_REWARD;
            verifiers[msg.sender].successfulFalsehoodDetections++;
            sources[claim.source].falsehoodClaims++;
            sources[claim.source].falsehoodRate = (sources[claim.source].falsehoodClaims * 100) / sources[claim.source].totalClaims;
        } else {
            verifiers[msg.sender].reputation -= REPUTATION_PENALTY;
            verifiers[msg.sender].failedFalsehoodDetections++;
        }
        
        lastFalsehoodDetectionTime[msg.sender] = block.timestamp;
        verifiers[msg.sender].lastActivity = block.timestamp;
        emit FalsehoodDetected(_claimId, msg.sender, _score);
    }
    
    function verifyClaim(bytes32 _claimId) external nonReentrant whenNotPaused {
        require(verifiers[msg.sender].isActive, "Not an active verifier");
        require(verifiers[msg.sender].reputation >= MIN_REPUTATION_TO_VERIFY, "Insufficient reputation");
        require(verifiers[msg.sender].lockedStake >= MIN_STAKE, "Insufficient stake");
        require(block.timestamp >= lastVerificationTime[msg.sender] + VERIFICATION_COOLDOWN, "Verification cooldown active");
        require(!claims[_claimId].hasVerified[msg.sender], "Already verified");
        
        Claim storage claim = claims[_claimId];
        require(claim.timestamp > 0, "Claim does not exist");
        require(!claim.isDisputed, "Claim is disputed");
        require(!claim.isFalsehood, "Claim is marked as falsehood");
        
        claim.hasVerified[msg.sender] = true;
        claim.verificationCount++;
        claim.verificationTimestamp[msg.sender] = block.timestamp;
        
        if (claim.verificationCount >= claim.verificationThreshold) {
            claim.isVerified = true;
            verifiers[msg.sender].reputation += REPUTATION_REWARD;
            verifiers[msg.sender].successfulVerifications++;
            sources[claim.source].verifiedClaims++;
            sources[claim.source].reliability = (sources[claim.source].verifiedClaims * 100) / sources[claim.source].totalClaims;
        }
        
        lastVerificationTime[msg.sender] = block.timestamp;
        verifiers[msg.sender].lastActivity = block.timestamp;
        emit ClaimVerified(_claimId, msg.sender);
    }
    
    function disputeClaim(bytes32 _claimId) external nonReentrant whenNotPaused {
        require(verifiers[msg.sender].isActive, "Not an active verifier");
        require(verifiers[msg.sender].reputation >= MIN_REPUTATION_TO_DISPUTE, "Insufficient reputation");
        require(verifiers[msg.sender].lockedStake >= MIN_STAKE, "Insufficient stake");
        require(block.timestamp >= lastDisputeTime[msg.sender] + DISPUTE_COOLDOWN, "Dispute cooldown active");
        require(!claims[_claimId].hasDisputed[msg.sender], "Already disputed");
        
        Claim storage claim = claims[_claimId];
        require(claim.timestamp > 0, "Claim does not exist");
        require(!claim.isVerified, "Claim is already verified");
        require(!claim.isFalsehood, "Claim is marked as falsehood");
        
        claim.hasDisputed[msg.sender] = true;
        claim.disputeCount++;
        claim.disputeTimestamp[msg.sender] = block.timestamp;
        
        if (claim.disputeCount >= claim.disputeThreshold) {
            claim.isDisputed = true;
            verifiers[msg.sender].reputation += REPUTATION_REWARD;
            verifiers[msg.sender].successfulDisputes++;
            sources[claim.source].disputedClaims++;
            sources[claim.source].reliability = ((sources[claim.source].verifiedClaims * 100) / sources[claim.source].totalClaims);
        } else {
            verifiers[msg.sender].reputation -= REPUTATION_PENALTY;
            verifiers[msg.sender].failedDisputes++;
        }
        
        lastDisputeTime[msg.sender] = block.timestamp;
        verifiers[msg.sender].lastActivity = block.timestamp;
        emit ClaimDisputed(_claimId, msg.sender);
    }
    
    function depositStake() external payable nonReentrant {
        require(msg.value >= MIN_STAKE, "Insufficient stake amount");
        require(msg.value <= MAX_STAKE, "Exceeds maximum stake");
        
        stakeAmount[msg.sender] += msg.value;
        verifiers[msg.sender].totalStake += msg.value;
        verifiers[msg.sender].lockedStake += msg.value;
        
        emit StakeDeposited(msg.sender, msg.value);
    }
    
    function withdrawStake(uint256 amount) external nonReentrant {
        require(amount <= stakeAmount[msg.sender], "Insufficient stake");
        require(amount <= verifiers[msg.sender].lockedStake, "Insufficient locked stake");
        require(block.timestamp >= verifiers[msg.sender].lastActivity + 30 days, "Stake locked");
        
        stakeAmount[msg.sender] -= amount;
        verifiers[msg.sender].lockedStake -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit StakeWithdrawn(msg.sender, amount);
    }
    
    function registerVerifier(address _verifier, string[] memory _expertiseAreas) external onlyGovernor {
        require(!verifiers[_verifier].isActive, "Already registered");
        
        Verifier storage verifier = verifiers[_verifier];
        verifier.isActive = true;
        verifier.reputation = MIN_REPUTATION_TO_VERIFY;
        verifier.joinDate = block.timestamp;
        verifier.lastActivity = block.timestamp;
        verifier.expertiseLevel = 1;
        verifier.expertiseAreas = _expertiseAreas;
        
        emit VerifierRegistered(_verifier);
    }
    
    function deactivateVerifier(address _verifier) external onlyGovernor {
        require(verifiers[_verifier].isActive, "Not registered");
        
        verifiers[_verifier].isActive = false;
        emit VerifierDeactivated(_verifier);
    }
    
    function whitelistSource(string memory _source) external onlyGovernor {
        sources[_source].isWhitelisted = true;
        sources[_source].reliability = 100;
        sources[_source].lastUpdate = block.timestamp;
        emit SourceWhitelisted(_source);
    }
    
    function blacklistSource(string memory _source) external onlyGovernor {
        sources[_source].isWhitelisted = false;
        sources[_source].reliability = 0;
        sources[_source].lastUpdate = block.timestamp;
        emit SourceBlacklisted(_source);
    }
    
    function updateSourceReliability(string memory _source, uint256 _reliability) external onlyGovernor {
        require(_reliability <= 100, "Invalid reliability value");
        sources[_source].reliability = _reliability;
        sources[_source].lastUpdate = block.timestamp;
    }
    
    function updateCategoryThreshold(string memory _category, uint256 _threshold) external onlyGovernor {
        require(_threshold <= 100, "Invalid threshold value");
        categoryThresholds[_category] = _threshold;
        emit CategoryThresholdUpdated(_category, _threshold);
    }
    
    function getClaim(bytes32 _claimId) external view returns (
        string memory content,
        string memory source,
        uint256 timestamp,
        address author,
        uint256 verificationCount,
        uint256 disputeCount,
        bool isVerified,
        bool isDisputed,
        bool isFalsehood,
        uint256 verificationThreshold,
        uint256 disputeThreshold,
        uint256 falsehoodScore,
        string[] memory supportingEvidence,
        string[] memory contradictingEvidence
    ) {
        Claim storage claim = claims[_claimId];
        return (
            claim.content,
            claim.source,
            claim.timestamp,
            claim.author,
            claim.verificationCount,
            claim.disputeCount,
            claim.isVerified,
            claim.isDisputed,
            claim.isFalsehood,
            claim.verificationThreshold,
            claim.disputeThreshold,
            claim.falsehoodScore,
            claim.supportingEvidence,
            claim.contradictingEvidence
        );
    }
    
    function getVerifier(address _verifier) external view returns (
        uint256 reputation,
        uint256 successfulVerifications,
        uint256 failedVerifications,
        uint256 successfulDisputes,
        uint256 failedDisputes,
        uint256 successfulFalsehoodDetections,
        uint256 failedFalsehoodDetections,
        bool isActive,
        uint256 joinDate,
        uint256 lastActivity,
        uint256 totalStake,
        uint256 lockedStake,
        uint256 expertiseLevel,
        string[] memory expertiseAreas
    ) {
        Verifier storage verifier = verifiers[_verifier];
        return (
            verifier.reputation,
            verifier.successfulVerifications,
            verifier.failedVerifications,
            verifier.successfulDisputes,
            verifier.failedDisputes,
            verifier.successfulFalsehoodDetections,
            verifier.failedFalsehoodDetections,
            verifier.isActive,
            verifier.joinDate,
            verifier.lastActivity,
            verifier.totalStake,
            verifier.lockedStake,
            verifier.expertiseLevel,
            verifier.expertiseAreas
        );
    }
    
    function getSource(string memory _source) external view returns (
        uint256 reliability,
        uint256 totalClaims,
        uint256 verifiedClaims,
        uint256 disputedClaims,
        uint256 falsehoodClaims,
        bool isWhitelisted,
        uint256 lastUpdate,
        uint256 falsehoodRate
    ) {
        Source storage source = sources[_source];
        return (
            source.reliability,
            source.totalClaims,
            source.verifiedClaims,
            source.disputedClaims,
            source.falsehoodClaims,
            source.isWhitelisted,
            source.lastUpdate,
            source.falsehoodRate
        );
    }
    
    function getEvidence(bytes32 _evidenceId) external view returns (
        string memory content,
        string memory source,
        uint256 timestamp,
        address submitter,
        bool isVerified,
        uint256 verificationCount
    ) {
        Evidence storage ev = evidence[_evidenceId];
        return (
            ev.content,
            ev.source,
            ev.timestamp,
            ev.submitter,
            ev.isVerified,
            ev.verificationCount
        );
    }
    
    function pause() external onlyGovernor {
        _pause();
    }
    
    function unpause() external onlyGovernor {
        _unpause();
    }
} 