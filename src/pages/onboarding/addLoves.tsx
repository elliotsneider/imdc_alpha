import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoveModal from '../../components/LoveModal'

export default function Step2() {
  const router = useRouter()
  const { user_id } = router.query as { user_id?: string }
  const [categories, setCategories] = useState<string[]>([])
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const prompts = [
    'Pick a category. Then tell us the one thing in it that makes you you.',
    'Start anywhere. Choose a category, then name what defines you within it.',
    'What’s at your core? Pick a category and reveal your #1 love.',
    'Pick a lens. Then name the one thing in that world that feels most like you.',
    'Choose a category and drop the one love that says the most about who you are.',
    'Click a category. Then name the thing that would go on your cosmic trading card.',
    'If the category was your stage, what would be the headline act?',
    'Pick a category and shout your #1 obsession into the universe.',
    'Pick a world. Then drop the name of your ride-or-die within it.',
    'Step into a category and give us the one love that rules it all.'
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user_id) return

      const res = await fetch(`/api/get-fullname?user_id=${user_id}`)
      const data = await res.json()

      if (data?.fullname) {
        const firstName = data.fullname.trim().split(' ')[0]
        setName(firstName.charAt(0).toUpperCase() + firstName.slice(1))
      }

      const { data: cats, error } = await supabase
        .from('categories')
        .select('label')
        .order('label')

      if (cats) setCategories(cats.map((c) => c.label))
      if (error) console.error(error)

      const random = prompts[Math.floor(Math.random() * prompts.length)]
      setPrompt(random)
    }

    fetchUserData()
  }, [user_id])

  const handleChoice = (cat: string) => {
    if (!user_id) return
    setSelectedCategory(cat)
    setShowModal(true)
  }

  const handleSkip = () => {
    if (!user_id) return
    router.push({ pathname: '/onboarding/Step5', query: { user_id } })
  }

  return (
    <div className="mb-20 flex flex-col items-center justify-center h-screen bg-green">
      <h1 className="text-xl font-serif mb-4">
        {name ? `hi ${name}` : 'hi there'}
      </h1>
      <p className="mb-6 italic text-gray-700 text-xl sm:text-xl md:text-2xl max-w-lg text-center text-white">
        {prompt}
      </p>
      <div className="flex flex-wrap gap-3 max-w-md justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleChoice(cat)}
            className="px-4 py-2 border rounded-full hover:bg-gray-100"
          >
            {cat}
          </button>
        ))}
      </div>
      <br />
      <button
        onClick={handleSkip}
        className="mt-16 px-4 py-2 text-m text-gray-100 underline hover:text-gray-300 text-white"
      >
        <br />Back to Preview<br />
      </button>

      {showModal && selectedCategory && user_id && (
        <LoveModal
          category={selectedCategory}
          userId={user_id}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            // Optional callback on save
            console.log('Love saved!')
          }}
        />
      )}
    </div>
  )
}
