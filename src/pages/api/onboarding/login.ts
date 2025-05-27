import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '../../../lib/db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

      console.log('password:', password)
      console.log('user.password_hash:', user?.password)
      const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Create a JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Set as HTTP-only cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax;`)

    return res.status(200).json({ message: 'Login successful' })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
