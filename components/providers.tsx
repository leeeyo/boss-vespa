'use client'

import React from 'react'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  // SessionProvider removed - NextAuth v5 handles sessions server-side via auth()
  // Client components that need session should use server components or fetch session via API
  return (
    <CartProvider>
      <WishlistProvider>
        {children}
        <Toaster />
      </WishlistProvider>
    </CartProvider>
  )
}

