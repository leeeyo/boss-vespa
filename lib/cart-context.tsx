'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { VespaProduct } from '@/data/vespa'

export type CartItem = VespaProduct & {
  quantity: number
  selectedColor?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: VespaProduct) => void
  removeItem: (slug: string) => void
  updateQuantity: (slug: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getCartTotal: () => string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('boss-vespa-cart')
      if (storedCart) {
        setItems(JSON.parse(storedCart))
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
    setIsInitialized(true)
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem('boss-vespa-cart', JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }, [items, isInitialized])

  const addItem = (product: VespaProduct) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.slug === product.slug)
      if (existingItem) {
        return prevItems.map((item) =>
          item.slug === product.slug
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevItems, { ...product, quantity: 1 }]
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

