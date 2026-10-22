'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

const WRITER_SUBSCRIPTIONS_ADDRESS = process.env.NEXT_PUBLIC_WRITER_SUBSCRIPTIONS_ADDRESS
// Opt-in per deployment, same as moderation (lib/p2p/moderation.ts) — a
// instance that hasn't deployed/configured the contract yet isn't an error
// state, so every caller below checks this instead of crashing on a bare
// `ethers.Contract(undefined, ...)`.
const WRITER_SUBSCRIPTIONS_CONFIGURED = !!WRITER_SUBSCRIPTIONS_ADDRESS

const WRITER_SUBSCRIPTIONS_ABI = [
  'function subscribe(address writer, uint256 ratePerSecond) external payable',
  'function topUp() external payable',
  'function changeRate(uint256 newRatePerSecond) external',
  'function unsubscribe() external',
  'function reclaim(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function subscriptions(address reader) external view returns (address writer, uint256 ratePerSecond, uint256 lastSettled, uint256 balance)',
  'function pendingEarnings(address writer) external view returns (uint256)',
  'function previewAccrual(address reader) external view returns (uint256 settleable, uint256 remainingBalance)',
  'event Subscribed(address indexed reader, address indexed writer, uint256 ratePerSecond)',
  'event RateChanged(address indexed reader, address indexed writer, uint256 ratePerSecond)',
  'event WriterSwitched(address indexed reader, address indexed oldWriter, address indexed newWriter, uint256 settledAmount)',
  'event Deposited(address indexed reader, uint256 amount)',
  'event Unsubscribed(address indexed reader, address indexed writer, uint256 settledAmount)',
  'event Withdrawn(address indexed writer, uint256 amount)',
]

export const SECONDS_PER_MONTH = 30 * 24 * 60 * 60

export interface WriterSubscription {
  writer: string
  ratePerSecond: bigint
  lastSettled: bigint
  balance: bigint
}

/** Monthly ETH amount a reader types in, converted to the per-second rate the
 * contract actually stores — the contract itself never divides, so very small
 * monthly amounts can truncate to a 0 per-second rate; the UI should warn
 * below roughly `SECONDS_PER_MONTH` wei/month. */
function toRatePerSecond(monthlyEth: string): bigint {
  return ethers.parseEther(monthlyEth) / BigInt(SECONDS_PER_MONTH)
}

/** Reader-chosen, writer-paid streaming ETH subscriptions (see
 * contracts/WriterSubscriptions.sol). Independent of the wallet-address-only
 * NextAuth admin session — same reasoning as useWalletAddress. */
export function useWriterSubscriptions() {
  const [subscription, setSubscription] = useState<WriterSubscription | null>(null)
  const [pendingEarnings, setPendingEarnings] = useState<bigint>(BigInt(0))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getContract = useCallback(async (needsSigner: boolean) => {
    if (!WRITER_SUBSCRIPTIONS_CONFIGURED) throw new Error('Writer subscriptions are not set up on this deployment yet')
    if (typeof window === 'undefined' || !window.ethereum) throw new Error('No wallet found')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signerOrProvider = needsSigner ? await provider.getSigner() : provider
    return new ethers.Contract(WRITER_SUBSCRIPTIONS_ADDRESS!, WRITER_SUBSCRIPTIONS_ABI, signerOrProvider)
  }, [])

  const refreshSubscription = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' })
      const reader = accounts[0]
      if (!reader) return
      const contract = await getContract(false)
      const sub = await contract.subscriptions(reader)
      setSubscription(sub.writer === ethers.ZeroAddress ? null : {
        writer: sub.writer, ratePerSecond: sub.ratePerSecond, lastSettled: sub.lastSettled, balance: sub.balance,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
    }
  }, [getContract])

  const refreshEarnings = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' })
      const writer = accounts[0]
      if (!writer) return
      const contract = await getContract(false)
      setPendingEarnings(await contract.pendingEarnings(writer))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earnings')
    }
  }, [getContract])

  // Keep subscription/earnings live without a manual refresh — same spirit
  // as useTruthVerification's contract.on(...) listeners, filtered to events
  // naming the connected account.
  useEffect(() => {
    if (!WRITER_SUBSCRIPTIONS_CONFIGURED) return
    if (typeof window === 'undefined' || !window.ethereum) return
    let contract: ethers.Contract | undefined
    let cancelled = false

    ;(async () => {
      try {
        contract = await getContract(false)
        if (cancelled) return
        const onChange = () => { refreshSubscription(); refreshEarnings() }
        contract.on('Subscribed', onChange)
        contract.on('RateChanged', onChange)
        contract.on('WriterSwitched', onChange)
        contract.on('Deposited', onChange)
        contract.on('Unsubscribed', onChange)
        contract.on('Withdrawn', onChange)
        refreshSubscription()
        refreshEarnings()
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load writer subscription')
      }
    })()

    return () => {
      cancelled = true
      contract?.removeAllListeners()
    }
  }, [getContract, refreshSubscription, refreshEarnings])

  const runAction = useCallback(async (action: () => Promise<ethers.ContractTransactionResponse>) => {
    setLoading(true)
    setError(null)
    try {
      const tx = await action()
      await tx.wait()
      await Promise.all([refreshSubscription(), refreshEarnings()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [refreshSubscription, refreshEarnings])

  const subscribe = useCallback((writer: string, monthlyEth: string) => runAction(async () => {
    const contract = await getContract(true)
    return contract.subscribe(writer, toRatePerSecond(monthlyEth), { value: ethers.parseEther(monthlyEth) })
  }), [getContract, runAction])

  const topUp = useCallback((ethAmount: string) => runAction(async () => {
    const contract = await getContract(true)
    return contract.topUp({ value: ethers.parseEther(ethAmount) })
  }), [getContract, runAction])

  const changeRate = useCallback((monthlyEth: string) => runAction(async () => {
    const contract = await getContract(true)
    return contract.changeRate(toRatePerSecond(monthlyEth))
  }), [getContract, runAction])

  const unsubscribe = useCallback(() => runAction(async () => {
    const contract = await getContract(true)
    return contract.unsubscribe()
  }), [getContract, runAction])

  const reclaim = useCallback((ethAmount: string) => runAction(async () => {
    const contract = await getContract(true)
    return contract.reclaim(ethers.parseEther(ethAmount))
  }), [getContract, runAction])

  const withdraw = useCallback((ethAmount: string) => runAction(async () => {
    const contract = await getContract(true)
    return contract.withdraw(ethers.parseEther(ethAmount))
  }), [getContract, runAction])

  return {
    subscription, loading, error, pendingEarnings, refreshEarnings,
    subscribe, topUp, changeRate, unsubscribe, reclaim, withdraw,
  }
}
