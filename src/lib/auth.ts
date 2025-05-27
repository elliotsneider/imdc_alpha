// lib/auth.ts
import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'

export function getUserFromRequest(req: NextApiRequest) {
  const token = req.cookies.token
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    return decoded as { userId: string, email: string }
  } catch (err) {
    return null
  }
}
