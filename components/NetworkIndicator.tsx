import { useEffect, useState } from 'react';
import { Network, detectNetwork, getNetworkConfig } from '@/lib/blockchain';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WalletIcon } from '@heroicons/react/24/outline';

export function NetworkIndicator() {
  const [network, setNetwork] = useState<Network>('ethereum');
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
          setIsConnected(false);
          return;
        }

        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        }

        // Detect network
        const detectedNetwork = await detectNetwork();
        setNetwork(detectedNetwork);

        // Listen for network changes
        window.ethereum.on('chainChanged', async () => {
          const newNetwork = await detectNetwork();
          setNetwork(newNetwork);
        });

        // Listen for account changes
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

  const networkConfig = getNetworkConfig(network);

  return (
    <div className="flex items-center gap-4">
      {isConnected ? (
        <>
          <Badge variant="outline" className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            {networkConfig.name}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4" />
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
          </Badge>
        </>
      ) : (
        <Button variant="outline" onClick={handleConnect} className="flex items-center gap-2">
          <WalletIcon className="h-4 w-4" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
} 