'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

/**
 * Connected wallet address, independent of the NextAuth email/password
 * session — admin p2p writes are authorized by wallet signature
 * (see lib/p2p/access-controller.ts), not by the admin login.
 */
export function useWalletAddress() {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return

    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      setAddress(accounts[0] ?? null)
    })

    const handleAccountsChanged = (accounts: string[]) => setAddress(accounts[0] ?? null)
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    return () => window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
  }, [])

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet found')
    }
    setConnecting(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts: string[] = await provider.send('eth_requestAccounts', [])
      setAddress(accounts[0] ?? null)
    } finally {
      setConnecting(false)
    }
  }, [])

  return { address, connecting, connect }
}
