// pages/api/onboarding/create-user.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { randomUUID } from 'crypto'
import bcrypt from 'bcrypt'


const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // must be service role
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { fullname, email, password } = req.body
  const user_id = randomUUID()
  const username = email

  try {
      // 1. Hash the password securely
          const saltRounds = 10
          const hashedPassword = await bcrypt.hash(password, saltRounds)
      
      // Insert into custom Postgres profile table
          await pool.query(
            'INSERT INTO users (id, fullname, email, username, password, modified) VALUES ($1, $2, $3, $4, $5, now())',
            [user_id, fullname, email, username, hashedPassword]
          )


    // 2. Create Supabase Auth user using the same UUID
      const { error } = await supabase
        .from('profiles')
        .insert([{ id: user_id}])

      if (error) throw error
      
    if (error) throw error

    return res.status(200).json({ id: user_id })
  } catch (err: any) {
    console.error(err)
    return res.status(400).json({ error: err.message })
  }
}
