'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { VespaProduct } from '@/data/vespa'

export type CartItem = VespaProduct & {
  quantity: number
  selectedColor?: string                                        
  productId?: string // Backend MongoDB _id for API calls
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: VespaProduct, productId?: string) => void
  removeItem: (slug: string) => void
  updateQuantity: (slug: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getCartTotal: () => string
  getCartTotalNumeric: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Helper to load cart from localStorage (runs only on client)
function getInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const storedCart = localStorage.getItem('boss-vespa-cart')
    if (storedCart) {
      return JSON.parse(storedCart)
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error)
  }
  return []
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initializer to load from localStorage synchronously on first render
  const [items, setItems] = useState<CartItem[]>(getInitialCart)
  const isFirstRender = useRef(true)

  // Save to localStorage whenever items change (skip first render to avoid double-write)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    try {
      localStorage.setItem('boss-vespa-cart', JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }, [items])

  const addItem = (product: VespaProduct, productId?: string) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.slug === product.slug)
      if (existingItem) {
        return prevItems.map((item) =>
          item.slug === product.slug
            ? { ...item, quantity: item.quantity + 1, productId: productId || item.productId }
            : item
        )
      }
      return [...prevItems, { ...product, quantity: 1, productId }]
    })
  }

  const removeItem = (slug: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.slug !== slug))
  }

  const updateQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(slug)
      return
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.slug === slug ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartTotal = () => {
    const total = items.reduce((sum, item) => {
      const numericPrice = parseInt(item.price.replace(/\s/g, '').replace('TND', ''))
      return sum + numericPrice * item.quantity
    }, 0)
    
    // Format as "XX XXX TND"
    return new Intl.NumberFormat('fr-TN').format(total).replace(/\s/g, ' ') + ' TND'
  }

  const getCartTotalNumeric = () => {
    return items.reduce((sum, item) => {
      const numericPrice = parseInt(item.price.replace(/\s/g, '').replace('TND', ''))
      return sum + numericPrice * item.quantity
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getCartTotal,
        getCartTotalNumeric,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

