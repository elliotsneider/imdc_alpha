// scripts/checkModels.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: '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' // <-- insert here
})

async function listModels() {
  const models = await openai.models.list()
  const ids = models.data.map((m) => m.id)
  console.log(ids)
}

listModels()
