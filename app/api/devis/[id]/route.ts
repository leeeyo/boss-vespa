import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Devis from '@/models/Devis'
import { handleError, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

const updateDevisSchema = z.object({
  status: z.enum(['pending', 'contacted', 'quoted', 'closed']).optional(),
  adminNotes: z.string().optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    const { id } = await params
    const devis = await Devis.findById(id).populate('productId')

    if (!devis) {
      return NextResponse.json({ error: 'Devis not found' }, { status: 404 })
    }

    return NextResponse.json(devis)
  } catch (error) {
    return handleError(error, 'Failed to fetch devis')
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params
    const body = await request.json()
    const validatedData = updateDevisSchema.parse(body)

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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params
    const devis = await Devis.findByIdAndDelete(id)

    if (!devis) {
      return NextResponse.json({ error: 'Devis not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Devis deleted successfully' })
  } catch (error) {
    return handleError(error, 'Failed to delete devis')
  }
}

