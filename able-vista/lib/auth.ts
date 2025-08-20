import { verifyToken } from './jwt'
import { NextRequest, NextResponse } from 'next/server'

interface AuthResult {
  isValid: boolean
  error?: string
  user?: {
    userId: string
    email: string
  }
}

interface CookieMap {
  [key: string]: string
}

export function getTokenFromCookies(request: NextRequest): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies: CookieMap = cookieHeader.split(';').reduce((acc: CookieMap, cookie: string) => {
    const [key, value] = cookie.trim().split('=')
    if (key && value) {
      acc[key] = value
    }
    return acc
  }, {})

  return cookies.token || null
}

export function createAuthResponse(message: string, status: number = 401): NextResponse {
  return NextResponse.json({ message }, { status })
}

export async function validateAuth(request: NextRequest): Promise<AuthResult> {
  const token = getTokenFromCookies(request)

  if (!token) {
    return { isValid: false, error: 'No authentication token provided' }
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return { isValid: false, error: 'Invalid or expired token' }
  }

  return { isValid: true, user: decoded }
}
