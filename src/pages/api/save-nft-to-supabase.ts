// pages/api/save-nft-to-supabase.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, image_url } = req.body

  if (!user_id || !image_url) {
    return res.status(400).json({ error: 'Missing user_id or image_url' })
  }

  try {
    // Download the image (server-side)
    const imageRes = await fetch(image_url)
    const imageBlob = await imageRes.blob()

    // Convert to Buffer
    const arrayBuffer = await imageBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const timestamp = Date.now() // ✅ define this first
    const filePath = `${user_id}/nft${timestamp}.png`
    const { error: uploadError } = await supabase.storage
      .from('nft-images') // your bucket name
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload failed:', uploadError)
      return res.status(500).json({ error: 'Upload failed' })
    }

    // Make public and get URL
    const { data: publicUrl } = supabase
      .storage
      .from('nft-images')
      .getPublicUrl(filePath)

    // Save URL to database (if needed)
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-nft`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({
              user_id,
              nft: publicUrl.publicUrl,
          }),
      })

    return res.status(200).json({ nft_url: publicUrl.publicUrl })
  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
