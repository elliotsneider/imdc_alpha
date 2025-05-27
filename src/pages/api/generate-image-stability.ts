// /pages/api/generate-image-stability.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import FormData from 'form-data'
import fetch from 'node-fetch'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, photo_url } = req.body

  if (!prompt || !photo_url) {
    return res.status(400).json({ error: 'Missing prompt or photo_url' })
  }

  try {
    // Fetch the image and convert to Buffer
    const imageRes = await fetch(photo_url)
    if (!imageRes.ok) throw new Error('Failed to fetch photo')

    const imageBuffer = await imageRes.buffer()

    const form = new FormData()
    form.append('prompt', prompt)
    form.append('strength', '0.3')
    form.append('model', 'core')
    form.append('output_format', 'png')
    form.append('style_preset', 'photographic')

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY!}`,
        Accept: 'image/*',
        ...form.getHeaders(), // required to set multipart boundary
      },
      body: form,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Stability API error:', errorText)
      return res.status(500).json({ error: 'Stability API failed' })
    }

    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    return res.status(200).json({ image_url: dataUrl })
  } catch (err: any) {
    console.error('Error generating image:', err.message)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
