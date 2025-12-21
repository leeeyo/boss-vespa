import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'
import { z } from 'zod'
import { handleError } from '@/lib/api-helpers'

const validateTokenSchema = z.object({
  token: z.string().min(1, 'Token manquant'),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate input
    const { token } = validateTokenSchema.parse(body)
    
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
        { error: 'Lien invalide ou expiré' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ valid: true })
  } catch (error) {
    return handleError(error, 'Erreur lors de la validation du token')
  }
}

