'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 px-0"
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 px-0 relative"
    >
      <Sun className={`h-4 w-4 transition-all ${
        theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
      }`} />
      <Moon className={`absolute h-4 w-4 transition-all ${
        theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
      }`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
