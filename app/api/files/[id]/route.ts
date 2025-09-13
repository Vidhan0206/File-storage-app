import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not found')
      return NextResponse.json({ error: 'Blob storage not configured' }, { status: 503 })
    }

    const fileUrl = decodeURIComponent(params.id)
    
    console.log('Attempting to delete file:', fileUrl)
    console.log('Token available:', !!process.env.BLOB_READ_WRITE_TOKEN)
    
    // Delete the file from Vercel Blob storage
    const result = await del(fileUrl)
    
    console.log('File deleted successfully:', result)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error deleting file:', error)
    console.error('File URL that failed:', fileUrl)
    return NextResponse.json({ 
      error: 'Failed to delete file', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
