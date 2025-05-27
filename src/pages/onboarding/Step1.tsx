// src/pages/onboarding/Step1.tsx
import { useRouter } from 'next/router'
import { useState, FormEvent } from 'react'

export default function Step1() {
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const res = await fetch('/api/onboarding/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, password })
    })

    const result = await res.json()
    if (res.ok) {router.push({
        pathname: '/onboarding/Step2',
        query: { user_id: result.id }
      })
    } else {
      setError(result.error || 'Something went wrong')
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-blue">
      <form onSubmit={handleSubmit} className="text-center max-w-sm w-full px-4">
        <h1 className="text-2xl font-serif mb-4">hi. this is imdc.<br />where you can be what you love.</h1>
        <p className="mb-6">let's get started.</p>

        <input
          type="text"
          value={fullname}
          onChange={e => setFullname(e.target.value)}
          placeholder="Full name"
          className="border p-2 rounded w-full mb-4 text-black"
          required
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2 rounded w-full mb-4 text-black"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2 rounded w-full mb-4 text-black"
          required
        />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Next</button>
      </form>
    </div>
  )
}

