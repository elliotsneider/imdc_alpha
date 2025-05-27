// pages/api/logout.ts
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    'token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax'
  )
  return res.status(200).json({ message: 'Logged out' })
}
