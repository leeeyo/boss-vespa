import connectDB from './mongodb'
import Blog, { IBlog } from '@/models/Blog'
import { BlogPost } from '@/data/blog'

/**
 * Transform database blog model to component interface
 */
function transformBlogToBlogPost(blog: IBlog | Record<string, unknown>): BlogPost {
  const blogObj = blog as IBlog
  return {
    slug: blogObj.slug,
    title: blogObj.title,
    description: blogObj.description || '',
    content: blogObj.content,
    publishedAt: blogObj.publishedAt 
      ? (blogObj.publishedAt instanceof Date ? blogObj.publishedAt.toISOString() : String(blogObj.publishedAt))
      : new Date().toISOString(),
    updatedAt: blogObj.updatedAt 
      ? (blogObj.updatedAt instanceof Date ? blogObj.updatedAt.toISOString() : String(blogObj.updatedAt))
      : undefined,
    image: blogObj.image || '',
    category: blogObj.category || '',
    tags: blogObj.tags || [],
    author: blogObj.author || { name: 'Boss Vespa', role: 'Équipe' },
  }
}

/**
 * Fetch all published blog posts
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  await connectDB()
  const posts = await Blog.find({ isPublished: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean()
  console.log(`[DB] Fetched ${posts.length} blog posts from database`)
  return posts.map(transformBlogToBlogPost)
}

/**
 * Fetch a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  await connectDB()
  const post = await Blog.findOne({ slug, isPublished: true })
  if (!post) return null
  
  // Increment views
  post.views = (post.views || 0) + 1
  await post.save()
  
  return transformBlogToBlogPost(post)
}

/**
 * Fetch blog posts by category
 */
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  await connectDB()
  const posts = await Blog.find({ 
    category, 
    isPublished: true 
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean()
  return posts.map(transformBlogToBlogPost)
}

