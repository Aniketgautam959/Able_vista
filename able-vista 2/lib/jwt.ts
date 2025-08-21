import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

interface TokenPayload {
  userId: string
  email: string
  [key: string]: any
}

interface DecodedToken {
  userId: string
  email: string
  iat: number
  exp: number
  [key: string]: any
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken
  } catch (error) {
    return null
  }
}
