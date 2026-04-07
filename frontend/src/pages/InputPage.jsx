import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { processWish } from '../api/processWish.js'
import WishForm from '../components/WishForm.jsx'

export default function InputPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(wish) {
    setIsLoading(true)
    setError(null)
    try {
      const result = await processWish(wish)
      navigate({ to: '/result', state: { result } })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-stone-50 flex flex-col items-center justify-center px-4 py-16 gap-8">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-semibold text-stone-800 mb-2">Kriyashakti AI</h1>
        <p className="text-stone-500 text-base">
          Say it however it comes. We'll shape it into a clear Kriyashakti.
        </p>
      </div>

      <WishForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <p role="alert" className="text-sm text-red-600 max-w-xl text-center">
          {error}
        </p>
      )}
    </main>
  )
}
