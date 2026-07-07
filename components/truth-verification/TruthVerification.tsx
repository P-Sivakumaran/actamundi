'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTruthVerification } from './useTruthVerification';

export function TruthVerification() {
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const {
    claims,
    sources,
    verifier,
    isLoading,
    submitClaim,
    verifyClaim,
    disputeClaim,
    depositStake,
    withdrawStake,
  } = useTruthVerification();

  const handleSubmitClaim = async () => {
    const success = await submitClaim(content, source);
    if (success) {
      setContent('');
      setSource('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submit">Submit Claim</TabsTrigger>
          <TabsTrigger value="verify">Verify Claims</TabsTrigger>
          <TabsTrigger value="stake">Manage Stake</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Submit a New Claim</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the claim content..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source</label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Enter the source URL..."
                  className="w-full"
                />
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

        <TabsContent value="verify">
          <div className="space-y-4">
            {Object.entries(claims).map(([claimId, claim]) => (
              <Card key={claimId} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{claim.content}</h3>
                    <p className="text-sm text-muted-foreground">Source: {claim.source}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={claim.isVerified ? 'success' : 'secondary'}>
                      {claim.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                    {claim.isDisputed && (
                      <Badge variant="destructive">Disputed</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <Progress
                    value={(claim.verificationCount / claim.verificationThreshold) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {claim.verificationCount} / {claim.verificationThreshold} verifications
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => verifyClaim(claimId)}
                    disabled={isLoading || claim.isVerified}
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => disputeClaim(claimId)}
                    disabled={isLoading || claim.isDisputed}
                  >
                    Dispute
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stake">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Manage Your Stake</h2>
            {verifier && (
              <div className="mb-4">
                <p className="text-sm">
                  Total Stake: {ethers.formatEther(verifier.totalStake)} ETH
                </p>
                <p className="text-sm">
                  Locked Stake: {ethers.formatEther(verifier.lockedStake)} ETH
                </p>
                <p className="text-sm">
                  Reputation: {verifier.reputation}
                </p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (ETH)</label>
                <Input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => depositStake(stakeAmount)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Depositing...' : 'Deposit'}
                </Button>
                <Button
                  onClick={() => withdrawStake(stakeAmount)}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? 'Withdrawing...' : 'Withdraw'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 