export interface Claim {
  content: string;
  source: string;
  timestamp: number;
  author: string;
  verificationCount: number;
  disputeCount: number;
  isVerified: boolean;
  isDisputed: boolean;
  verificationThreshold: number;
  disputeThreshold: number;
}

export interface Verifier {
  reputation: number;
  successfulVerifications: number;
  failedVerifications: number;
  successfulDisputes: number;
  failedDisputes: number;
  isActive: boolean;
  joinDate: number;
  lastActivity: number;
  totalStake: number;
  lockedStake: number;
}

export interface Source {
  reliability: number;
  totalClaims: number;
  verifiedClaims: number;
  disputedClaims: number;
  isWhitelisted: boolean;
  lastUpdate: number;
}

export const TRUTH_VERIFICATION_ABI = [
  "function submitClaim(string _content, string _source) external returns (bytes32)",
  "function verifyClaim(bytes32 _claimId) external",
  "function disputeClaim(bytes32 _claimId) external",
  "function depositStake() external payable",
  "function withdrawStake(uint256 amount) external",
  "function getClaim(bytes32 _claimId) external view returns (string content, string source, uint256 timestamp, address author, uint256 verificationCount, uint256 disputeCount, bool isVerified, bool isDisputed, uint256 verificationThreshold, uint256 disputeThreshold)",
  "function getVerifier(address _verifier) external view returns (uint256 reputation, uint256 successfulVerifications, uint256 failedVerifications, uint256 successfulDisputes, uint256 failedDisputes, bool isActive, uint256 joinDate, uint256 lastActivity, uint256 totalStake, uint256 lockedStake)",
  "function getSource(string _source) external view returns (uint256 reliability, uint256 totalClaims, uint256 verifiedClaims, uint256 disputedClaims, bool isWhitelisted, uint256 lastUpdate)",
  "event ClaimSubmitted(bytes32 indexed claimId, string content, string source, address author)",
  "event ClaimVerified(bytes32 indexed claimId, address verifier)",
  "event ClaimDisputed(bytes32 indexed claimId, address disputer)",
  "event StakeDeposited(address indexed verifier, uint256 amount)",
  "event StakeWithdrawn(address indexed verifier, uint256 amount)"
]; 