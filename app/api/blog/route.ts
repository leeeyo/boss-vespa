import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Blog from '@/models/Blog'
import { handleError, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

const createBlogSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  content: z.string(),
  image: z.string().optional(),
  videos: z.array(z.object({ muxAssetId: z.string(), playbackId: z.string() })).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.object({ name: z.string(), role: z.string() }).optional(),
  isPublished: z.boolean().optional(),
})

const updateBlogSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
  videos: z.array(z.object({ muxAssetId: z.string(), playbackId: z.string() })).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.object({ name: z.string(), role: z.string() }).optional(),
  isPublished: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const isAdmin = searchParams.get('admin') === 'true'
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const query: Record<string, unknown> = {}

    // Only show published posts unless admin
    if (!isAdmin) {
      query.isPublished = true
    }

    if (category) {
      query.category = category
    }

    if (tag) {
      query.tags = tag
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      Blog.find(query).skip(skip).limit(limit).sort({ publishedAt: -1, createdAt: -1 }),
      Blog.countDocuments(query),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleError(error, 'Failed to fetch blog posts')
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const body = await request.json()
    const validatedData = createBlogSchema.parse(body)

    const existingPost = await Blog.findOne({ slug: validatedData.slug })
    if (existingPost) {
      return NextResponse.json({ error: 'Blog post with this slug already exists' }, { status: 400 })
    }

    const post = new Blog({
      ...validatedData,
      author: validatedData.author || { name: 'Boss Vespa', role: 'Équipe Boss Vespa' },
      isPublished: validatedData.isPublished ?? false,
      publishedAt: validatedData.isPublished ? new Date() : undefined,
      videos: validatedData.videos || [],
      tags: validatedData.tags || [],
    })

    await post.save()

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to create blog post')
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Blog post ID is required' }, { status: 400 })
    }

    const validatedData = updateBlogSchema.parse(updateData)

    // If publishing for the first time, set publishedAt
    const existingPost = await Blog.findById(id)
    const updatePayload: Record<string, unknown> = {
      ...validatedData,
      updatedAt: new Date(),
    }

    if (validatedData.isPublished && existingPost && !existingPost.isPublished) {
      updatePayload.publishedAt = new Date()
    }

    if (validatedData.isPublished === false && existingPost) {
      updatePayload.publishedAt = undefined
    }

    const post = await Blog.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    )

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to update blog post')
  }
}

