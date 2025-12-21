import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAuth, handleError, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']).optional(),
  paid: z.boolean().optional(),
  notes: z.string().optional(),
  shippingCost: z.number().optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const { id } = await params
    const order = await Order.findById(id).populate('items.productId').populate('personalizationId')

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Users can only view their own orders unless they're admin
    if (user.role !== 'admin' && order.userId.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return handleError(error, 'Failed to fetch order')
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params
    const body = await request.json()
    const validatedData = updateOrderSchema.parse(body)

    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Recalculate total if shipping cost changes
    if (validatedData.shippingCost !== undefined) {
      order.shippingCost = validatedData.shippingCost
      order.total = order.subtotal + order.shippingCost
    }

    if (validatedData.status) {
      order.status = validatedData.status
    }

    if (validatedData.paid !== undefined) {
      order.paid = validatedData.paid
    }

    if (validatedData.notes !== undefined) {
      order.notes = validatedData.notes
    }

    await order.save()

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to update order')
  }
}

