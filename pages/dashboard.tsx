import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [manifesto, setmanifesto] = useState('')
  const [interests, setInterests] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      } else {
        setSession(session)
        fetchProfile(session.user.id)
      }
    }
    getSession()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
      setmanifesto(data.manifesto || '')
      setInterests(data.interests?.join(', ') || '')
      setImageUrl(data.image_url || '')
    }
    setLoading(false)
  }

  const updateProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        manifesto,
        interests: interests.split(',').map((s) => s.trim()),
        image_url: imageUrl
      })
      .eq('id', profile.id)

    if (error) alert('Error updating profile')
    else alert('Profile updated!')
  }

  const generateImage = async () => {
    const prompt = `A digital portrait of someone who loves ${interests}, artistic and symbolic`
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const data = await response.json()
    if (data.image_url) setImageUrl(data.image_url)
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Your IMDC Dashboard</h1>

      <label className="block mb-2 font-semibold">manifesto</label>
      <textarea
        className="w-full p-2 border rounded mb-4"
        value={manifesto}
        onChange={(e) => setmanifesto(e.target.value)}
      />

      <label className="block mb-2 font-semibold">Interests (comma-separated)</label>
      <input
        className="w-full p-2 border rounded mb-4"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
      />

      <div className="flex items-center justify-between mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={updateProfile}
        >
          Save Profile
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={generateImage}
        >
          Generate Identity Image
        </button>
      </div>

      {imageUrl && (
        <div className="mt-6">
          <img src={imageUrl} alt="Profile Identity" className="w-48 h-48 object-cover rounded-full" />
        </div>
      )}
    </div>
  )
}
