// src/pages/onboarding/Step8.tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

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
    if (!router.isReady || !user_id) return

    async function buildPrompt() {
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

      const { data: links, error: linksError } = await supabase
        .from('interest_links')
        .select('loves(label, popularity, attributes, categories(label))')
        .eq('user_id', user_id)
        .eq('is_active', true)

      if (linksError || !links) {
        console.error('Failed to fetch interests:', linksError)
        return
      }

      const parsed = links.map((link: any) => ({
        label: link.loves?.label,
        category: link.loves?.categories?.label,
        popularity: link.loves?.popularity,
        attributes: link.loves?.attributes,
      }))

      setInterests(parsed)

      const interestDescriptions = parsed.map(i =>
        `In the category of ${i.category}, their defining love is ${i.label}.`
      ).join('\n')

      const fullPrompt = `
        Create a highly detailed surrealist portrait of a person. Do not include any written words or labels in the image. 
        This portrait should visually reflect their defining passions and emotional energy. 

        Use the following personal manifesto as the emotional and thematic foundation for the image — do not include any text from it, but interpret its mood, values, and spirit into the style, expression, and atmosphere of the portrait:

        "${profile.manifesto}"

        Their defining interests are:
        - ${interestDescriptions}

        The final image should be expressive, symbolic, and visually meaningful. Portrait orientation only.
      `

      setPrompt(fullPrompt)
    }

    buildPrompt()
  }, [router.isReady, user_id])

  const handleGenerate = async () => {
    if (!prompt || !manifesto || !photoUrl || generating) return
    setGenerating(true)

    console.log('⚡ handleGenerate fired')
    console.log('📝 Prompt:', prompt)

    const res = await fetch('/api/generate-image-vertex', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        manifesto,
        photo_url: photoUrl,
        interests,
      }),
    })

    const { image_url } = await res.json()
    setGeneratedUrl(image_url)

    const saveRes = await fetch('/api/save-nft-to-supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        image_url,
      }),
    })

    const result = await saveRes.json()
    console.log('Stored NFT URL:', result.nft_url)

    setGenerating(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 py-10">
      <h1 className="text-xl font-bold mb-4">Preview Your Prompt</h1>

      <p className="max-w-2xl text-gray-700 mb-6 italic whitespace-pre-line border-l-4 border-blue-300 pl-4">
        {prompt || 'Loading...'}
      </p>

      {!generatedUrl && (
        <>
          {generating ? (
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
              disabled={!prompt || generating}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Continue and Generate Image
            </button>
          )}
        </>
      )}

      {generatedUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Your Unique NFT:</h2>
          <img src={generatedUrl} alt="Generated NFT" className="w-[500px] h-auto max-w-md rounded shadow" />
          <button
            onClick={() => router.reload()}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-2"
          >
            Regenerate Image
          </button>
          <button
            onClick={async () => {
              await fetch(`/api/set-cookie?user_id=${user_id}`)
              router.push('/onboarding/home-page')
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Continue to Final Page
          </button>
        </div>
      )}
    </div>
  )
}
