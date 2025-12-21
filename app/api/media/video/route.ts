import { NextRequest, NextResponse } from 'next/server'
import Mux from '@mux/mux-node'
import { requireAuth, handleError } from '@/lib/api-helpers'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const { url, playbackPolicy = 'public' } = body

    if (!url) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }

    // Create a new asset in Mux
    const asset = await mux.video.assets.create({
      inputs: [{ url }],
      playback_policy: playbackPolicy === 'public' ? ['public'] : ['signed'],
      test: process.env.NODE_ENV !== 'production',
    })

    return NextResponse.json({
      muxAssetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id,
      status: asset.status,
    })
  } catch (error) {
    return handleError(error, 'Failed to upload video to Mux')
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    const asset = await mux.video.assets.retrieve(assetId)

    return NextResponse.json({
      muxAssetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id,
      status: asset.status,
      duration: asset.duration,
    })
  } catch (error) {
    return handleError(error, 'Failed to fetch video asset')
  }
}

