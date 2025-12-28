import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ScooterListing from '@/models/ScooterListing'
import { handleError, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

const createListingSchema = z.object({
  // Seller contact
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  location: z.string().min(2, 'La localisation est requise'),
  // Scooter details
  brand: z.string().min(1, 'La marque est requise'),
  scooterModel: z.string().min(1, 'Le modèle est requis'),
  year: z.number().min(1950).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'La couleur est requise'),
  // Condition
  mileage: z.number().min(0, 'Le kilométrage doit être positif'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  // Details
  description: z.string().optional(),
  askingPrice: z.number().min(0, 'Le prix doit être positif'),
  images: z.array(z.string()).min(1, 'Au moins une photo est requise'),
})

// GET - List all scooter listings (admin only)
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

    if (status && status !== 'all') {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [listings, total] = await Promise.all([
      ScooterListing.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      ScooterListing.countDocuments(query),
    ])

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleError(error, 'Failed to fetch scooter listings')
  }
}

// POST - Create new listing (public)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const validatedData = createListingSchema.parse(body)

    const listing = new ScooterListing({
      ...validatedData,
      status: 'pending',
    })

    await listing.save()

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to create scooter listing')
  }
}

