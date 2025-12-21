import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Personalization from '@/models/Personalization'
import { handleError, requireAdmin, getCurrentUser } from '@/lib/api-helpers'
import { z } from 'zod'
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email'

// Schema for creating a personalization request (public - no auth required)
const createPersonalizationSchema = z.object({
  color: z.string(),
  vespaModel: z.string(),
  type: z.string().optional(),
  enginePower: z.number().optional(),
  selectedProductSlug: z.string().optional(),
  accessories: z.array(z.string()).optional(),
  contactInfo: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Phone is required'),
    address: z.string().optional(),
  }),
  deliveryPreference: z.enum(['pickup', 'delivery']).default('pickup'),
  notes: z.string().optional(),
  estimatedPrice: z.number().optional(),
})

// Schema for admin updates
const updatePersonalizationSchema = z.object({
  status: z.enum(['pending', 'contacted', 'quoted', 'approved', 'rejected', 'completed']).optional(),
  adminNotes: z.string().optional(),
  estimatedPrice: z.number().optional(),
  finalPrice: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    const searchParams = request.nextUrl.searchParams
    const isAdmin = user?.role === 'admin'
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Non-authenticated users can't view personalizations
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const query: Record<string, unknown> = isAdmin ? {} : { userId: user.id }

    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [personalizations, total] = await Promise.all([
      Personalization.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Personalization.countDocuments(query),
    ])

    return NextResponse.json({
      personalizations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleError(error, 'Failed to fetch personalizations')
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const validatedData = createPersonalizationSchema.parse(body)

    // Get current user if logged in (optional)
    const user = await getCurrentUser()

    const personalization = new Personalization({
      userId: user?.id,
      color: validatedData.color,
      vespaModel: validatedData.vespaModel,
      type: validatedData.type,
      enginePower: validatedData.enginePower,
      selectedProductSlug: validatedData.selectedProductSlug,
      accessories: validatedData.accessories || [],
      contactInfo: validatedData.contactInfo,
      deliveryPreference: validatedData.deliveryPreference,
      notes: validatedData.notes,
      estimatedPrice: validatedData.estimatedPrice,
      status: 'pending',
    })

    await personalization.save()

    // Send confirmation email to customer
    try {
      await sendOrderConfirmationEmail({
        orderId: personalization._id.toString(),
        customerEmail: validatedData.contactInfo.email,
        customerName: validatedData.contactInfo.name,
        items: [
          {
            name: `Vespa ${validatedData.vespaModel} - Couleur: ${validatedData.color}`,
            quantity: 1,
            price: validatedData.estimatedPrice || 0,
          },
        ],
        total: validatedData.estimatedPrice || 0,
        deliveryAddress: validatedData.contactInfo.address || 'Retrait en magasin',
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    // Send notification to admin
    try {
      await sendAdminNotificationEmail({
        orderId: personalization._id.toString(),
        customerEmail: validatedData.contactInfo.email,
        customerName: validatedData.contactInfo.name,
        items: [
          {
            name: `Vespa ${validatedData.vespaModel} - Couleur: ${validatedData.color}`,
            quantity: 1,
            price: validatedData.estimatedPrice || 0,
          },
        ],
        total: validatedData.estimatedPrice || 0,
        deliveryAddress: validatedData.contactInfo.address || 'Retrait en magasin',
      })
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(personalization, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return handleError(error, 'Failed to create personalization')
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
      return NextResponse.json({ error: 'Personalization ID is required' }, { status: 400 })
    }

    const validatedData = updatePersonalizationSchema.parse(updateData)

    const personalization = await Personalization.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    }).lean()

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
