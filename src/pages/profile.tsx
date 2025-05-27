import { GetServerSideProps } from 'next'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function ProfilePage({ userId, email }: { userId: string; email: string }) {
  const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
      const fetchProfile = async () => {
        const res = await fetch(`/api/profile/${userId}`)
        const profile = await res.json()

        if (!res.ok) {
          console.error('Error fetching profile:', profile.error)
          return
        }

        setProfile(profile) // assuming you have setProfile in useState
      }

      if (userId) {
        fetchProfile()
      }
    }, [userId])

  const [loves, setLoves] = useState<{ category: string; label: string }[]>([])

  useEffect(() => {
    const fetchLoves = async () => {
      const { data, error } = await supabase
        .from('interest_links')
        .select('loves(label, categories(label))')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) console.error('Error fetching loves:', error)
      else {
        const parsed = data.map((link: any) => ({
          label: link.loves?.label,
          category: link.loves?.categories?.label,
        }))
        setLoves(parsed)
      }
    }

    fetchLoves()
  }, [userId])

  if (!profile) return <div className="p-6">Loading profile...</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="space-y-4">
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email || email}</p>
        <p><strong>Password:</strong> {profile.password || '[hidden]'}</p>
        <div>
          <strong>Loves:</strong>
          <ul className="list-disc list-inside">
            {loves.map((love, idx) => (
              <li key={idx}>{love.category}: {love.label}</li>
            ))}
          </ul>
        </div>
        {profile.nft && (
          <div>
            <strong>Your NFT:</strong>
            <img src={profile.nft} alt="NFT" className="mt-2 rounded-lg w-64 h-64 object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = req.cookies.token

  if (!token) {
    return {
      redirect: { destination: '/', permanent: false },
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      email: string
    }

    return {
      props: {
        userId: decoded.userId,
        email: decoded.email,
      },
    }
  } catch {
    return {
      redirect: { destination: '/', permanent: false },
    }
  }
} 
