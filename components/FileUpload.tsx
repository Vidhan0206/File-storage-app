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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    let successCount = 0
    let errorCount = 0
    
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('date', selectedDate)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const fileData = await response.json()
          onFileUpload(fileData)
          successCount++
        } else {
          const errorData = await response.json()
          console.error('Upload failed for file:', file.name, errorData)
          errorCount++
          addNotification({
            type: 'error',
            title: 'Upload Failed',
            message: `Failed to upload ${file.name}: ${errorData.error || 'Unknown error'}`,
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
      'application/pdf': ['.pdf'],
      'text/x-python': ['.py'],
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'text/css': ['.css'],
      'text/javascript': ['.js'],
      'text/typescript': ['.ts'],
      'text/jsx': ['.jsx'],
      'text/tsx': ['.tsx'],
    },
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
              Supports HTML, PDF, Python, and other text files
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
