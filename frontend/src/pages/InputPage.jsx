import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { processWish } from '../api/processWish.js'
import { setWishResult, getPendingEdit, clearPendingEdit } from '../store/wishResult.js'
import { ensureSessionIdForEntry, findInHistory, saveToHistory } from '../store/historyDB.js'
import WishForm from '../components/WishForm.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { isKriya, MODE } from '@/lib/mode.js'

export default function InputPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pendingEdit, setPendingEditState] = useState('')
  const heroRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    const edit = getPendingEdit()
    if (edit) {
      setPendingEditState(edit)
      clearPendingEdit()
    }
  }, [])

  // Staggered entry animation via IntersectionObserver
  useEffect(() => {
    const els = [heroRef.current, formRef.current].filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.visible = 'true'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  async function handleSubmit(wish) {
    setIsLoading(true)
    setError(null)
    try {
      const cached = await findInHistory(wish)
      if (cached) {
        const entry = await ensureSessionIdForEntry(cached)
        setWishResult(entry)
        navigate({ to: '/result/$sessionId', params: { sessionId: entry.sessionId } })
        return
      }

      const result = await processWish(wish)
      const { id, sessionId } = await saveToHistory(result)
      setWishResult({ ...result, id, sessionId })
      navigate({ to: '/result/$sessionId', params: { sessionId } })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingScreen />

  return (
    <div className="home-shell">

      {/* Title block */}
      <div
        ref={heroRef}
        className="home-hero"
        data-visible="false"
      >
        <span className="home-eyebrow">
          {isKriya ? 'Kriyashakti' : 'Intention Setting'}
        </span>
        <h1 className="home-title">
          {isKriya ? 'Shape your wish' : 'Shape your wish'}
        </h1>
        <p className="home-lead">
          {isKriya
            ? 'Say it however it comes. We turn it into a clear Kriyashakti you can use in practice.'
            : 'Say it however it comes. We turn it into a clear present-tense statement.'}
        </p>
      </div>

      {/* Form card */}
      <div ref={formRef} className="home-form-wrap" data-visible="false">
        <WishForm key={pendingEdit} onSubmit={handleSubmit} isLoading={isLoading} initialValue={pendingEdit} />

        {error && (
          <p role="alert" className="home-error">
            {error}
          </p>
        )}
      </div>

      {import.meta.env.DEV && (
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => setIsLoading(true)}
            className="text-xs text-stone-400 hover:text-stone-500 transition-colors duration-200"
          >
            [test loader]
          </button>
          <button
            type="button"
            onClick={() => {
              const next = MODE === 'generic' ? 'kriyashakti' : 'generic'
              localStorage.setItem('VITE_MODE_OVERRIDE', next)
              window.location.reload()
            }}
            className="text-xs text-stone-400 hover:text-stone-500 transition-colors duration-200"
          >
            [mode: {MODE}]
          </button>
        </div>
      )}
    </div>
  )
}
