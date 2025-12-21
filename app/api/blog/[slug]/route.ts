import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Blog from '@/models/Blog'
import { handleError, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB()

    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    const isAdmin = searchParams.get('admin') === 'true'

    const query: { slug: string; isPublished?: boolean } = { slug }
    if (!isAdmin) {
      query.isPublished = true
    }

    const post = await Blog.findOne(query)

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Increment views
    post.views = (post.views || 0) + 1
    await post.save()

    return NextResponse.json(post)
  } catch (error) {
    return handleError(error, 'Failed to fetch blog post')
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { slug } = await params
    const body = await request.json()
    const validatedData = updateBlogSchema.parse(body)

    const existingPost = await Blog.findOne({ slug })
    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // If publishing for the first time, set publishedAt
    const updatePayload: Record<string, unknown> = {
      ...validatedData,
      updatedAt: new Date(),
    }

    if (validatedData.isPublished && !existingPost.isPublished) {
      updatePayload.publishedAt = new Date()
    }

    if (validatedData.isPublished === false) {
      updatePayload.publishedAt = undefined
    }

    const post = await Blog.findOneAndUpdate(
      { slug },
      updatePayload,
      { new: true, runValidators: true }
    )

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to update blog post')
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { slug } = await params
    const post = await Blog.findOneAndDelete({ slug })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    return handleError(error, 'Failed to delete blog post')
  }
}

