'use client'

import { useState, useEffect } from 'react'

export interface PassportScore {
  configured: boolean
  score: number | null
  passingScore: boolean
  threshold: number | null
}

/** Fetch-once per address — a score changing mid-session isn't something a
 * reader needs to see update live, unlike follow/comments. Mirrors
 * use-profile.ts's shape. */
export function usePassportScore(address: string) {
  const [data, setData] = useState<PassportScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/identity/passport-score?address=${encodeURIComponent(address)}`)
      .then(async (res) => {
        const body = await res.json()
        if (cancelled) return
        if (res.status === 503) {
          setData({ configured: false, score: null, passingScore: false, threshold: null })
          return
        }
        if (!res.ok) throw new Error(body.error || 'Passport lookup failed')
        setData(body)
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Passport lookup failed') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [address])

  return { ...data, loading, error }
}
