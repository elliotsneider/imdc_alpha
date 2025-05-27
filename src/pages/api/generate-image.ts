import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  try {
    console.log("API key loaded?", !!process.env.OPENAI_API_KEY);
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n:    1,
      size:  "1024x1024",
      response_format: "url"
    })

    const image_url = response.data?.[0]?.url
    res.status(200).json({ image_url })
  } catch (error: any) {
    console.error('OpenAI error:', JSON.stringify(error, null, 2))
    res.status(500).json({ error: error.message || 'Unknown error' })
  }
}
