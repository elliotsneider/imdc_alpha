// pages/api/set-cookie.ts
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid user_id' })
  }

  const token = jwt.sign({ userId: user_id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  })

  const cookie = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // 🔒 true in production
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    path: '/',
  })

  res.setHeader('Set-Cookie', cookie)
  return res.status(200).json({ message: 'Cookie set' })
}
