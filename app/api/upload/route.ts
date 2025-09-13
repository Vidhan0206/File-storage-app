import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Blob storage not configured' }, { status: 503 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const date = formData.get('date') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create a date-based folder structure
    const uploadDate = date ? new Date(date) : new Date()
    const year = uploadDate.getFullYear()
    const month = String(uploadDate.getMonth() + 1).padStart(2, '0')
    const day = String(uploadDate.getDate()).padStart(2, '0')
    
    const folderPath = `uploads/${year}/${month}/${day}`
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${folderPath}/${fileName}`

    const blob = await put(filePath, file, {
      access: 'public',
    })

    const fileData = {
      id: blob.url,
      name: file.name,
      url: blob.url,
      size: file.size,
      type: file.type,
      uploadedAt: uploadDate.toISOString()
    }

    return NextResponse.json(fileData)
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
