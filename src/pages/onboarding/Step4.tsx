// src/pages/onboarding/Step4.tsx
import { useRouter } from 'next/router'
import { useEffect, useState, showHelp} from 'react'
import { supabase } from '../../lib/supabase'

export default function Step4() {
  const router = useRouter()
  const { user_id } = router.query as { user_id?: string }
  const [showHelp, setShowHelp] = useState(false)
  const [man, setMan] = useState('')
  const maxChars = 188

  const handleSubmit = async () => {
    if (!user_id) {
      console.error('Missing user_id')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user_id, manifesto: man })

    if (error) {
      console.error('Error saving manifesto:', error)
    } else {
      router.push({ pathname: '/onboarding/Step5', query: { user_id } })
    }
  }

  return (
          <div className="flex flex-col items-center justify-center h-screen bg-blue px-4">
                <h1 className="text-xl font-serif mb-6 text-center max-w-xl">
                  Ok, now time for your manifesto. A single statement, no more than 188 characters long.
                </h1>

          <textarea
            value={man}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                setMan(e.target.value)
              }
            }}
            className="w-full max-w-xl min-h-[160px] border border-gray-300 p-4 rounded-lg text-lg resize-none shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Write something that defines you..."
          />
          <br/><br/><button
                  onClick={() => setShowHelp(!showHelp)}
                  className="mb-4 text-sm text-blue-600 underline hover:text-blue-800"
                >
                  {showHelp ? 'Hide help' : 'Why 188 characters?'}
                </button>

                {showHelp && (
                  <div className="mb-4 max-w-xl text-sm italic text-white border-l-4 border-blue-300 pl-4">
                    Why 188 characters? It is the number of characters in the following, from "Leaves of Grass": <br/><br/>“THE SPOTTED HAWK SWOOPS BY AND ACCUSES ME, HE COMPLAINS
                    OF MY GAB AND MY LOITERING.<br/><br/>
                    I TOO AM NOT A BIT TAMED, I TOO AM UNTRANSLATABLE,<br/>
                    I SOUND MY BARBARIC YAWP OVER THE ROOFS OF THE WORLD.”<br/><br/>
                    — Walt Whitman
                  </div>
                )}

              

                <p className="mt-3 text-sm text-gray-700 font-mono text-white">{man.length} / {maxChars} characters</p>

                <button
                  onClick={handleSubmit}
                  className="mt-6 bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
                  disabled={man.length === 0 || man.length > maxChars}
                >
                  Save manifesto and CONTINUE
                </button>
              </div>
  )
}
