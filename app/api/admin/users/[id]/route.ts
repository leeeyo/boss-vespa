import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireAdmin, handleError } from '@/lib/api-helpers'

// Validation schema for user updates
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['customer', 'admin']).optional(),
  isActive: z.boolean().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  preferences: z.object({
    language: z.string().optional(),
    notifications: z.boolean().optional(),
  }).optional(),
})

// GET - Fetch individual user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params

    const user = await User.findById(id)
      .select('-password')
      .populate({
        path: 'orderHistory',
        options: { sort: { createdAt: -1 }, limit: 50 },
      })
      .lean()

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    return handleError(error, 'Failed to fetch user')
  }
}

// PATCH - Update user information
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validationResult = updateUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Check if user exists
    const existingUser = await User.findById(id)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      })
      if (emailExists) {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà utilisée' },
          { status: 400 }
        )
      }
    }

    // Build update object with nested fields
    const updateObject: Record<string, unknown> = {}
    
    if (updateData.name !== undefined) updateObject.name = updateData.name
    if (updateData.email !== undefined) updateObject.email = updateData.email
    if (updateData.phone !== undefined) updateObject.phone = updateData.phone
    if (updateData.role !== undefined) updateObject.role = updateData.role
    if (updateData.isActive !== undefined) updateObject.isActive = updateData.isActive
    
    // Handle nested address fields
    if (updateData.address) {
      if (updateData.address.street !== undefined) updateObject['address.street'] = updateData.address.street
      if (updateData.address.city !== undefined) updateObject['address.city'] = updateData.address.city
      if (updateData.address.postalCode !== undefined) updateObject['address.postalCode'] = updateData.address.postalCode
      if (updateData.address.country !== undefined) updateObject['address.country'] = updateData.address.country
    }
    
    // Handle nested preferences fields
    if (updateData.preferences) {
      if (updateData.preferences.language !== undefined) updateObject['preferences.language'] = updateData.preferences.language
      if (updateData.preferences.notifications !== undefined) updateObject['preferences.notifications'] = updateData.preferences.notifications
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateObject },
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate({
        path: 'orderHistory',
        options: { sort: { createdAt: -1 }, limit: 50 },
      })
      .lean()

    return NextResponse.json({ 
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser 
    })
  } catch (error) {
    return handleError(error, 'Failed to update user')
  }
}

// DELETE - Delete user account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const { id } = await params

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Prevent deleting admin users for safety
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Impossible de supprimer un compte administrateur' },
        { status: 403 }
      )
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({ 
      message: 'Utilisateur supprimé avec succès' 
    })
  } catch (error) {
    return handleError(error, 'Failed to delete user')
  }
}




