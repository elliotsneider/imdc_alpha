// IMDC Profile Form Component – Federated Interest Picker + Secure Submit

// --- /components/ProfileForm.tsx ---

import { useEffect, useState } from 'react'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const categories = ['movies', 'books'] // Add more as needed

export default function ProfileForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [manifesto, setManifesto] = useState('')

  const [selectedInterests, setSelectedInterests] = useState<{ id: string, label: string, category: string }[]>([])
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('movies')
  const [suggestions, setSuggestions] = useState<any[]>([])

  useEffect(() => {
    const loadSuggestions = async () => {
      if (input.length < 2) return
      const { data } = await supabase
        .from(`favorite_${category}`)
        .select('*')
        .ilike('label', `%${input}%`)
      if (data) setSuggestions(data)
    }
    loadSuggestions()
  }, [input, category])

  const addInterest = (interest: any) => {
    const exists = selectedInterests.some(i => i.id === interest.id && i.category === category)
    if (!exists) {
      setSelectedInterests([...selectedInterests, { ...interest, category }])
    }
    setInput('')
    setSuggestions([])
  }

  const removeInterest = (id: string, category: string) => {
    setSelectedInterests(prev => prev.filter(i => i.id !== id || i.category !== category))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const res = await fetch('/api/save-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        dob,
        manifesto,
        interests: selectedInterests.map(i => ({ interestId: i.id, category: i.category }))
      })
    })
    const result = await res.json()
    if (result.success) alert('Profile saved')
    else alert('Error saving profile')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-blue-500 z-[-1]" />

      {/* Foreground Content */}
      <div className="relative z-10">
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Your Profile</h2>

          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border mb-3" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border mb-3" />
          <input type="date" placeholder="Date of Birth" value={dob} onChange={e => setDob(e.target.value)} className="w-full p-2 border mb-3" />

          <textarea placeholder="Manifesto" value={manifesto} onChange={e => setManifesto(e.target.value)} className="w-full p-2 border mb-4" />

          <label className="block mb-1">Select Interest Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border mb-2">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <input
            type="text"
            placeholder={`Search ${category}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full p-2 border mb-2"
          />

          {suggestions.length > 0 && (
            <ul className="border p-2 mb-3">
              {suggestions.map(s => (
                <li key={s.id} onClick={() => addInterest(s)} className="cursor-pointer hover:bg-gray-100 p-1">
                  {s.label}
                </li>
              ))}
            </ul>
          )}

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Selected Interests</h4>
            {selectedInterests.map((i, idx) => (
              <span key={`${i.id}-${i.category}`} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2 text-sm">
                {i.label} ({i.category})
                <button type="button" onClick={() => removeInterest(i.id, i.category)} className="ml-1 text-red-500">×</button>
              </span>
            ))}
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Profile</button>
        </form>
      </div>
    </div>
  )
}
