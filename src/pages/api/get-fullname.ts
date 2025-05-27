// /pages/api/get-fullname.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g. postgres://user:pass@localhost:5432/mydb
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid user_id' })
  }

  try {
    const result = await pool.query(
      'SELECT fullname FROM users WHERE id = $1 LIMIT 1',
      [user_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({ fullname: result.rows[0].fullname })
  } catch (error) {
    console.error('Postgres error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
