'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Calendar } from 'lucide-react'
import { FileData } from '@/types/file'
import { useNotification } from './Notification'

interface FileUploadProps {
  onFileUpload: (file: FileData) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const { addNotification } = useNotification()


  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('onDrop called with:', { acceptedFiles: acceptedFiles.length, rejectedFiles: rejectedFiles.length })
    
    if (acceptedFiles.length === 0) {
      console.log('No files accepted')
      if (rejectedFiles.length > 0) {
        console.log('Rejected files:', rejectedFiles)
        addNotification({
          type: 'error',
          title: 'File Rejected',
          message: 'Some files were rejected. Please check file type and size.',
          duration: 5000
        })
      }
      return
    }

    console.log('Starting upload process...')
    setUploading(true)
    let successCount = 0
    let errorCount = 0
    
    try {
      for (const file of acceptedFiles) {
        console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type)
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('date', selectedDate)

        console.log('Sending upload request...')
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        console.log('Upload response status:', response.status)

        if (response.ok) {
          const responseData = await response.json()
          console.log('Upload response data:', responseData)
          
          if (responseData.success && responseData.id && responseData.name && responseData.url) {
            console.log('Calling onFileUpload with:', responseData)
            onFileUpload(responseData)
            successCount++
          } else {
            console.error('Upload failed:', responseData)
            errorCount++
            addNotification({
              type: 'error',
              title: 'Upload Failed',
              message: responseData.error || `Failed to upload ${file.name}`,
              duration: 5000
            })
          }
        } else {
          console.error('Upload failed for file:', file.name, 'Status:', response.status)
          let errorMessage = 'Unknown error'
          
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || 'Unknown error'
            console.error('Error details:', errorData)
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError)
            errorMessage = `Server error (${response.status})`
          }
          
          errorCount++
          addNotification({
            type: 'error',
            title: 'Upload Failed',
            message: `Failed to upload ${file.name}: ${errorMessage}`,
            duration: 5000
          })
        }
      }

      // Show summary notification
      if (successCount > 0 && errorCount === 0) {
        addNotification({
          type: 'success',
          title: 'Upload Complete',
          message: `Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`,
          duration: 4000
        })
      } else if (successCount > 0 && errorCount > 0) {
        addNotification({
          type: 'info',
          title: 'Upload Partial',
          message: `Uploaded ${successCount} file${successCount > 1 ? 's' : ''}, ${errorCount} failed`,
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      addNotification({
        type: 'error',
        title: 'Upload Error',
        message: 'Network error while uploading files',
        duration: 5000
      })
    } finally {
      setUploading(false)
    }
  }, [selectedDate, onFileUpload, addNotification])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    console.log('File input changed, files:', files.length)
    const fileArray = Array.from(files)
    
    // Call onDrop with the selected files
    await onDrop(fileArray, [])
    
    // Reset the input
    event.target.value = ''
  }, [onDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload Files</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Upload Date:
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        {/* Fallback file input */}
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="fallback-file-input"
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Uploading files...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-gray-500">
                or click to select files
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Supports all file types (max 10MB)
            </p>
            <button
              type="button"
              onClick={() => document.getElementById('fallback-file-input')?.click()}
              className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Select Files
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
