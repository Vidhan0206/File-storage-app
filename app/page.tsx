'use client'

import { useState, useEffect } from 'react'
import { Calendar, Upload, File, Calendar as CalendarIcon } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import CalendarView from '@/components/CalendarView'
import FileList from '@/components/FileList'
import { NotificationProvider, useNotification } from '@/components/Notification'
import { FileData } from '@/types/file'

function HomeContent() {
  const [files, setFiles] = useState<FileData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [loading, setLoading] = useState(true)
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set())
  const { addNotification } = useNotification()

  useEffect(() => {
    loadFiles()
  }, [])

  // Auto-refresh files when page becomes visible (after refresh)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing files...')
        loadFiles(false) // Don't show notification for auto-refresh
      }
    }

    const handleFocus = () => {
      console.log('Window focused, refreshing files...')
      loadFiles(false) // Don't show notification for auto-refresh
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadFiles = async (showNotification = true, retryCount = 0) => {
    try {
      setLoading(true)
      console.log('Loading files from storage...')
      
      const response = await fetch('/api/files')
      const data = await response.json()
      
      console.log('API response:', data)
      
      if (data.success && data.files) {
        // Filter out any files that are currently being deleted
        const filteredData = data.files.filter((file: FileData) => !deletingFiles.has(file.id))
        
        console.log('Setting files:', filteredData.length, 'files')
        setFiles(filteredData)
        
        if (showNotification) {
          addNotification({
            type: 'info',
            title: 'Files Loaded',
            message: `Loaded ${filteredData.length} files successfully`,
            duration: 3000
          })
        }
      } else {
        // Handle API error response
        const errorMessage = data.error || 'Failed to load files from storage'
        console.error('API error:', errorMessage)
        
        addNotification({
          type: 'error',
          title: 'Error Loading Files',
          message: errorMessage,
          duration: 5000
        })
        
        // If it's a configuration error, show helpful message
        if (errorMessage.includes('not configured')) {
          addNotification({
            type: 'error',
            title: 'Configuration Required',
            message: 'Please set up BLOB_READ_WRITE_TOKEN in your environment variables',
            duration: 8000
          })
        }
      }
    } catch (error) {
      console.error('Error loading files:', error)
      
      // Retry once if it's a network error and we haven't retried yet
      if (retryCount === 0) {
        console.log('Retrying file load...')
        setTimeout(() => loadFiles(showNotification, 1), 1000)
        return
      }
      
      addNotification({
        type: 'error',
        title: 'Error Loading Files',
        message: 'Network error while loading files',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (newFile: FileData) => {
    console.log('handleFileUpload called with:', newFile)
    console.log('Current files before adding:', files.length)
    
    setFiles(prev => {
      const updated = [newFile, ...prev]
      console.log('Files after adding new file:', updated.length)
      return updated
    })
    
    addNotification({
      type: 'success',
      title: 'File Uploaded',
      message: `${newFile.name} has been uploaded successfully`,
      duration: 4000
    })
  }

  const handleFileDelete = async (fileId: string) => {
    const fileToDelete = files.find((f: FileData) => f.id === fileId)
    
    // Prevent multiple deletion attempts
    if (deletingFiles.has(fileId)) {
      return
    }
    
    setDeletingFiles(prev => new Set(prev).add(fileId))
    
    // IMMEDIATELY remove from UI for instant feedback
    setFiles(prev => prev.filter((file: FileData) => file.id !== fileId))
    
    // Add a timeout to clean up deleting state in case of issues
    const cleanupTimeout = setTimeout(() => {
      setDeletingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileId)
        return newSet
      })
    }, 10000) // 10 second timeout
    
    // Show immediate feedback that deletion is in progress
    addNotification({
      type: 'info',
      title: 'Deleting File',
      message: `Deleting ${fileToDelete?.name || 'file'}...`,
      duration: 2000
    })
    
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          addNotification({
            type: 'success',
            title: 'File Deleted',
            message: `${fileToDelete?.name || 'File'} has been deleted successfully`,
            duration: 4000
          })
          // Clean up deleting state
          setDeletingFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(fileId)
            return newSet
          })
        } else {
          // If deletion failed, add the file back to the UI
          setFiles(prev => [fileToDelete!, ...prev])
          addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: result.error || 'File deletion was not successful',
            duration: 5000
          })
        }
      } else {
        // If deletion failed, add the file back to the UI
        setFiles(prev => [fileToDelete!, ...prev])
        const errorData = await response.json()
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: errorData.error || 'Failed to delete file',
          duration: 5000
        })
      }
    } catch (error) {
      // If deletion failed, add the file back to the UI
      setFiles(prev => [fileToDelete!, ...prev])
      console.error('Error deleting file:', error)
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Network error while deleting file',
        duration: 5000
      })
    } finally {
      // Clear the timeout and remove from deleting set
      clearTimeout(cleanupTimeout)
      setDeletingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileId)
        return newSet
      })
    }
  }

  const filteredFiles = files.filter((file: FileData) => {
    const fileDate = new Date(file.uploadedAt)
    return fileDate.toDateString() === selectedDate.toDateString()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">File Storage</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'calendar'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <File className="h-4 w-4" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        {/* Content */}
        {view === 'calendar' ? (
          <CalendarView
            files={files}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onFileDelete={handleFileDelete}
            deletingFiles={deletingFiles}
          />
        ) : (
          <FileList
            files={files}
            onFileDelete={handleFileDelete}
            deletingFiles={deletingFiles}
          />
        )}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <NotificationProvider>
      <HomeContent />
    </NotificationProvider>
  )
}
