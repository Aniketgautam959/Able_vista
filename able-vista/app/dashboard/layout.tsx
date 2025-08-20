"use client"

import axios from "axios"
import { useEffect, useState, type ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"

async function getAuth() {
  try {
    const { data } = await axios.get("/api/auth/showme", { withCredentials: true })
    return { user: data, error: null as string | null }
  } catch (error: any) {
    console.error("Auth request failed:", error)
    return {
      user: null,
      error: error?.response?.data?.message || "Authentication failed",
    }
  }
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preview = searchParams?.get("preview") === "1"
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (preview) {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const { user, error } = await getAuth()
        if (error || !user) {
          router.push("/login")
          return
        }
        setIsAuthenticated(true)
      } catch (err) {
        console.error("Auth check failed:", err)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, preview])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center w-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
