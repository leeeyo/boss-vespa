'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
          <Toaster />
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  )
}

