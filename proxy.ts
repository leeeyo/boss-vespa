import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting store (in-memory, consider Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
  return ip
}

function checkRateLimit(request: NextRequest, limit: number = 100, windowMs: number = 60000): boolean {
  const key = getRateLimitKey(request)
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders })
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const isAuthRoute = pathname.startsWith('/api/auth/')
    const limit = isAuthRoute ? 50 : 100 // Increased limit for auth routes to prevent loops

    if (!checkRateLimit(request, limit)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: corsHeaders })
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (token.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders })
    }
  }

  // Protect API routes that require authentication
  const protectedApiRoutes = [
    '/api/orders',
    '/api/personalization',
    '/api/media',
    '/api/admin',
    '/api/blog',
    '/api/devis',
  ]

  const isProtectedRoute = protectedApiRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !pathname.includes('/api/auth/')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    // Check admin routes
    if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/blog') || pathname.startsWith('/api/devis')) {
      if (token.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders })
      }
    }
  }

  // Continue with the request
  return NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })
}

