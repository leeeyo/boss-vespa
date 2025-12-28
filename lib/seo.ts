import { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boss-vespa.tn'
const siteName = 'Boss Vespa Mahdia'
const defaultDescription = 'Boss Vespa à Mahdia - Votre destination pour acheter, personnaliser et recevoir votre Vespa avec livraison COD en Tunisie.'

export function generateMetadata({
  title,
  description,
  path = '',
  image,
  type = 'website',
  noindex = false,
}: {
  title: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
}): Metadata {
  // Don't append site name here - let layout.tsx template handle it
  // This prevents double suffix like "Title | Boss Vespa Mahdia | Boss Vespa Mahdia"
  const fullDescription = description || defaultDescription
  const url = `${siteUrl}${path}`
  const ogImage = image || `${siteUrl}/images/hero.jpg`
  // For OG/Twitter, we still want the full title with site name
  const fullTitleForOG = title.includes(siteName) ? title : `${title} | ${siteName}`

  // If title already includes site name, use absolute to bypass layout template
  // Otherwise, let the layout template append the site name
  const titleConfig = title.includes(siteName) 
    ? { absolute: title } 
    : title

  return {
    title: titleConfig,
    description: fullDescription,
    keywords: ['vespa', 'mahdia', 'tunisie', 'scooter', 'personnalisation', 'livraison', 'boss vespa'],
    authors: [{ name: 'Boss Vespa' }],
    creator: 'Boss Vespa',
    publisher: 'Boss Vespa',
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      locale: 'fr_TN',
      url,
      siteName,
      title: fullTitleForOG,
      description: fullDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitleForOG,
      description: fullDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
    metadataBase: new URL(siteUrl),
  }
}

export function generateStructuredData(type: 'Organization' | 'Product' | 'Article' | 'BreadcrumbList', data: any) {
  const baseUrl = siteUrl

  switch (type) {
    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+216-97-310-394',
          contactType: 'customer service',
          areaServed: 'TN',
          availableLanguage: ['fr', 'ar'],
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Mahdia',
          addressCountry: 'TN',
        },
        sameAs: [
          // Add social media URLs when available
        ],
        ...data,
      }

    case 'Product':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: data.images || [],
        brand: {
          '@type': 'Brand',
          name: 'Vespa',
        },
        offers: {
          '@type': 'Offer',
          price: data.price?.replace(/[^\d]/g, '') || '0',
          priceCurrency: 'TND',
          availability: data.availability || 'https://schema.org/InStock',
          url: `${baseUrl}/product/${data.slug}`,
        },
        ...data,
      }

    case 'Article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        image: data.image || `${baseUrl}/images/hero.jpg`,
        datePublished: data.publishedAt,
        dateModified: data.updatedAt || data.publishedAt,
        author: {
          '@type': 'Organization',
          name: siteName,
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
          },
        },
        ...data,
      }

    case 'BreadcrumbList':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${baseUrl}${item.url}`,
        })),
      }

    default:
      return {}
  }
}

