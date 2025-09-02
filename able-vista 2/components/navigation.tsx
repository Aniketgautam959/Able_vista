'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

interface User {
  userId: string
  email: string
  name: string
  role: string
}

export function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [isInstructor, setIsInstructor] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/showme')
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          // Check if user is an instructor
          const instructorResponse = await fetch(`/api/instructors?user=${data.user.userId}`)
          if (instructorResponse.ok) {
            const instructorData = await instructorResponse.json()
            setIsInstructor(instructorData.data?.instructors?.length > 0)
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setIsInstructor(false)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Able Vista</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
            Courses
          </Link>
          {user && (
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          )}
          {isInstructor && (
            <Link href="/instructor" className="text-muted-foreground hover:text-foreground transition-colors">
              Instructor Portal
            </Link>
          )}
          {user && (
            <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
          )}
        </nav>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:block">
                Welcome, {user.name}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                title="Logout"
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
