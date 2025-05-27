// src/pages/test_screen.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TestScreen() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('love_movies').select('*')
      console.log(data, error)
      if (data) setData(data)
    }
    load()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Testing Supabase Fetch</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>
    </div>
  )
}
