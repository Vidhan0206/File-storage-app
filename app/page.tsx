'use client'

import { useState, useEffect } from 'react'
import { Calendar, Upload, File, Calendar as CalendarIcon, RefreshCw } from 'lucide-react'
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
  const { addNotification } = useNotification()

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async (showNotification = true, retryCount = 0) => {
    try {
      setLoading(true)
      const response = await fetch('/api/files')
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
        if (showNotification) {
          addNotification({
            type: 'info',
            title: 'Files Loaded',
            message: `Loaded ${data.length} files successfully`,
            duration: 3000
          })
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Error Loading Files',
          message: 'Failed to load files from storage',
          duration: 5000
        })
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
    setFiles(prev => [newFile, ...prev])
    addNotification({
      type: 'success',
      title: 'File Uploaded',
      message: `${newFile.name} has been uploaded successfully`,
      duration: 4000
    })
    
    // Refresh files from storage after a short delay to ensure consistency
    setTimeout(() => {
      loadFiles(false) // Don't show notification for this refresh
    }, 2000)
  }

  const handleFileDelete = async (fileId: string) => {
    const fileToDelete = files.find(f => f.id === fileId)
    
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        
        // Only update UI if deletion was actually successful
        if (result.success) {
          setFiles(prev => prev.filter(file => file.id !== fileId))
          addNotification({
            type: 'success',
            title: 'File Deleted',
            message: `${fileToDelete?.name || 'File'} has been deleted successfully`,
            duration: 4000
          })
          // Refresh files from storage to ensure consistency
          setTimeout(() => {
            loadFiles(false) // Don't show notification for this refresh
          }, 1000)
        } else {
          addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: 'File deletion was not successful',
            duration: 5000
          })
        }
      } else {
        const errorData = await response.json()
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: errorData.error || 'Failed to delete file',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Network error while deleting file',
        duration: 5000
      })
    }
  }

  const filteredFiles = files.filter(file => {
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
                onClick={() => loadFiles()}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh files"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
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
          />
        ) : (
          <FileList
            files={files}
            onFileDelete={handleFileDelete}
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
