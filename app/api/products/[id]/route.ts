import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { requireAdmin, handleError } from '@/lib/api-helpers'
import { generateUniqueSlug } from '@/lib/slug-utils'
import { z } from 'zod'

const updateProductSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  subtitle: z.string().optional().nullable(),
  category: z.enum(['scooter', 'accessory']).optional(),
  isFeaturing: z.boolean().optional(),
  color: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  enginePower: z.number().positive().optional().nullable(),
  price: z.number().positive().optional(),
  currency: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  technicalInfo: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.object({ muxAssetId: z.string(), playbackId: z.string() })).optional(),
  compatibility: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
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
    
    // Clean up the data before validation
    const cleanedBody: any = { ...body }
    
    // Handle NaN values from parseFloat/parseInt - convert to undefined
    if (cleanedBody.price !== undefined && (isNaN(cleanedBody.price) || cleanedBody.price === null || cleanedBody.price <= 0)) {
      delete cleanedBody.price
    }
    if (cleanedBody.stock !== undefined && (isNaN(cleanedBody.stock) || cleanedBody.stock === null || cleanedBody.stock < 0)) {
      delete cleanedBody.stock
    }
    if (cleanedBody.enginePower !== undefined && (isNaN(cleanedBody.enginePower) || cleanedBody.enginePower === null || cleanedBody.enginePower <= 0)) {
      delete cleanedBody.enginePower
    }
    
    // Remove undefined values (but keep null for nullable fields)
    Object.keys(cleanedBody).forEach(key => {
      if (cleanedBody[key] === undefined) {
        delete cleanedBody[key]
      }
      // Convert empty strings to null for nullable fields
      if (cleanedBody[key] === '' && ['subtitle', 'color', 'type', 'description', 'currency'].includes(key)) {
        cleanedBody[key] = null
      }
    })
    
    const validatedData = updateProductSchema.parse(cleanedBody)

    // Generate unique slug if slug is being updated and already exists
    const originalSlug = validatedData.slug
    if (validatedData.slug) {
      const uniqueSlug = await generateUniqueSlug(validatedData.slug, id)
      validatedData.slug = uniqueSlug
    }
    
    const slugWasModified = validatedData.slug && validatedData.slug !== originalSlug
    
    const product = await Product.findByIdAndUpdate(id, validatedData, { new: true, runValidators: true })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...product.toObject(),
      slugModified: slugWasModified,
      originalSlug: slugWasModified ? originalSlug : undefined,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod errors into a readable message
      const errorMessages = error.errors.map(err => {
        const field = err.path.join('.')
        return `${field}: ${err.message}`
      }).join(', ')
      return NextResponse.json({ 
        error: `Validation error: ${errorMessages}`,
        details: error.errors 
      }, { status: 400 })
    }
    console.error('Product update error:', error)
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

