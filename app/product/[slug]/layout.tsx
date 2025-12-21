import { Metadata } from 'next'
import { getProductBySlug } from '@/lib/products'
import { generateMetadata as genMeta } from '@/lib/seo'
import { generateStructuredData } from '@/lib/seo'
import { StructuredData } from '@/components/structured-data'

type ProductLayoutProps = {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return genMeta({
      title: 'Produit non trouvé',
      description: 'Le produit demandé est introuvable.',
      path: `/product/${slug}`,
      noindex: true,
    })
  }

  return genMeta({
    title: `${product.name} - ${product.subtitle}`,
    description: `${product.description} Prix: ${product.price}. Disponible à Boss Vespa Mahdia avec livraison en Tunisie.`,
    path: `/product/${slug}`,
    image: product.images[0] || '/images/hero.jpg',
  })
}

export default async function ProductLayout({ params, children }: ProductLayoutProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return <>{children}</>
  }

  const productSchema = generateStructuredData('Product', {
    name: product.name,
    description: product.description,
    images: product.images.map(img => `${process.env.NEXT_PUBLIC_SITE_URL || 'https://boss-vespa.tn'}${img}`),
    price: product.price,
    availability: 'https://schema.org/InStock',
    slug: product.slug,
    category: product.category,
    color: product.color,
  })

  return (
    <>
      <StructuredData data={productSchema} />
      {children}
    </>
  )
}

