import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json([])
    }

    const { blobs } = await list()
    
    const files = blobs.map(blob => ({
      id: blob.url,
      name: blob.pathname.split('/').pop() || 'Unknown',
      url: blob.url,
      size: blob.size,
      type: 'application/octet-stream',
      uploadedAt: blob.uploadedAt.toISOString()
    }))

    return NextResponse.json(files)
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json([])
  }
}
