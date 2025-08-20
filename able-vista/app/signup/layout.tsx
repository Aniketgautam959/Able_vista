"use client"

import "../globals.css"
import axios, { AxiosError } from "axios"
import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

// Define response type for getAuth
interface AuthResponse {
  id: string
  name: string
  email: string
  // add more fields if your backend provides them
}

interface GetAuthResult {
  user: AuthResponse | null
  error: string | null
}

async function getAuth(): Promise<GetAuthResult> {
  try {
    const { data } = await axios.get<AuthResponse>("/api/auth/showme", {
      withCredentials: true,
    })
    return { user: data, error: null }
  } catch (error: unknown) {
    console.error("Auth request failed:", error)

    if (axios.isAxiosError(error)) {
      return {
        user: null,
        error:
          (error.response?.data as { message?: string })?.message ||
          "Authentication failed",
      }
    }

    return { user: null, error: "Unexpected authentication error" }
  }
}

interface SignupLayoutProps {
  children: ReactNode
}

export default function SignupLayout({ children }: SignupLayoutProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const { user, error } = await getAuth()

        if (user && !error) {
          // If user is already authenticated, redirect to dashboard
          router.push("/dashboard")
          return
        }
        // Not authenticated → continue showing signup
      } catch (err) {
        console.error("Auth check failed:", err)
        // Allow showing signup page even on error
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center w-screen">
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-900" />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      {children}
    </div>
  )
}
