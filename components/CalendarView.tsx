'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, File, Download } from 'lucide-react'
import { FileData } from '@/types/file'

interface CalendarViewProps {
  files: FileData[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export default function CalendarView({ files, selectedDate, onDateSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getFilesForDate = (date: Date) => {
    return files.filter(file => {
      const fileDate = new Date(file.uploadedAt)
      return isSameDay(fileDate, date)
    })
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
    return '📁'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={() => setCurrentMonth(new Date())}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map(day => {
            const dayFiles = getFilesForDate(day)
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-100 border-blue-300'
                    : 'hover:bg-gray-50 border-gray-200'
                } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                onClick={() => onDateSelect(day)}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayFiles.slice(0, 3).map(file => (
                    <div
                      key={file.id}
                      className="flex items-center space-x-1 text-xs bg-white rounded px-2 py-1 shadow-sm"
                    >
                      <span>{getFileIcon(file.type)}</span>
                      <span className="truncate flex-1">{file.name}</span>
                    </div>
                  ))}
                  {dayFiles.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayFiles.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Files */}
      {selectedDate && (
        <div className="border-t p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Files for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          
          {getFilesForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No files uploaded on this date</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilesForDate(selectedDate).map(file => (
                <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="text-2xl">{getFileIcon(file.type)}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(file.uploadedAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
