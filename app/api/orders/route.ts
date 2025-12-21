import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { requireAuth, handleError } from '@/lib/api-helpers'
import { z } from 'zod'

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
  personalizationId: z.string().optional(),
  deliveryAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }),
  deliveryZone: z.string().optional(),
  deliveryRequested: z.boolean().optional(),
  shippingCost: z.number().optional(),
  notes: z.string().optional(),
})

function generateOrderId(): string {
  const randomId = Math.floor(100000 + Math.random() * 900000)
  return `CMD-${randomId}`
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const searchParams = request.nextUrl.searchParams
    const isAdmin = user.role === 'admin'
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const query: Record<string, unknown> = isAdmin ? {} : { userId: user.id }

    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).populate('items.productId').populate('personalizationId'),
      Order.countDocuments(query),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleError(error, 'Failed to fetch orders')
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    await connectDB()

    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)

    // Fetch products and calculate totals
    const productIds = validatedData.items.map((item) => item.productId)
    const products = await Product.find({ _id: { $in: productIds } })

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 400 })
    }

    const items = validatedData.items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId)
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }
      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
      }
    })

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingCost = validatedData.shippingCost || 0
    const total = subtotal + shippingCost

    // Generate unique order ID
    let orderId = generateOrderId()
    let orderExists = await Order.findOne({ orderId })
    while (orderExists) {
      orderId = generateOrderId()
      orderExists = await Order.findOne({ orderId })
    }

    const order = new Order({
      orderId,
      userId: user.id,
      items,
      personalizationId: validatedData.personalizationId,
      subtotal,
      shippingCost,
      total,
      deliveryAddress: validatedData.deliveryAddress,
      deliveryZone: validatedData.deliveryZone,
      deliveryRequested: validatedData.deliveryRequested ?? false,
      paid: false,
      paymentMethod: 'COD',
      status: 'pending',
      notes: validatedData.notes,
    })

    await order.save()

    // Update user's order history
    const User = (await import('@/models/User')).default
    const userDoc = await User.findByIdAndUpdate(
      user.id,
      {
        $push: { orderHistory: order._id },
      },
      { new: true }
    )

    // Send email notifications
    try {
      const { sendOrderConfirmationEmail, sendAdminOrderNotification } = await import('@/lib/email')
      await sendOrderConfirmationEmail(order, user.email, userDoc?.name)
      await sendAdminOrderNotification(order, user.email, userDoc?.name)
    } catch (emailError) {
      console.error('Failed to send email notifications:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to create order')
  }
}

