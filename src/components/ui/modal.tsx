'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md'
}: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        'relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-auto',
        'sm:rounded-lg rounded-none sm:shadow-xl shadow-none',
        sizeClasses[size],
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
