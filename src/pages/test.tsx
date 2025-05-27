export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-black flex items-center justify-center text-white text-center px-6">
      <div className="space-y-6 max-w-xl">
        <h1 className="text-5xl font-bold tracking-tight drop-shadow-xl">
          Welcome to Your Identity Portal
        </h1>
        <p className="text-lg text-white/80">
          This is a modern Tailwind + Next.js starter. Gradients, responsive layout, and utility classes all work out of the box.
        </p>
        <div className="w-40 h-40 mx-auto bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl shadow-lg" />
      </div>
    </div>
  )
}
