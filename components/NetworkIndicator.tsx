'use client'

import { useEffect, useState } from 'react';
import { Network, detectNetwork, getNetworkConfig } from '@/lib/blockchain';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CopyIcon, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkIndicator() {
  const [mounted, setMounted] = useState(false);
  const [network, setNetwork] = useState<Network>('ethereum');
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkConnection = async () => {
      if (typeof window === 'undefined') return;

      try {
        if (!window.ethereum) {
          setIsConnected(false);
          return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        }

        const detectedNetwork = await detectNetwork();
        setNetwork(detectedNetwork);

        window.ethereum.on('chainChanged', async () => {
          const newNetwork = await detectNetwork();
          setNetwork(newNetwork);
        });

        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          } else {
            setAddress(null);
            setIsConnected(false);
          }
        });
      } catch (error) {
        console.error('Failed to connect:', error);
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  const handleConnect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to use this dApp');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show skeleton UI during server rendering to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center">
        <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
      </div>
    );
  }

  const networkConfig = getNetworkConfig(network);

  // Enhanced styling for the wallet connection display
  return (
    <div className="flex items-center">
      {isConnected ? (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "flex items-center gap-1.5 h-8 px-2 text-xs font-medium rounded-md",
              networkConfig.color === 'green' ? "border-green-600 bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100 dark:border-green-600" : 
              networkConfig.color === 'purple' ? "border-purple-600 bg-purple-100 text-purple-900 dark:bg-purple-900/50 dark:text-purple-100 dark:border-purple-600" : 
              networkConfig.color === 'red' ? "border-red-600 bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100 dark:border-red-600" :
              networkConfig.color === 'orange' ? "border-orange-600 bg-orange-100 text-orange-900 dark:bg-orange-900/50 dark:text-orange-100 dark:border-orange-600" :
              "border-blue-600 bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100 dark:border-blue-600"
            )}
          >
            <div className={cn(
              "h-2 w-2 rounded-full",
              networkConfig.color === 'green' ? "bg-green-600 dark:bg-green-400" : 
              networkConfig.color === 'purple' ? "bg-purple-600 dark:bg-purple-400" : 
              networkConfig.color === 'red' ? "bg-red-600 dark:bg-red-400" :
              networkConfig.color === 'orange' ? "bg-orange-600 dark:bg-orange-400" :
              "bg-blue-600 dark:bg-blue-400"
            )} />
            <span className="hidden sm:inline">{networkConfig.name}</span>
          </Badge>

          <Badge 
            variant="secondary" 
            className="group flex items-center gap-1.5 h-8 px-2 cursor-pointer hover:bg-secondary/80 rounded-md bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
            onClick={copyAddress}
          >
            <Wallet className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
            <span className="font-mono text-xs truncate max-w-[80px] sm:max-w-[120px] font-medium">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
            </span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 ml-1" />
            ) : (
              <CopyIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-gray-700 dark:text-gray-300" />
            )}
          </Badge>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleConnect} 
          className="flex items-center gap-1.5 h-8 rounded-md bg-white text-gray-900 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <Wallet className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Connect</span>
        </Button>
      )}
    </div>
  );
} 