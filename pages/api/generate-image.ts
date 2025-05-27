import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3', // or 'dall-e-2' if you prefer faster, cheaper images
        prompt,
        n: 1,
        size: '512x512'
      })
    })

    const data = await response.json()

    if (data.error) {
      console.error('OpenAI error:', data.error)
      return res.status(500).json({ error: data.error.message })
    }

    const imageUrl = data.data[0]?.url
    res.status(200).json({ image_url: imageUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate image' })
  }
}
