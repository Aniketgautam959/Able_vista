"use client"

import "../globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

interface SignupLayoutProps {
  children: ReactNode
}

export default function SignupLayout({ children }: SignupLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      {children}
    </div>
  )
}
