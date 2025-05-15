'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/components/ui/use-toast';
import { Claim, Verifier, Source, TRUTH_VERIFICATION_ABI } from './types';

const TRUTH_VERIFICATION_ADDRESS = process.env.NEXT_PUBLIC_TRUTH_VERIFICATION_ADDRESS;

export function useTruthVerification() {
  const [claims, setClaims] = useState<{ [key: string]: Claim }>({});
  const [sources, setSources] = useState<{ [key: string]: Source }>({});
  const [verifier, setVerifier] = useState<Verifier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
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
        if (verifierAddress === window.ethereum.selectedAddress) {
          const verifierData = await contract.getVerifier(verifierAddress);
          setVerifier(verifierData);
        }
      });

      contract.on('StakeWithdrawn', async (verifierAddress, amount) => {
        if (verifierAddress === window.ethereum.selectedAddress) {
          const verifierData = await contract.getVerifier(verifierAddress);
          setVerifier(verifierData);
        }
      });
    }
  }, []);

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(
      TRUTH_VERIFICATION_ADDRESS!,
      TRUTH_VERIFICATION_ABI,
      signer
    );
  };

  const submitClaim = async (content: string, source: string) => {
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
      const contract = await getContract();
      const tx = await contract.submitClaim(content, source);
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Claim submitted successfully',
      });

      return true;
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit claim',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyClaim = async (claimId: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.verifyClaim(claimId);
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Claim verified successfully',
      });
      return true;
    } catch (error) {
      console.error('Error verifying claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify claim',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disputeClaim = async (claimId: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.disputeClaim(claimId);
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Claim disputed successfully',
      });
      return true;
    } catch (error) {
      console.error('Error disputing claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to dispute claim',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const depositStake = async (amount: string) => {
    if (!amount) {
      toast({
        title: 'Error',
        description: 'Please enter stake amount',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.depositStake({ value: ethers.parseEther(amount) });
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Stake deposited successfully',
      });
      return true;
    } catch (error) {
      console.error('Error depositing stake:', error);
      toast({
        title: 'Error',
        description: 'Failed to deposit stake',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawStake = async (amount: string) => {
    if (!amount) {
      toast({
        title: 'Error',
        description: 'Please enter amount to withdraw',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.withdrawStake(ethers.parseEther(amount));
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Stake withdrawn successfully',
      });
      return true;
    } catch (error) {
      console.error('Error withdrawing stake:', error);
      toast({
        title: 'Error',
        description: 'Failed to withdraw stake',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    claims,
    sources,
    verifier,
    isLoading,
    submitClaim,
    verifyClaim,
    disputeClaim,
    depositStake,
    withdrawStake,
  };
} 