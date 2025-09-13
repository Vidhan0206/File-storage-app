import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  try {
    console.log('Test files API called')
    
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('BLOB_READ_WRITE_TOKEN not found')
      return NextResponse.json({ 
        error: 'BLOB_READ_WRITE_TOKEN not found',
        tokenAvailable: false 
      })
    }

    console.log('Fetching files from blob storage...')
    const { blobs } = await list()
    console.log(`Found ${blobs.length} blobs in storage`)
    
    const files = blobs.map(blob => ({
      id: blob.url,
      name: blob.pathname.split('/').pop() || 'Unknown',
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt.toISOString(),
      pathname: blob.pathname
    }))

    return NextResponse.json({ 
      success: true,
      count: files.length,
      files: files,
      tokenAvailable: true
    })
  } catch (error) {
    console.error('Error in test files API:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch files',
      details: error instanceof Error ? error.message : 'Unknown error',
      tokenAvailable: !!process.env.BLOB_READ_WRITE_TOKEN
    }, { status: 500 })
  }
}
