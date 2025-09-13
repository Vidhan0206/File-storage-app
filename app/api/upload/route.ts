import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not found')
      return NextResponse.json({ 
        success: false,
        error: 'Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN in your environment variables.' 
      }, { status: 503 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const date = formData.get('date') as string

    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: 'No file provided' 
      }, { status: 400 })
    }

    // Create a simple file path with timestamp
    const uploadDate = date ? new Date(date) : new Date()
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `uploads/${fileName}`

    console.log('Uploading file:', {
      originalName: file.name,
      filePath,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: uploadDate.toISOString()
    })

    const blob = await put(filePath, file, {
      access: 'public',
    })

    console.log('File uploaded successfully:', {
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
      type: file.type
    })

    const fileData = {
      id: blob.url,
      name: file.name,
      url: blob.url,
      size: file.size,
      type: file.type,
      uploadedAt: uploadDate.toISOString()
    }

    console.log('Returning file data:', fileData)

    return NextResponse.json({
      success: true,
      ...fileData
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
