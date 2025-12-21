import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'
import { handleError } from '@/lib/api-helpers'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token manquant'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate input
    const { token, password } = resetPasswordSchema.parse(body)
    
    // Hash token to match stored version
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')
    
    // Find user with valid token and expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Lien de réinitialisation invalide ou expiré' },
        { status: 400 }
      )
    }
    
    // Update password
    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    
    return NextResponse.json({ message: 'Mot de passe réinitialisé avec succès' })
  } catch (error) {
    return handleError(error, 'Erreur lors de la réinitialisation du mot de passe')
  }
}

