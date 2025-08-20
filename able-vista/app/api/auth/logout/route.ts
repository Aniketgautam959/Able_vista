import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface LogoutResponse {
  message: string
}

export async function POST(request: NextRequest): Promise<NextResponse<LogoutResponse | { message: string }>> {
    try {
        const response = NextResponse.json({
            message: 'Logged out successfully'
        })

        // Clear the httpOnly cookie
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // Expire immediately
            path: '/'
        })

        return response

    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
