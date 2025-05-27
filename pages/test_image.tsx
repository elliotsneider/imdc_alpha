import { useState } from 'react'

export default function TestImagePage() {
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'a symbolic portrait of a jazz-loving traveler, painted in surreal style' })
    })

    const data = await res.json()
    setImageUrl(data.image_url || '')
    setLoading(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test DALL·E Image</h1>
      <button onClick={generate} className="bg-blue-600 text-white px-4 py-2 rounded">
        Generate Image
      </button>

      {loading && <p className="mt-4">Generating...</p>}
      {imageUrl && <img src={imageUrl} alt="Generated" className="mt-6 w-64 h-64 object-cover rounded" />}
    </div>
  )
}
