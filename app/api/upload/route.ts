import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    // Validate environment configuration
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not found')
      return NextResponse.json({
        success: false,
        error: 'Storage configuration error',
        details: 'Blob storage not configured'
      }, { status: 503 })
    }

    // Parse and validate form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const date = formData.get('date') as string

    // Validate file presence
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided',
        details: 'Please select a file to upload'
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: 'File too large',
        details: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }, { status: 400 })
    }

    // Validate file name
    if (!file.name || file.name.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Invalid file name',
        details: 'File must have a valid name'
      }, { status: 400 })
    }

    // Validate upload date
    let uploadDate: Date
    try {
      uploadDate = date ? new Date(date) : new Date()
      if (isNaN(uploadDate.getTime())) {
        throw new Error('Invalid date')
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format',
        details: 'Please provide a valid date'
      }, { status: 400 })
    }

    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[<>:"\\|?*]/g, '_')
    const fileName = `${timestamp}-${sanitizedName}`
    const filePath = `uploads/${fileName}`

    // Log upload attempt
    console.log('Initiating file upload:', {
      originalName: file.name,
      filePath,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: uploadDate.toISOString()
    })

    // Upload to Vercel Blob
    const blob = await put(filePath, file, {
      access: 'public',
      addRandomSuffix: false, // Use our own timestamp-based naming
      cacheControlMaxAge: 31536000, // 1 year cache
      token: process.env.BLOB_READ_WRITE_TOKEN
    })

    // Log successful upload
    console.log('File uploaded successfully:', {
      url: blob.url,
      pathname: blob.pathname,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    })

    // Prepare response data
    const fileData = {
      id: blob.url,
      name: file.name,
      url: blob.url,
      size: file.size,
      type: file.type,
      uploadedAt: uploadDate.toISOString()
    }

    return NextResponse.json({
      success: true,
      ...fileData
    })
  } catch (error) {
    // Enhanced error logging
    console.error('Error uploading file:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })

    // Determine if it's a Blob API error
    const isBlobError = error instanceof Error && 
      error.message.toLowerCase().includes('blob')

    return NextResponse.json({
      success: false,
      error: isBlobError ? 'Storage service error' : 'Upload failed',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: isBlobError ? 503 : 500 })
  }
}
