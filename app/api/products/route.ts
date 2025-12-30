import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { requireAdmin, handleError } from '@/lib/api-helpers'
import { generateUniqueSlug } from '@/lib/slug-utils'
import { z } from 'zod'

const productSchema = z.object({
  slug: z.string(),
  name: z.string(),
  subtitle: z.string().optional(),
  category: z.enum(['scooter', 'accessory']),
  isFeaturing: z.boolean().optional(),
  color: z.string().optional(),
  type: z.string().optional(),
  enginePower: z.number().positive().optional(),
  price: z.number(),
  currency: z.string().optional(),
  description: z.string().optional(),
  technicalInfo: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.object({ muxAssetId: z.string(), playbackId: z.string() })).optional(),
  featuredMediaIndex: z.number().int().min(0).optional(),
  compatibility: z.array(z.string()).optional(),
  stock: z.number().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const color = searchParams.get('color')
    const enginePower = searchParams.get('enginePower')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const isFeaturing = searchParams.get('isFeaturing')
    const isActive = searchParams.get('isActive') ?? 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    interface ProductQuery {
      category?: string
      isActive?: boolean
      isFeaturing?: boolean
      color?: string
      enginePower?: number
      price?: {
        $gte?: number
        $lte?: number
      }
      $or?: Array<{
        name?: { $regex: string; $options: string }
        subtitle?: { $regex: string; $options: string }
        description?: { $regex: string; $options: string }
      }>
    }

    const query: ProductQuery = {}

    if (category && category !== 'all') {
      query.category = category
    }

    if (isActive === 'true') {
      query.isActive = true
    }

    if (isFeaturing === 'true') {
      query.isFeaturing = true
    }

    if (color) {
      query.color = color
    }

    if (enginePower) {
      query.enginePower = parseInt(enginePower)
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseFloat(minPrice)
      if (maxPrice) query.price.$lte = parseFloat(maxPrice)
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleError(error, 'Failed to fetch products')
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Generate unique slug if the provided one already exists
    const uniqueSlug = await generateUniqueSlug(validatedData.slug)
    const slugWasModified = uniqueSlug !== validatedData.slug

    const product = new Product({
      ...validatedData,
      slug: uniqueSlug,
      currency: validatedData.currency || 'TND',
      stock: validatedData.stock ?? 0,
      isActive: validatedData.isActive ?? true,
      isFeaturing: validatedData.isFeaturing ?? false,
      featuredMediaIndex: validatedData.featuredMediaIndex,
    })

    await product.save()

    return NextResponse.json({
      ...product.toObject(),
      slugModified: slugWasModified,
      originalSlug: slugWasModified ? validatedData.slug : undefined,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to create product')
  }
}

