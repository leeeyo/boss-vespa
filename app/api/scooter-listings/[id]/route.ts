import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ScooterListing from '@/models/ScooterListing'
import { handleError, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

const updateListingSchema = z.object({
  status: z.enum(['pending', 'under_review', 'negotiating', 'purchased', 'rejected']).optional(),
  adminNotes: z.string().optional(),
  offeredPrice: z.number().min(0).optional(),
})

// GET - Get single listing (admin only)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    const { id } = await params
    const listing = await ScooterListing.findById(id)

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json(listing)
  } catch (error) {
    return handleError(error, 'Failed to fetch scooter listing')
  }
}

// PATCH - Update listing (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params
    const body = await request.json()
    const validatedData = updateListingSchema.parse(body)

    const listing = await ScooterListing.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json(listing)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to update scooter listing')
  }
}

// DELETE - Delete listing (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params
    const listing = await ScooterListing.findByIdAndDelete(id)

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Listing deleted successfully' })
  } catch (error) {
    return handleError(error, 'Failed to delete scooter listing')
  }
}

