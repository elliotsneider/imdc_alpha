import { useState } from 'react'

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('a symbolic portrait of a jazz-loving traveler, painted in surreal style')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: '1024x1024' }),
      })

      const data = await res.json()
      if (res.ok && data.image_url) {
        setImageUrl(data.image_url)
      } else {
        setError(data.error || 'No image returned')
      }
    } catch (err) {
      setError('Failed to connect to API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate DALL·E Image</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        rows={4}
      />

      <button
        onClick={generate}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}
      {imageUrl && (
        <div className="mt-6">
          <img src={imageUrl} alt="Generated" className="w-full rounded shadow" />
        </div>
      )}
    </div>
  )
}
