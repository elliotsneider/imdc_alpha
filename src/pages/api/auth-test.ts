import { VertexAI } from '@google-cloud/vertexai'

const vertexAi = new VertexAI({ project: 'imdc-461114', location: 'us-central1' })
const model = vertexAi.getGenerativeModel({ model: 'imagegeneration@002' })

async function testAuth() {
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'a glowing red apple in moonlight' }] }],
    })
    console.log('✅ Auth worked and response received')
  } catch (err) {
    console.error('❌ Vertex AI auth or permission failed:', err)
  }
}

testAuth()
