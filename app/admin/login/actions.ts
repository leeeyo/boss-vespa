'use server'

import { signIn } from '@/auth'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: { error: string } | null, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    // Check if signIn returned an error
    if (result?.error) {
      return { error: 'Email ou mot de passe incorrect' }
    }

    // If successful, redirect
    redirect('/admin/dashboard')
  } catch (error: any) {
    // Check if this is a redirect error (NEXT_REDIRECT) - if so, re-throw it
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
      throw error // Re-throw redirect errors so Next.js can handle them
    }
    
    // NextAuth v5 throws errors for failed authentication
    if (error?.type === 'CredentialsSignin' || error?.message?.includes('Invalid')) {
      return { error: 'Email ou mot de passe incorrect' }
    }
    console.error('Login error:', error)
    return { error: 'Une erreur est survenue' }
  }
}

