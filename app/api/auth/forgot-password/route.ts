import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'
import { z } from 'zod'
import { handleError } from '@/lib/api-helpers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate input
    const { email } = forgotPasswordSchema.parse(body)
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    
    // For security reasons, we don't want to reveal if a user exists or not
    if (!user) {
      return NextResponse.json({ message: 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.' })
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
    
    // Save hashed token and expiry to user
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()
    
    // Send email (optional check for RESEND_API_KEY)
    if (process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
      
      await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe - Boss Vespa',
        html: `
          <h1>Réinitialisation de votre mot de passe</h1>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Boss Vespa.</p>
          <p>Veuillez cliquer sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
          <a href="${resetUrl}" style="display: inline-block; background: #fbbf24; color: black; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; margin: 20px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">Boss Vespa Mahdia, Tunisie</p>
        `,
      })
    }
    
    return NextResponse.json({ message: 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.' })
  } catch (error) {
    return handleError(error, 'Erreur lors de la demande de réinitialisation')
  }
}

