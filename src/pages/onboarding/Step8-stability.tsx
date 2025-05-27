// src/pages/onboarding/Step8.tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function base64ToBlobUrl(base64: string): string {
  const parts = base64.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png'
  const binary = atob(parts[1])
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([array], { type: mime })
  return URL.createObjectURL(blob)
}

export default function Step8() {
  const router = useRouter()
  const { user_id } = router.query as { user_id?: string }
  const [generating, setGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [interests, setInterests] = useState<any[]>([])
  const [manifesto, setManifesto] = useState('')
  const [generatedUrl, setGeneratedUrl] = useState('')

  useEffect(() => {
    async function buildPrompt() {
      if (!user_id) return

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('manifesto, photo_url')
        .eq('id', user_id)
        .single()

      if (profileError || !profile) {
        console.error('Failed to fetch profile:', profileError)
        return
      }

      setManifesto(profile.manifesto)
      setPhotoUrl(profile.photo_url)

      function extractKeywords(text: string): string[] {
        const stopwords = new Set([
          'i', 'me', 'my', 'myself', 'we', 'our', 'you', 'your', 'the', 'and', 'is',
          'a', 'to', 'of', 'in', 'it', 'that', 'this', 'on', 'with', 'for', 'at', 'by',
          'an', 'be', 'have', 'has', 'as', 'was', 'are'
        ])
        const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || []
        const counts: Record<string, number> = {}
        for (const word of words) {
          if (!stopwords.has(word)) {
            counts[word] = (counts[word] || 0) + 1
          }
        }
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w)
      }

      const { data: links, error: linksError } = await supabase
        .from('interest_links')
        .select('loves(label, popularity, attributes, categories(label))')
        .eq('user_id', user_id)

      if (linksError || !links) {
        console.error('Failed to fetch interests:', linksError)
        return
      }

      const parsed = links.map((link: any) => ({
        label: link.loves?.label,
        category: link.loves?.categories?.label
      }))

      setInterests(parsed)

      const interestDescriptions = parsed.map(i =>
        `In the category of ${i.category}, their defining love is ${i.label}.`
      ).join('\n')

      const emotionalTone = extractKeywords(profile.manifesto)

      const fullPrompt = `
        Create a highly detailed surrealist portrait of a person. Do not include any written words or labels in the image. 
        This portrait should visually reflect their defining passions and emotional energy. 

        Use the following personal manifesto as the emotional and thematic foundation for the image — do not include any text from it, but interpret its mood, values, and spirit into the style, expression, and atmosphere of the portrait:

        ("${profile.manifesto}":0.4)

        Their defining interests are:
        - ${interestDescriptions}

        The final image should be expressive, symbolic, and visually meaningful. Portrait orientation only. use all elements of this prompt. 
      `

      setPrompt(fullPrompt)
    }

    buildPrompt()
  }, [user_id])

  const handleGenerate = async () => {
    if (!prompt || !manifesto || !photoUrl) return
    setGenerating(true)

    try {
      const res = await fetch('/api/generate-image-stability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, manifesto, photo_url: photoUrl, interests }),
      })

      const { image_url } = await res.json()

      if (!image_url) {
        console.error('No image_url returned from /api/generate-image-stability')
        return
      }

      const blobUrl = base64ToBlobUrl(image_url)
      setGeneratedUrl(blobUrl)
    } catch (err) {
      console.error('Error generating image:', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 py-10">
      <h1 className="text-xl font-bold mb-4">Preview Your Prompt</h1>

      <p className="max-w-2xl text-gray-700 mb-6 italic whitespace-pre-line border-l-4 border-blue-300 pl-4">
        {prompt || 'Loading...'}
      </p>

      {!generatedUrl && (
        generating ? (
          <div className="flex flex-col items-center">
            <p className="text-lg font-medium text-gray-700 mb-4">Creating your unique NFT…</p>
            <img
              src="https://media.giphy.com/media/y1ZBcOGOOtlpC/giphy.gif"
              alt="Loading animation"
              className="w-32 h-32"
            />
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!prompt}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue and Generate Image
          </button>
        )
      )}

      {generatedUrl && (
        <div className="mt-6 text-center">
          <img
            src={generatedUrl}
            alt="Generated NFT"
            className="w-[240px] rounded-xl shadow-xl border border-gray-200"
          />
          <a
            href={generatedUrl}
            download="nft.png"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-blue-600 hover:text-blue-800 underline"
          >
            Open or Save Image
          </a>
          <div className="mt-4 flex gap-4 justify-center">
            <button
              onClick={() => router.reload()}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Regenerate Image
            </button>
            <button
              onClick={() => router.push({ pathname: '/dashboard', query: { user_id } })}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Continue to Final Page
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
