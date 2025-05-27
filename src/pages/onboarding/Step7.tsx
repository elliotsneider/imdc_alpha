
// src/pages/onboarding/Step8.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Step7() {
  const router = useRouter()
  const { user_id } = router.query as { user_id?: string }
    
    useEffect(() => {
      if (user_id) {
        localStorage.setItem('user_id', user_id)
      }
    }, [user_id])

    const handlePayment = async () => {
        // Redirect to your payment gateway, then on success:
        router.push({pathname: '/onboarding/Step8', query: {user_id} })
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-yellow p-6">
      <h1 className="text-xl font-serif mb-4">payment: $2.99 for NFT creation</h1>
      <button onClick={handlePayment} className="bg-green-600 text-white px-6 py-3 rounded">
        Pay $2.99
      </button>
    </div>
  )
}

