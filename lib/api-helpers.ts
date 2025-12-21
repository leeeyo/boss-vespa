import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return user
}

export function handleError(error: unknown, message = 'An error occurred') {
  console.error(message, error)
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ error: message }, { status: 500 })
}

