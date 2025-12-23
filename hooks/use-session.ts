'use client'

import { useEffect, useState, useMemo } from 'react'
import type { Session } from 'next-auth'

interface UseSessionReturn {
  data: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    // Only fetch session in browser
    if (typeof window === 'undefined') {
      setStatus('unauthenticated')
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

  // Use useMemo to ensure we always return a stable reference
  return useMemo(() => ({ 
    data: session, 
    status: status 
  }), [session, status])
}

