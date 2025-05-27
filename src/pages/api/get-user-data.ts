import { Pool } from 'pg'
import type { NextApiRequest, NextApiResponse } from 'next'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Set this in .env.local
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid user_id' })
  }

  try {
    const result = await pool.query(
      `SELECT users.fullname, users.nft
       FROM users
       WHERE users.id = $1
       LIMIT 1`,
      [user_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json(result.rows[0])
  } catch (err) {
    console.error('DB error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
