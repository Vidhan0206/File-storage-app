'use client'

import { useState, useEffect } from 'react'
import { Calendar, Upload, File, Calendar as CalendarIcon } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import CalendarView from '@/components/CalendarView'
import FileList from '@/components/FileList'
import { FileData } from '@/types/file'

export default function Home() {
  const [files, setFiles] = useState<FileData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files')
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (newFile: FileData) => {
    setFiles(prev => [newFile, ...prev])
  }

  const handleFileDelete = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
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
