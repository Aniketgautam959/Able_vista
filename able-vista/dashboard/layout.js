"use client"

import '../globals.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

async function getAuth() {
    try {
        const { data } = await axios.get("/api/auth/showme")
        return { user: data, error: null }
    } catch (error) {
        console.error('Auth request failed:', error)
        return {
            user: null,
            error: error.response?.data?.message || 'Authentication failed'
        }
    }
}

export default function DashboardLayout({ children }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setIsLoading(true)
                const { user, error } = await getAuth()

                if (error || !user) {
                    router.push('/login')
                    return
                }
                setIsAuthenticated(true)
            } catch (error) {
                console.error('Auth check failed:', error)
                router.push('/login')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router])

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center w-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900" />
            </div>
        )
    }

    return (
            <div className="flex h-screen bg-gray-50">
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
    )
}
