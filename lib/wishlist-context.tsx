'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { VespaProduct } from '@/data/vespa'
import { useToast } from '@/hooks/use-toast'

type WishlistContextType = {
  items: VespaProduct[]
  addToWishlist: (product: VespaProduct) => void
  removeFromWishlist: (slug: string) => void
  isInWishlist: (slug: string) => boolean
  getWishlistCount: () => number
  toggleWishlist: (product: VespaProduct) => void
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<VespaProduct[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('boss-vespa-wishlist')
      if (storedWishlist) {
        setItems(JSON.parse(storedWishlist))
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error)
    }
    setIsInitialized(true)
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem('boss-vespa-wishlist', JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save wishlist to localStorage:', error)
    }
  }, [items, isInitialized])

  const addToWishlist = (product: VespaProduct) => {
    setItems((prevItems) => {
      if (prevItems.some((item) => item.slug === product.slug)) {
        return prevItems
      }
      return [...prevItems, product]
    })
    toast({
      title: 'Ajouté à la liste de souhaits',
      description: `${product.name} a été ajouté à vos favoris.`,
    })
  }

  const removeFromWishlist = (slug: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.slug !== slug))
    toast({
      title: 'Retiré de la liste de souhaits',
      description: 'Produit retiré de vos favoris.',
    })
  }

  const isInWishlist = (slug: string) => {
    return items.some((item) => item.slug === slug)
  }

  const getWishlistCount = () => {
    return items.length
  }

  const toggleWishlist = (product: VespaProduct) => {
    if (isInWishlist(product.slug)) {
      removeFromWishlist(product.slug)
    } else {
      addToWishlist(product)
    }
  }

  const clearWishlist = () => {
    setItems([])
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistCount,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

