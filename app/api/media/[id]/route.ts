import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { requireAdmin, handleError } from '@/lib/api-helpers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    await del(url)

    return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error) {
    return handleError(error, 'Failed to delete media')
  }
}

