export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 z-[-1]" />

      {/* Foreground text */}
      <div className="relative z-10 flex items-center justify-center h-full text-white text-center">
        <h1 className="text-5xl font-bold">THIS SHOULD SHOW A GRADIENT</h1>
      </div>
    </div>
  )
}
