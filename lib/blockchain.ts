import { ethers } from 'ethers';

export type Network = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base';

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const SUPPORTED_NETWORKS: Record<Network, NetworkConfig> = {
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: process.env.NEXT_PUBLIC_ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    explorerUrl: 'https://etherscan.io',
    currency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  polygon: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/your-api-key',
    explorerUrl: 'https://polygonscan.com',
    currency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb-mainnet.g.alchemy.com/v2/your-api-key',
    explorerUrl: 'https://arbiscan.io',
    currency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://opt-mainnet.g.alchemy.com/v2/your-api-key',
    explorerUrl: 'https://optimistic.etherscan.io',
    currency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  base: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    currency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

export const DEFAULT_NETWORK: Network = 'ethereum';

export function getNetworkConfig(network: Network): NetworkConfig {
  return SUPPORTED_NETWORKS[network];
}

export async function detectNetwork(): Promise<Network> {
  if (typeof window === 'undefined') return DEFAULT_NETWORK;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    
    // Find matching network
    for (const [name, config] of Object.entries(SUPPORTED_NETWORKS)) {
      if (config.chainId === Number(network.chainId)) {
        return name as Network;
      }
    }
    
    return DEFAULT_NETWORK;
  } catch (error) {
    console.error('Failed to detect network:', error);
    return DEFAULT_NETWORK;
  }
}

export function isNetworkSupported(network: Network): boolean {
  return network in SUPPORTED_NETWORKS;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getExplorerUrl(network: Network, address: string): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/address/${address}`;
} 