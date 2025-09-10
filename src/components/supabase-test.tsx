'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState('')
  const [companyCount, setCompanyCount] = useState<number | null>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test 1: Check if environment variables are set
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        setConnectionStatus('error')
        setErrorMessage('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
        return
      }

      // Test 2: Try to fetch data from companies table
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1)

      if (error) {
        setConnectionStatus('error')
        setErrorMessage(`Database error: ${error.message}`)
        return
      }

      // Test 3: Get total company count
      const { count, error: countError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        setConnectionStatus('error')
        setErrorMessage(`Count error: ${countError.message}`)
        return
      }

      setConnectionStatus('connected')
      setCompanyCount(count)
    } catch (err) {
      setConnectionStatus('error')
      setErrorMessage(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Checking Connection...'
      case 'connected':
        return 'Connected Successfully'
      case 'error':
        return 'Connection Failed'
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        {connectionStatus === 'connected' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Companies in DB:</span>
              <span className="text-sm font-mono">{companyCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Environment:</span>
              <span className="text-sm font-mono">
                {process.env.NODE_ENV || 'development'}
              </span>
            </div>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="space-y-2">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-400 font-mono">
                {errorMessage}
              </p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Make sure you have:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Created a .env.local file</li>
                <li>Added NEXT_PUBLIC_SUPABASE_URL</li>
                <li>Added NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>Created the companies table in Supabase</li>
              </ul>
            </div>
          </div>
        )}

        <button
          onClick={testConnection}
          className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Test Connection Again
        </button>
      </CardContent>
    </Card>
  )
}
