import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  try {
    const { blobs } = await list()
    
    const files = blobs.map(blob => ({
      id: blob.pathname,
      name: blob.pathname.split('/').pop() || 'Unknown',
      url: blob.url,
      size: blob.size,
      type: blob.contentType || 'application/octet-stream',
      uploadedAt: blob.uploadedAt.toISOString(),
      blobUrl: blob.url
    }))

    return NextResponse.json(files)
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}
