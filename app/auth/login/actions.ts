'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// Server action for login - following Auth.js recommended pattern
export async function loginAction(prevState: { error: string } | null | undefined, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const callbackUrl = formData.get('callbackUrl') as string | null

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  // Get user role BEFORE signIn to determine redirect
  let userRole: 'admin' | 'customer' = 'customer'
  try {
    await connectDB()
    const user = await User.findOne({ email }).select('role').lean()
    if (user?.role) {
      userRole = user.role as 'admin' | 'customer'
    }
  } catch {
    // If we can't get role, default to customer redirect
  }

  // Determine redirect URL based on role
  let redirectUrl: string
  if (userRole === 'admin') {
    redirectUrl = callbackUrl?.startsWith('/admin') ? callbackUrl : '/admin/dashboard'
  } else {
    redirectUrl = callbackUrl || '/profile'
  }

  try {
    // Use signIn with redirectTo - Auth.js recommended pattern for server-side
    // This will throw NEXT_REDIRECT on success which Next.js handles natively
    await signIn('credentials', {
      email,
      password,
      redirectTo: redirectUrl,
    })
  } catch (error: any) {
    // NEXT_REDIRECT must be re-thrown for Next.js to handle the redirect
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    
    // Auth errors from NextAuth
    if (error instanceof AuthError || error?.type === 'CredentialsSignin' || error?.message?.includes('Invalid')) {
      return { error: 'Email ou mot de passe incorrect' }
    }
    
    console.error('Login error:', error)
    return { error: 'Une erreur est survenue' }
  }
}

