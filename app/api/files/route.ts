import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('BLOB_READ_WRITE_TOKEN not found, returning empty array')
      return NextResponse.json({
        success: false,
        error: 'Blob storage not configured',
        files: []
      })
    }

    console.log('Fetching files from blob storage...')
    const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN })
    console.log(`Found ${blobs.length} blobs in storage`)
    console.log('Blob details:', blobs.map(b => ({ 
      url: b.url, 
      pathname: b.pathname, 
      size: b.size,
      uploadedAt: b.uploadedAt.toISOString()
    })))
    
    const files = blobs.map(blob => {
      // Extract file name from pathname (remove timestamp prefix)
      const pathParts = blob.pathname.split('/')
      const fileNameWithTimestamp = pathParts[pathParts.length - 1] || 'Unknown'
      
      // Remove timestamp prefix (format: timestamp-originalname)
      // Find the first dash and take everything after it
      const dashIndex = fileNameWithTimestamp.indexOf('-')
      const fileName = dashIndex > 0 
        ? fileNameWithTimestamp.substring(dashIndex + 1)
        : fileNameWithTimestamp
      
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
      
      // Map file extensions to MIME types
      let mimeType = 'application/octet-stream'
      switch (fileExtension) {
        case 'html':
        case 'htm':
          mimeType = 'text/html'
          break
        case 'pdf':
          mimeType = 'application/pdf'
          break
        case 'py':
          mimeType = 'text/x-python'
          break
        case 'txt':
          mimeType = 'text/plain'
          break
        case 'json':
          mimeType = 'application/json'
          break
        case 'css':
          mimeType = 'text/css'
          break
        case 'js':
          mimeType = 'text/javascript'
          break
        case 'ts':
          mimeType = 'text/typescript'
          break
        case 'jsx':
          mimeType = 'text/jsx'
          break
        case 'tsx':
          mimeType = 'text/tsx'
          break
        default:
          mimeType = 'application/octet-stream'
      }
      
      const fileData = {
        id: blob.url,
        name: fileName,
        url: blob.url,
        size: blob.size,
        type: mimeType,
        uploadedAt: blob.uploadedAt.toISOString()
      }
      
      console.log('Processed file:', {
        originalPath: blob.pathname,
        extractedName: fileName,
        mimeType: mimeType,
        size: blob.size
      })
      
      return fileData
    })

    console.log(`Returning ${files.length} files to client`)
    
    // Create response with cache-busting headers
    const response = NextResponse.json({
      success: true,
      files: files
    })
    
    // Add cache-busting headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching files:', error)
    
    // Create error response with cache-busting headers
    const response = NextResponse.json({
      success: false,
      error: 'Failed to fetch files',
      details: error instanceof Error ? error.message : 'Unknown error',
      files: []
    })
    
    // Add cache-busting headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  }
}
