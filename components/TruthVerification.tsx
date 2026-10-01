'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TRUTH_VERIFICATION_ADDRESS = process.env.NEXT_PUBLIC_TRUTH_VERIFICATION_ADDRESS;
const TRUTH_VERIFICATION_ABI = [
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

interface Claim {
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

interface Verifier {
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

interface Source {
  reliability: number;
  totalClaims: number;
  verifiedClaims: number;
  disputedClaims: number;
  isWhitelisted: boolean;
  lastUpdate: number;
}

export function TruthVerification() {
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [claims, setClaims] = useState<{ [key: string]: Claim }>({});
  const [sources, setSources] = useState<{ [key: string]: Source }>({});
  const [verifier, setVerifier] = useState<Verifier | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        TRUTH_VERIFICATION_ADDRESS!,
        TRUTH_VERIFICATION_ABI,
        provider
      );

      // Listen for new claims
      contract.on('ClaimSubmitted', async (claimId, content, source, author) => {
        const claim = await contract.getClaim(claimId);
        const sourceData = await contract.getSource(source);
        setClaims(prev => ({
          ...prev,
          [claimId]: claim
        }));
        setSources(prev => ({
          ...prev,
          [source]: sourceData
        }));
      });

      // Listen for verifications
      contract.on('ClaimVerified', async (claimId) => {
        const claim = await contract.getClaim(claimId);
        setClaims(prev => ({
          ...prev,
          [claimId]: claim
        }));
      });

      // Listen for disputes
      contract.on('ClaimDisputed', async (claimId) => {
        const claim = await contract.getClaim(claimId);
        setClaims(prev => ({
          ...prev,
          [claimId]: claim
        }));
      });

      // Listen for stake events
      contract.on('StakeDeposited', async (verifierAddress, amount) => {
        if (verifierAddress === window.ethereum?.selectedAddress) {
          const verifierData = await contract.getVerifier(verifierAddress);
          setVerifier(verifierData);
        }
      });

      contract.on('StakeWithdrawn', async (verifierAddress, amount) => {
        if (verifierAddress === window.ethereum?.selectedAddress) {
          const verifierData = await contract.getVerifier(verifierAddress);
          setVerifier(verifierData);
        }
      });
    }
  }, []);

  const handleSubmitClaim = async () => {
    if (!content || !source) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TRUTH_VERIFICATION_ADDRESS!,
        TRUTH_VERIFICATION_ABI,
        signer
      );

      const tx = await contract.submitClaim(content, source);
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Claim submitted successfully',
      });

      setContent('');
      setSource('');
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit claim',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyClaim = async (claimId: string) => {
    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TRUTH_VERIFICATION_ADDRESS!,
        TRUTH_VERIFICATION_ABI,
        signer
      );

      const tx = await contract.verifyClaim(claimId);
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Claim verified successfully',
      });
    } catch (error) {
      console.error('Error verifying claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify claim',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisputeClaim = async (claimId: string) => {
    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TRUTH_VERIFICATION_ADDRESS!,
        TRUTH_VERIFICATION_ABI,
        signer
      );

      const tx = await contract.disputeClaim(claimId);
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Claim disputed successfully',
      });
    } catch (error) {
      console.error('Error disputing claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to dispute claim',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepositStake = async () => {
    if (!stakeAmount) {
      toast({
        title: 'Error',
        description: 'Please enter stake amount',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TRUTH_VERIFICATION_ADDRESS!,
        TRUTH_VERIFICATION_ABI,
        signer
      );

      const tx = await contract.depositStake({
        value: ethers.parseEther(stakeAmount)
      });
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Stake deposited successfully',
      });

      setStakeAmount('');
    } catch (error) {
      console.error('Error depositing stake:', error);
      toast({
        title: 'Error',
        description: 'Failed to deposit stake',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawStake = async (amount: string) => {
    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TRUTH_VERIFICATION_ADDRESS!,
        TRUTH_VERIFICATION_ABI,
        signer
      );

      const tx = await contract.withdrawStake(ethers.parseEther(amount));
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Stake withdrawn successfully',
      });
    } catch (error) {
      console.error('Error withdrawing stake:', error);
      toast({
        title: 'Error',
        description: 'Failed to withdraw stake',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="submit" className="space-y-8">
      <TabsList>
        <TabsTrigger value="submit">Submit Claim</TabsTrigger>
        <TabsTrigger value="stake">Manage Stake</TabsTrigger>
        <TabsTrigger value="claims">View Claims</TabsTrigger>
      </TabsList>

      <TabsContent value="submit">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Submit a Claim</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the claim content..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <Input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Enter the source..."
              />
              {sources[source] && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Source Reliability</span>
                    <span>{sources[source].reliability}%</span>
                  </div>
                  <Progress value={sources[source].reliability} className="h-2" />
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmitClaim}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="stake">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Manage Your Stake</h2>
          {verifier && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Stake</p>
                  <p className="font-medium">{ethers.formatEther(verifier.totalStake)} ETH</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Locked Stake</p>
                  <p className="font-medium">{ethers.formatEther(verifier.lockedStake)} ETH</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Reputation</p>
                  <p className="font-medium">{verifier.reputation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Successful Verifications</p>
                  <p className="font-medium">{verifier.successfulVerifications}</p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Deposit Amount (ETH)</label>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter amount to deposit..."
                step="0.1"
                min="0.1"
                max="10"
              />
            </div>
            <Button
              onClick={handleDepositStake}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Depositing...' : 'Deposit Stake'}
            </Button>
            {verifier && verifier.lockedStake > 0 && (
              <Button
                variant="outline"
                onClick={() => handleWithdrawStake(ethers.formatEther(verifier.lockedStake))}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Withdrawing...' : 'Withdraw All Stake'}
              </Button>
            )}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="claims">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recent Claims</h2>
          {Object.entries(claims).map(([claimId, claim]) => (
            <Card key={claimId} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{claim.content}</p>
                    <p className="text-sm text-gray-500">Source: {claim.source}</p>
                    {sources[claim.source] && (
                      <div className="mt-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Source Reliability</span>
                          <span>{sources[claim.source].reliability}%</span>
                        </div>
                        <Progress value={sources[claim.source].reliability} className="h-1" />
                      </div>
                    )}
                  </div>
                  <Badge variant={
                    claim.isVerified ? "success" :
                    claim.isDisputed ? "destructive" :
                    "secondary"
                  }>
                    {claim.isVerified ? 'Verified' :
                     claim.isDisputed ? 'Disputed' :
                     'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-x-4">
                    <span className="text-sm text-gray-500">
                      Verifications: {claim.verificationCount}/{claim.verificationThreshold}
                    </span>
                    <span className="text-sm text-gray-500">
                      Disputes: {claim.disputeCount}/{claim.disputeThreshold}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyClaim(claimId)}
                      disabled={isLoading || claim.isVerified || claim.isDisputed}
                    >
                      Verify
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisputeClaim(claimId)}
                      disabled={isLoading || claim.isVerified || claim.isDisputed}
                    >
                      Dispute
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
} 