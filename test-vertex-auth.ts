import { VertexAI } from '@google-cloud/vertexai'

const vertexAi = new VertexAI({ project: 'imdc-461114', location: 'us-central1' })
const model = vertexAi.getGenerativeModel({ model: 'imagegeneration@002' })

async function testAuth() {
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'A golden tree under a starry sky' }] }],
    })

    console.log('✅ Vertex AI auth successful.')
    console.log('Result:', JSON.stringify(result.response, null, 2))
  } catch (err) {
    console.error('❌ Vertex AI auth failed:', err)
  }
}

testAuth()