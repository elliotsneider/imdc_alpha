// src/pages/dashboard.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

interface Love {
  category: string
  label: string
}

export default function Dashboard() {
  const router = useRouter()
  const { user_id } = router.query as { user_id?: string }

  const [fullName, setFullName] = useState('')
  const [nftUrl, setNftUrl] = useState('')
  const [manifesto, setManifesto] = useState('')
  const [loves, setLoves] = useState<Love[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!router.isReady || !user_id) return
    fetchData()
  }, [router.isReady, user_id])

  const fetchData = async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/profiles/${user_id}`)
      const profile = await res.json()

      if (res.ok) {
        setFullName(profile.name || '')
        setNftUrl(profile.nft || '')
        setManifesto(profile.manifesto || '')

        const parsedLoves: Love[] = []
        for (const category in profile.interests) {
          profile.interests[category].forEach((item: any) => {
            parsedLoves.push({ category, label: item.label })
          })
        }
        setLoves(parsedLoves)
      } else {
        console.error('Profile fetch error:', profile.error)
      }
    } catch (err) {
      console.error('Fetch failed:', err)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-16 flex flex-col items-center font-sans">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome, {fullName}</h1>

      {nftUrl && (
        <div className="mb-10">
          <img src={nftUrl} alt="Your NFT" className="w-64 h-64 rounded-3xl shadow-lg" />
        </div>
      )}

      {manifesto && (
        <div className="bg-white/10 p-6 rounded-xl mb-10 max-w-xl text-center">
          <h2 className="text-xl font-semibold mb-2 text-cyan-400">Manifesto</h2>
          <p className="italic text-slate-200 whitespace-pre-line">{manifesto}</p>
        </div>
      )}

      {loves.length > 0 && (
        <div className="max-w-4xl w-full">
          <h2 className="text-2xl font-bold text-center text-pink-300 mb-6">Your Defining Loves</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {loves.map((love, idx) => (
              <li
                key={idx}
                className="bg-gradient-to-br from-purple-500 to-indigo-700 p-4 rounded-2xl shadow-md text-center"
              >
                <p className="font-bold text-white uppercase text-sm mb-1">{love.category}</p>
                <p className="italic text-white/90">{love.label}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

