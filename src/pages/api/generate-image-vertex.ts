// src/pages/api/generate-image-vertex.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { VertexAI } from '@google-cloud/vertexai'
import { Storage } from '@google-cloud/storage'
import { v4 as uuidv4 } from 'uuid'

// Config
const project = 'imdc-461114'
const location = 'us-central1'
const bucketName = 'imdc-nft'

const vertexAi = new VertexAI({
    project: 'imdc-461114',
    location: 'us-central1',
  })
const storage = new Storage()

// ✅ Clean and retry-safe image generation
async function generateImage(prompt: string, photo_url: string, retries = 2): Promise<string> {
  console.log(`🧠 generateImage called with prompt: "${prompt}"`)

  const model = vertexAi.preview.getGenerativeModel({ model: 'imagen-3.0-generate-002' })
  const requestPayload = {
      contents: [
        {
          role: 'user',
            parts: [
                    { text: prompt },
                    {
                      fileData: {
                        mimeType: 'image/jpeg',
                        fileUri: photo_url, // 👈 use the one passed from Step8.tsx
                      },
            }
          ]
        }
      ]
    }

  console.log('📤 VertexAI.generateContent payload:', JSON.stringify(requestPayload, null, 2))

  try {
    const result = await model.generateContent(requestPayload)

    console.log('✅ VertexAI.generateContent response:', result.response?.candidates?.[0]?.content?.parts?.[0])

    const base64 = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
    if (!base64) throw new Error('No image returned from Imagen 4')

    const buffer = Buffer.from(base64, 'base64')
    const filename = `imagen4-${uuidv4()}.png`
    const file = storage.bucket(bucketName).file(filename)

    await file.save(buffer, {
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000',
      },
      public: true,
    })

    return `https://storage.googleapis.com/${bucketName}/${filename}`
  } catch (err: any) {
    console.error('❌ VertexAI generateContent failed:', {
      code: err.code,
      message: err.message,
      full: err,
    })
    throw err
  }
}

// ✅ API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { prompt, photo_url } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' })
  }
    // 🔥 Debug: Log each time a request comes in
      console.log(`[${new Date().toISOString()}] 🔥 Sending image generation request with prompt:`, prompt)
    
  try {
    const imageUrl = await generateImage(prompt, photo_url)
    res.status(200).json({ imageUrl })
  } catch (err) {
    console.error('Image generation error:', err)
    res.status(500).json({ error: 'Failed to generate image' })
  }
}
