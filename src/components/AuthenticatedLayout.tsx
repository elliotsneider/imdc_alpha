// components/AuthenticatedLayout.tsx
import { useRouter } from 'next/router'

export default function AuthenticatedLayout({
  children,
  userEmail,
}: {
  children: React.ReactNode
  userEmail: string
}) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/logout')
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="text-lg font-bold">IMDC</div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Signed in as {userEmail}</span>
          <button
            onClick={() => router.push('/profile')}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
          >
            Profile Settings
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="flex-grow bg-gray-100 p-6">{children}</main>

      {/* You could add a comparison widget or footer here too */}
    </div>
  )
}
