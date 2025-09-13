import { NextRequest, NextResponse } from 'next/server'
import { del, head } from '@vercel/blob'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let fileUrl = 'unknown'; // Initialize to ensure it's always defined

  try {
    fileUrl = decodeURIComponent(params.id)
    
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not found')
      return NextResponse.json({ 
        success: false,
        error: 'Blob storage not configured' 
      }, { status: 503 })
    }
    
    console.log('Attempting to delete file:', fileUrl)
    console.log('Token available:', !!process.env.BLOB_READ_WRITE_TOKEN)
    
    // First, verify the file exists
    try {
      await head(fileUrl)
      console.log('File exists, proceeding with deletion')
    } catch (headError) {
      console.log('File may not exist or already deleted:', headError)
      // Continue with deletion attempt anyway
    }
    
    // Delete the file from Vercel Blob storage
    const result = await del(fileUrl)
    
    console.log('File deleted successfully:', result)
    
    // Verify the deletion was successful with multiple attempts
    let verificationPassed = false
    const maxAttempts = 3
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Wait a bit for deletion propagation
      await new Promise(resolve => setTimeout(resolve, 500 * attempt))
      
      try {
        await head(fileUrl)
        // If we can still access the file, deletion failed
        console.log(`Verification attempt ${attempt}: File still exists`)
        if (attempt === maxAttempts) {
          console.error('File still exists after all verification attempts')
          return NextResponse.json({ 
            success: false,
            error: 'File deletion verification failed - file still exists after multiple attempts',
            result 
          }, { status: 500 })
        }
      } catch (verifyError) {
        // File is successfully deleted (we can't access it anymore)
        console.log(`Verification attempt ${attempt}: File deletion confirmed`)
        verificationPassed = true
        break
      }
    }
    
    if (verificationPassed) {
      return NextResponse.json({ 
        success: true, 
        result,
        message: 'File deleted successfully from storage'
      })
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'File deletion verification failed',
        result 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    console.error('File URL that failed:', fileUrl)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete file', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
