import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Devis from '@/models/Devis'
import { handleError, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

const createDevisSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  productId: z.string().optional(),
  message: z.string().optional(),
  media: z.array(z.string()).optional(),
})

const updateDevisSchema = z.object({
  status: z.enum(['pending', 'contacted', 'quoted', 'closed']).optional(),
  adminNotes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const query: Record<string, unknown> = {}

    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [devis, total] = await Promise.all([
      Devis.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).populate('productId'),
      Devis.countDocuments(query),
    ])

    return NextResponse.json({
      devis,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleError(error, 'Failed to fetch devis')
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const validatedData = createDevisSchema.parse(body)

    // Validate productId if provided
    if (validatedData.productId) {
      const Product = (await import('@/models/Product')).default
      const product = await Product.findById(validatedData.productId)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 400 })
      }
    }

    const devis = new Devis({
      ...validatedData,
      status: 'pending',
      media: validatedData.media || [],
    })

    await devis.save()

    return NextResponse.json(devis, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to create devis')
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
      return NextResponse.json({ error: 'Devis ID is required' }, { status: 400 })
    }

    const validatedData = updateDevisSchema.parse(updateData)

    const devis = await Devis.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    }).populate('productId')

    if (!devis) {
      return NextResponse.json({ error: 'Devis not found' }, { status: 404 })
    }

    return NextResponse.json(devis)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to update devis')
  }
}

