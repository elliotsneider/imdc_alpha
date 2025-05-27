// pages/api/update-nft.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // must be set in .env
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, nft } = req.body

  if (!user_id || !nft) {
    return res.status(400).json({ error: 'Missing user_id or photo_url' })
  }

  try {
    await pool.query(
      'UPDATE users SET nft = $1, modified = NOW() WHERE id = $2',
      [nft, user_id]
    )

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('DB error:', error)
    res.status(500).json({ error: 'Failed to update NFT' })
  }
}
