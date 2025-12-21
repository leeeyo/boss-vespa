import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { requireAdmin, handleError } from '@/lib/api-helpers'
import { z } from 'zod'

const updateProductSchema = z.object({
  slug: z.string().optional(),
  name: z.string().optional(),
  subtitle: z.string().optional(),
  category: z.enum(['scooter', 'accessory']).optional(),
  isFeaturing: z.boolean().optional(),
  color: z.string().optional(),
  type: z.string().optional(),
  enginePower: z.number().positive().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  technicalInfo: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.object({ muxAssetId: z.string(), playbackId: z.string() })).optional(),
  compatibility: z.array(z.string()).optional(),
  stock: z.number().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const product = await Product.findById(id)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return handleError(error, 'Failed to fetch product')
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params
    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    if (validatedData.slug) {
      const existingProduct = await Product.findOne({ slug: validatedData.slug, _id: { $ne: id } })
      if (existingProduct) {
        return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 400 })
      }
    }

    const product = await Product.findByIdAndUpdate(id, validatedData, { new: true, runValidators: true })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to update product')
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params
    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    return handleError(error, 'Failed to delete product')
  }
}

