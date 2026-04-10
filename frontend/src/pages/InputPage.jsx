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
    <div className="page-shell justify-center gap-10">
      <div className="page-heading">
        <h1 className="page-title">Shape your wish</h1>
        <p className="page-lead">
          Say it however it comes. We turn it into a clear Kriyashakti you can use in practice.
        </p>
      </div>

      <WishForm key={pendingEdit} onSubmit={handleSubmit} isLoading={isLoading} initialValue={pendingEdit} />

      {error && (
        <p role="alert" className="text-sm text-red-700 max-w-xl text-center text-pretty">
          {error}
        </p>
      )}

      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={() => setIsLoading(true)}
          className="text-xs text-stone-400 hover:text-stone-500 transition-colors"
        >
          [test loader]
        </button>
      )}
    </div>
  )
}
