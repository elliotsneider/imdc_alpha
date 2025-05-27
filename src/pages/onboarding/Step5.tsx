// src/pages/onboarding/Step5.tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useSession } from '@supabase/auth-helpers-react'

export default function Step5() {
  const router = useRouter()
  const { user_id } = router.query as { user_id?: string }
  const [manifesto, setManifesto] = useState('')
  const [loves, setLoves] = useState<{ category: string; label: string }[]>([])

      useEffect(() => {
        const fetchPreview = async () => {
          if (!user_id) return

          // Fetch manifesto
          const { data: profile } = await supabase
            .from('profiles')
            .select('manifesto')
            .eq('id', user_id)
            .single()

          if (profile?.manifesto) {
            setManifesto(profile.manifesto)
          }

          // Fetch category:loves
          const { data: loveData, error } = await supabase
            .from('interest_links')
            .select('id, loves (label, categories(label))')
            .eq('user_id', user_id)
            .eq('is_active', true) // ✅ only active ones

          if (!error && loveData) {
            const extracted = loveData.map((item: any) => ({
              category: item.loves?.categories?.label || 'Uncategorized',
              label: item.loves?.label || ''
            }))
            setLoves(extracted)
          }
        }

        fetchPreview()
      }, [user_id])

      const handleAddMore = () => {
        router.push({ pathname: '/onboarding/addLoves', query: { user_id } })
      }

      const handleEditManifesto = () => {
        router.push({ pathname: '/onboarding/Step4', query: { user_id } })
      }

      const handleContinue = () => {
        router.push({ pathname: '/onboarding/Step6', query: { user_id } })
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue px-4 py-10">
          <h1 className="text-2xl font-bold mb-6">Your Preview</h1>

          <div className="mb-8 w-full max-w-2xl border p-6 rounded bg-gray-50 shadow text-black">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Your Manifesto</h2>
              <button
                onClick={handleEditManifesto}
                className="text-sm text-blue-600 underline hover:text-blue-800"
              >
                Edit
              </button>
            </div>
            <p className="italic text-gray-700">{manifesto || 'No manifesto found.'}</p>
          </div>

          <div className="w-full max-w-2xl border p-6 rounded bg-gray-50 shadow mb-6 text-black">
            <h2 className="text-xl font-semibold mb-4">What You Love</h2>
            {loves.length > 0 ? (
              <ul className="list-disc list-inside">
                {loves.map((love, i) => (
                  <li key={i} className="mb-1">
                    <strong>{love.category}:</strong> {love.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No entries found.</p>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleAddMore}
              className="bg-gray-100 text-gray-800 px-6 py-2 rounded hover:bg-gray-200"
            >
              Add More Loves
            </button>
           <br/> <br/>
              <button
              onClick={handleContinue}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Continue to Create your NFT!!
            </button>
          </div>
        </div>
      )
    }

