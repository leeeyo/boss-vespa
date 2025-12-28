'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { generateStructuredData } from '@/lib/seo'
import { StructuredData } from '@/components/structured-data'

type BreadcrumbItem = {
  name: string
  url?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const allItems = [
    { name: 'Accueil', url: '/' },
    ...items,
  ]

  // Only include items with URLs in structured data
  const itemsWithUrls = allItems.filter(item => item.url)
  const structuredData = generateStructuredData('BreadcrumbList', { items: itemsWithUrls })

  return (
    <>
      <StructuredData data={structuredData} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/60 mb-6">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          
          return (
            <span key={item.url || item.name} className="flex items-center gap-2">
              {index === 0 && item.url ? (
                <Link 
                  href={item.url} 
                  className="hover:text-white transition-colors flex items-center gap-1"
                  aria-label="Accueil"
                >
                  <Home className="w-4 h-4" />
                </Link>
              ) : item.url ? (
                <Link 
                  href={item.url} 
                  className={`hover:text-white transition-colors ${isLast ? 'text-white font-semibold' : ''}`}
                >
                  {item.name}
                </Link>
              ) : (
                <span className={`${isLast ? 'text-white font-semibold' : ''}`}>
                  {item.name}
                </span>
              )}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </span>
          )
        })}
      </nav>
    </>
  )
}

