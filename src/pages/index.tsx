import { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = req.cookies.token

  if (token) {
    // Optional: verify token here if you want extra security
    return {
      redirect: {
        destination: '/onboarding/home-page',
        permanent: false,
      },
    }
  }

  return {
    props: {}, // Continue to render index page if no token
  }
}

export default function IndexPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setError('')
      try {
          const res = await fetch('/api/onboarding/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || 'Login failed')
              
          router.push('/onboarding/home-page')
  } catch (err: any) {
      setError(err.message || 'Login failed')
  }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome to IMDC</h1>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setShowLogin(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl transition"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/onboarding/Step1')}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl transition"
          >
            Register
          </button>
        </div>
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative text-black">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
            <input
              type="email"
              placeholder="Email"
              className="border w-full p-2 rounded mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="border w-full p-2 rounded mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <button
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
            >
              Log In
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
