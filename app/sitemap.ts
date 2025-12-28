import type { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Blog from '@/models/Blog'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boss-vespa.tn'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/collection`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/personalization`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/livraison`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sell`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cart`,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/wishlist`,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/checkout`,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  // Fetch dynamic content from database
  let productPages: MetadataRoute.Sitemap = []
  let blogPages: MetadataRoute.Sitemap = []

  try {
    await connectDB()

    // Fetch all active products
    const products = await Product.find({ isActive: true })
      .select('slug updatedAt')
      .lean()

    productPages = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Fetch all published blog posts
    const blogPosts = await Blog.find({ isPublished: true })
      .select('slug updatedAt publishedAt')
      .lean()

    blogPages = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt 
        ? new Date(post.updatedAt) 
        : post.publishedAt 
          ? new Date(post.publishedAt) 
          : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    // Log error but don't fail sitemap generation
    console.error('[Sitemap] Error fetching dynamic content:', error)
  }

  return [...staticPages, ...productPages, ...blogPages]
}
