import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { processWish } from '../api/processWish.js'
import { setWishResult, getPendingEdit, clearPendingEdit } from '../store/wishResult.js'
import { findInHistory, saveToHistory } from '../store/historyDB.js'
import WishForm from '../components/WishForm.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'

export default function InputPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pendingEdit, setPendingEditState] = useState('')

  useEffect(() => {
    const edit = getPendingEdit()
    if (edit) {
      setPendingEditState(edit)
      clearPendingEdit()
    }
  }, [])

  async function handleSubmit(wish) {
    setIsLoading(true)
    setError(null)
    try {
      // Check history first — skip API if we already have this wish
      const cached = await findInHistory(wish)
      if (cached) {
        setWishResult(cached)
        navigate({ to: '/result' })
        return
      }

      const result = await processWish(wish)
      const id = await saveToHistory(result)
      setWishResult({ ...result, id })
      navigate({ to: '/result' })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingScreen />

  return (
    <main className="min-h-screen bg-linear-to-br from-violet-50 to-stone-50 flex flex-col items-center justify-center px-4 py-16 gap-8">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-semibold text-stone-800 mb-2">Kriyashakti AI</h1>
        <p className="text-stone-500 text-base">
          Say it however it comes. We'll shape it into a clear Kriyashakti.
        </p>
      </div>

      <WishForm key={pendingEdit} onSubmit={handleSubmit} isLoading={isLoading} initialValue={pendingEdit} />

      {error && (
        <p role="alert" className="text-sm text-red-600 max-w-xl text-center">
          {error}
        </p>
      )}

      <button
        onClick={() => navigate({ to: '/history' })}
        className="text-sm text-stone-400 hover:text-violet-600 transition-colors"
      >
        View history
      </button>

      {/* DEV ONLY */}
      <button
        onClick={() => setIsLoading(true)}
        className="text-xs text-stone-300 hover:text-stone-400 transition-colors"
      >
        [test loader]
      </button>
    </main>
  )
}
