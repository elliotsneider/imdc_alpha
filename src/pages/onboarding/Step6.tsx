// src/pages/onboarding/Step6.tsx
import { useRouter } from 'next/router'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Step6() {
    const router = useRouter()
      const { user_id } = router.query as { user_id?: string }
      const [uploading, setUploading] = useState(false)
      const [previewUrl, setPreviewUrl] = useState<string | null>(null)

      const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user_id) return

        const filePath = `${user_id}/${Date.now()}_${file.name}`
        setUploading(true)

        const { error: uploadError } = await supabase.storage
          .from('imdc-photo')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Upload failed:', uploadError.message)
          setUploading(false)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('imdc-photo')
          .getPublicUrl(filePath)

        const imageUrl = publicUrlData.publicUrl

        setPreviewUrl(imageUrl)

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ photo_url: imageUrl })
          .eq('id', user_id)

        if (updateError) {
          console.error('Failed to save image URL:', updateError.message)
            
        }

        setUploading(false)
        router.push({ pathname: '/onboarding/Step7', query: { user_id } })
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green px-4 py-10">
          <h1 className="text-2xl font-bold mb-4 text-center">Upload a selfie (or any photo of you!)<br/><br/>
          You’ll get back a one-of-a-kind, AI-powered version of yourself — stylized, expressive, and impossible to copy. </h1>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="mb-4"
              />

              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="w-48 h-48 rounded-full object-cover shadow" />
              )}

              {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
            </div>
          )
        }
