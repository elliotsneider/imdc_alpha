import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { GetServerSideProps } from 'next'
import jwt from 'jsonwebtoken'
import AuthenticatedLayout from '../../components/AuthenticatedLayout'

export default function HomePage({
  userId,
  email,
}: {
  userId: string
  email: string
}) {
  const router = useRouter()

  const [background, setBackground] = useState('from-gray-900 via-slate-900 to-indigo-900')
  const [fullName, setFullName] = useState('')
  const [nftUrl, setNftUrl] = useState('')
  const [manifesto, setManifesto] = useState('')
  const [loves, setLoves] = useState<{ category: string; label: string }[]>([])

  const backgroundOptions = [
    { label: 'Midnight Indigo', value: 'from-gray-900 via-slate-900 to-indigo-900' },
    { label: 'Sunset Rose', value: 'from-pink-500 via-red-500 to-yellow-500' },
    { label: 'Ocean Blue', value: 'from-cyan-500 via-blue-600 to-indigo-700' },
    { label: 'Tropical Green', value: 'from-emerald-500 via-teal-500 to-cyan-600' }
  ]

  useEffect(() => {
    if (!userId) return

    const loadData = async () => {
      const res = await fetch(`/api/profile/${userId}`)
      const localData = await res.json()

      if (res.ok) {
        setFullName(localData.fullname)
        setNftUrl(localData.nft)
      } else {
        console.error('Failed to fetch local user data:', localData.error)
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('manifesto')
        .eq('id', userId)
        .single()

      if (profileData?.manifesto) {
        setManifesto(profileData.manifesto)
      }

      const { data: loveData, error } = await supabase
        .from('interest_links')
        .select('loves(label, categories(label))')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        console.error('Failed to fetch active loves:', error)
      } else if (loveData) {
        const parsed = loveData.map((link: any) => ({
          label: link.loves?.label,
          category: link.loves?.categories?.label
        }))
        setLoves(parsed)
      }
    }

    loadData()
  }, [userId])

  return (
    <AuthenticatedLayout userEmail={email}>
      <div className={`min-h-screen bg-gradient-to-tr ${background} text-white px-4 sm:px-6 py-12 flex flex-col items-center font-sans`}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2 text-center">Choose Background:</label>
          <select
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm border border-gray-900"
          >
            {backgroundOptions.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <h1 className="text-9xl sm:text-9xl font-black mb-10 tracking-tight drop-shadow-2xl text-center">
          {fullName}
        </h1>

        {nftUrl && (
          <div className="relative group w-110 h-110">
            <img
              src={nftUrl}
              alt="Your generated NFT"
              className="w-full h-full object-cover rounded-3xl shadow-lg"
            />

            <div className="absolute inset-0 bg-black bg-opacity-60 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="relative">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  🎨 Remix this NFT
                </div>
                <button
                  onClick={() => router.push(`/onboarding/Step8?user_id=${userId}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Generate New Image
                </button>
              </div>
            </div>
          </div>
        )}
        <br /><br />

        {manifesto && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-12 text-center mx-auto border border-white/20 shadow-lg w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300 tracking-wide">My Manifesto - {manifesto}</h2>
            <p className="text-lg italic text-slate-100 whitespace-pre-line leading-relaxed"></p>
          </div>
        )}

        {loves.length > 0 && (
          <div className="w-full max-w-5xl px-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-pink-200 tracking-wider uppercase">
              The things I love
            </h2>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {loves.map((love, idx) => (
                <div
                  key={idx}
                  className={`rounded-3xl p-4 sm:p-6 shadow-lg transition-all duration-300 transform hover:scale-105 w-[200px] sm:w-[250px]
                  font-semibold tracking-wide text-center text-base sm:text-lg
                  ${
                    idx % 3 === 0
                      ? 'bg-gradient-to-br from-rose-500 to-pink-600'
                      : idx % 3 === 1
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  }`}
                >
                  <h3 className="font-extrabold uppercase tracking-wide mb-2 text-white drop-shadow">
                    {love.category}: {love.label}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={async () => {
            await fetch('/api/logout')
            router.push('/')
          }}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-md"
        >
          Log Out
        </button>
      </div>
    </AuthenticatedLayout>
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
