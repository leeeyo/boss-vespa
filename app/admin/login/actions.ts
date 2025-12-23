'use server'

import { signIn } from '@/auth'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/admin/dashboard',
    })
    // signIn will redirect, so this won't be reached
  } catch (error: any) {
    // NextAuth v5 throws errors for failed authentication
    if (error?.type === 'CredentialsSignin' || error?.message?.includes('Invalid')) {
      return { error: 'Email ou mot de passe incorrect' }
    }
    console.error('Login error:', error)
    return { error: 'Une erreur est survenue' }
  }
}

