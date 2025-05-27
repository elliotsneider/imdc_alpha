// pages/api/set-cookie.ts
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid user_id' })
  }

  const token = jwt.sign({ userId: user_id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  })

  res.setHeader(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
  )

  return res.status(200).json({ message: 'Cookie set' })
}
