'use client'

import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Calendar, X } from 'lucide-react'
import { FileData } from '@/types/file'
import { useNotification } from './Notification'

interface FileUploadProps {
  onFileUpload: (file: FileData) => void
  maxFileSize?: number // in bytes, default 10MB
  acceptedFileTypes?: string[] // e.g. ['image/*', 'application/pdf']
}

export default function FileUpload({
  onFileUpload,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({}) // Track progress per file
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const abortControllerRef = useRef<Record<string, AbortController>>({})
  const { addNotification } = useNotification()

  const cancelUpload = useCallback((fileName: string) => {
    if (abortControllerRef.current[fileName]) {
      abortControllerRef.current[fileName].abort()
      delete abortControllerRef.current[fileName]
      delete uploadProgress[fileName]
      setUploadProgress({ ...uploadProgress })
      addNotification({
        type: 'info',
        title: 'Upload Cancelled',
        message: `Cancelled upload of ${fileName}`,
        duration: 3000
      })
    }
  }, [uploadProgress, addNotification])

  const validateFile = useCallback((file: File) => {
    if (file.size > maxFileSize) {
      throw new Error(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`)
    }

    if (acceptedFileTypes && acceptedFileTypes.length > 0) {
      const fileType = file.type || ''
      const isAccepted = acceptedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0]
          return fileType.startsWith(`${baseType}/`)
        }
        return type === fileType
      })
      if (!isAccepted) {
        throw new Error('File type not accepted')
      }
    }

    return true
  }, [maxFileSize, acceptedFileTypes])

  const uploadFile = useCallback(async (file: File) => {
    const controller = new AbortController()
    abortControllerRef.current[file.name] = controller

    try {
      validateFile(file)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('date', selectedDate)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Upload failed')
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Upload cancelled')
        }
        throw error
      }
      throw new Error('Unknown error occurred')
    } finally {
      delete abortControllerRef.current[file.name]
    }
  }, [selectedDate, validateFile])

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      addNotification({
        type: 'error',
        title: 'Files Rejected',
        message: 'Some files were rejected. Please check file type and size.',
        duration: 5000
      })
    }

    if (acceptedFiles.length === 0) return

    setUploading(true)
    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        const result = await uploadFile(file)
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        onFileUpload(result)
        return { success: true, file: file.name }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed'
        addNotification({
          type: 'error',
          title: 'Upload Failed',
          message: `${file.name}: ${message}`,
          duration: 5000
        })
        return { success: false, file: file.name }
      }
    })

    const results = await Promise.all(uploadPromises)
    const successful = results.filter(r => r.success).length

    if (successful > 0) {
      addNotification({
        type: 'success',
        title: 'Upload Complete',
        message: `Successfully uploaded ${successful} file${successful > 1 ? 's' : ''}`,
        duration: 4000
      })
    }

    setUploading(false)
    setUploadProgress({})
  }, [uploadFile, onFileUpload, addNotification])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: uploading,
    accept: acceptedFileTypes ? Object.fromEntries(acceptedFileTypes.map(type => [type, []])) : undefined
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
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50' : ''}`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{fileName}</span>
                      <span className="text-sm text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      cancelUpload(fileName)
                    }}
                    className="ml-4 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
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
              {acceptedFileTypes
                ? `Accepted files: ${acceptedFileTypes.join(', ')}`
                : 'Supports all file types'} (max {maxFileSize / (1024 * 1024)}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}