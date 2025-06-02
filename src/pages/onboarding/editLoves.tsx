import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function Step3() {
  const router = useRouter()
  const [category, setCategory] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [love, setLove] = useState('')
  const [suggestions, setSuggestions] = useState<{ label: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentLove, setCurrentLove] = useState<string | null>(null)

  // Get router params
  useEffect(() => {
    if (router.isReady) {
      const { category, user_id } = router.query
      if (typeof category === 'string') setCategory(category)
      if (typeof user_id === 'string') setUserId(user_id)
    }
  }, [router.isReady, router.query])

  // Load categoryId and current love
  useEffect(() => {
    const loadCategoryAndLove = async () => {
      if (!category || !userId) return

      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('label', category)
        .single()

      if (catError || !catData?.id) return

      setCategoryId(catData.id)

      const { data: loveData } = await supabase
        .from('interest_links')
        .select('loves(label)')
        .eq('user_id', userId)
        .eq('category_id', catData.id)
        .eq('is_active', true)
        .single()

      if (loveData?.loves?.label) {
        setCurrentLove(loveData.loves.label)
      }
    }

    loadCategoryAndLove()
  }, [category, userId])

  // Fetch suggestions filtered by category
  useEffect(() => {
    const fetchSuggestions = async (query: string) => {
      if (!categoryId || query.trim() === '') {
        setSuggestions([])
        return
      }

      const { data, error } = await supabase
        .from('loves')
        .select('label')
        .eq('category_id', categoryId)
        .ilike('label', `%${query}%`)
        .limit(10)

      if (!error && data) {
        setSuggestions(data)
        setShowSuggestions(true)
      }
    }

    fetchSuggestions(love)
  }, [love, categoryId])

  const handleAdd = async () => {
    if (!userId || !category || !love) {
      toast.error('Missing information')
      return
    }

      try {
          // Check if this exact love is already active
          const { data: existing, error: existingError } = await supabase
            .from('interest_links')
            .select('id, loves(label)')
            .eq('user_id', userId)
            .eq('category_id', categoryId)
            .eq('is_active', true)
            .single()

          if (!existingError && existing?.loves?.label === love) {
            toast.success('Love already active!')
            router.push({ pathname: '/onboarding/addLoves', query: { user_id: userId } })
            return
          }

          // Otherwise deactivate all active in this category
          await supabase
            .from('interest_links')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('category_id', categoryId)
            .eq('is_active', true)

          // Add new love if needed
          const { error } = await supabase.rpc('add_interest_if_missing', {
            user_id: userId,
            category_label: category,
            item_label: love,
            item_attributes: null,
          })

          if (error) {
            toast.error('Failed to save love')
          } else {
            toast.success('Love saved!')
            setLove('')
            setSuggestions([])
            setShowSuggestions(false)
            router.push({ pathname: '/onboarding/addLoves', query: { user_id: userId } })
          }
        } catch (err) {
          console.error('Unexpected error:', err)
          toast.error('Unexpected error occurred')
        }
      }
  const handleCancel = () => {
    router.push({ pathname: '/onboarding/addLoves', query: { user_id: userId } })
  }

  if (!category || !userId) {
    return <p className="text-center mt-20 text-gray-500">Loading...</p>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-magenta px-4">
      <div className="text-center relative">
        <h1 className="text-xl font-serif mb-4">
          In <span className="font-bold">{category}</span>, what is the one love that defines you?
        </h1>
        <h3 className="italic text-m font-serif mb-4">
          It could be a style, a specific reference, a person, or even a feeling.
        </h3>

        {currentLove && (
          <div className="mb-4 text-white">
            <p className="italic">Current love: <strong>{currentLove}</strong></p>
          </div>
        )}

        <div className="relative w-64 mx-auto">
          <input
            type="text"
            value={love}
            onChange={(e) => {
              setLove(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => love.length > 1 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="border p-2 rounded w-full text-black"
            placeholder="Type your love..."
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-300 rounded shadow max-h-48 overflow-y-auto text-left mt-1 text-black">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setLove(s.label)
                    setShowSuggestions(false)
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {s.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
