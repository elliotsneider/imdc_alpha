import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Check required env vars
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing Supabase keys')
    return res.status(500).json({ error: 'Supabase config missing' })
  }

  // ✅ Validate user ID
  const { id } = req.query
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' })
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // ✅ 1. Fetch user profile from Postgres
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        nft: true
      }
    })

    if (!user) return res.status(404).json({ error: 'User not found' })

    // ✅ 2. Get manifesto and interest links from Supabase
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('manifesto, photo_url')
      .eq('id', id)
      .single()

    if (profileError) {
      console.warn('Supabase profile error:', profileError.message)
    }

    const { data: interestLinks, error: interestError } = await supabase
      .from('interest_links')
      .select('loves(id, label, popularity, attributes, categories(label))')
      .eq('user_id', id)
      .eq('is_active', true)

    if (interestError) {
      console.warn('Supabase interest error:', interestError.message)
    }

    // ✅ 3. Organize interests by category
    const interests: Record<string, any[]> = {}
    for (const link of interestLinks || []) {
      const love = link.loves
      const category = love?.categories?.label || 'uncategorized'
      if (!interests[category]) interests[category] = []
      interests[category].push({
        id: love.id,
        label: love.label,
        popularity: love.popularity,
        attributes: love.attributes
      })
    }

    // ✅ 4. Return hydrated profile blob
    return res.status(200).json({
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      nft: user.nft
    })

  } catch (err) {
    console.error('API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
