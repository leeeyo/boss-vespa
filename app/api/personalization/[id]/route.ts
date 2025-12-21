import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Personalization from '@/models/Personalization'
import { requireAuth, handleError, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

const updatePersonalizationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
  adminNotes: z.string().optional(),
  estimatedPrice: z.number().optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const { id } = await params
    const personalization = await Personalization.findById(id).populate('accessories')

    if (!personalization) {
      return NextResponse.json({ error: 'Personalization not found' }, { status: 404 })
    }

    // Users can only view their own personalizations unless they're admin
    if (user.role !== 'admin' && personalization.userId.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(personalization)
  } catch (error) {
    return handleError(error, 'Failed to fetch personalization')
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params
    const body = await request.json()
    const validatedData = updatePersonalizationSchema.parse(body)

    const personalization = await Personalization.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    }).populate('accessories')

    if (!personalization) {
      return NextResponse.json({ error: 'Personalization not found' }, { status: 404 })
    }

    return NextResponse.json(personalization)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to update personalization')
  }
}

