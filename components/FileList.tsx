'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { File, Download, Trash2, Search, Calendar } from 'lucide-react'
import { FileData } from '@/types/file'

interface FileListProps {
  files: FileData[]
  onFileDelete: (fileId: string) => void
  deletingFiles: Set<string>
}

export default function FileList({ files, onFileDelete, deletingFiles }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedFiles = files
    .filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
        case 'size':
          comparison = a.size - b.size
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleFileDelete = (fileId: string) => {
    onFileDelete(fileId)
  }

  const handleDownload = (file: FileData) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (type: string) => {
    if (type.includes('html')) return '🌐'
    if (type.includes('pdf')) return '📄'
    if (type.includes('python')) return '🐍'
    if (type.includes('javascript') || type.includes('typescript')) return '📜'
    if (type.includes('css')) return '🎨'
    if (type.includes('json')) return '📋'
    return '📁'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">
            All Files ({files.length})
          </h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Sort */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedFiles.length === 0 ? (
          <div className="text-center py-12">
            <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No files match your search' : 'No files uploaded yet'}
            </p>
          </div>
        ) : (
          filteredAndSortedFiles.map(file => (
            <div key={file.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="text-2xl">{getFileIcon(file.type)}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {file.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(file.uploadedAt), 'MMM d, yyyy h:mm a')}</span>
                      </span>
                      <span>{formatFileSize(file.size)}</span>
                      <span className="capitalize">{file.type.split('/')[1] || 'file'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleFileDelete(file.id)}
                    disabled={deletingFiles.has(file.id)}
                    className={`p-2 rounded-md transition-colors ${
                      deletingFiles.has(file.id)
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={deletingFiles.has(file.id) ? 'Deleting...' : 'Delete'}
                  >
                    <Trash2 className={`h-5 w-5 ${deletingFiles.has(file.id) ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
