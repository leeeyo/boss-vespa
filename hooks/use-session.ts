'use client'

import { useEffect, useState } from 'react'
import type { Session } from 'next-auth'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    // Only fetch session in browser
    if (typeof window === 'undefined') {
      return
    }

    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setSession(data)
          setStatus('authenticated')
        } else {
          setSession(null)
          setStatus('unauthenticated')
        }
      })
      .catch(() => {
        setSession(null)
        setStatus('unauthenticated')
      })
  }, [])

  // Always return a valid structure
  return { data: session, status: status || 'loading' }
}

