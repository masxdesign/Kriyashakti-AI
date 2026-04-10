import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getAllFavorites, deleteFavorite, getHistoryBySessionId } from '../store/historyDB.js'
import { setWishResult } from '../store/wishResult.js'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function FavoritesPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    getAllFavorites()
      .then(data => {
        if (!cancelled) setRows(data)
      })
      .catch(() => {
        if (!cancelled) {
          setRows([])
          setLoadError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleOpen(row) {
    const entry = await getHistoryBySessionId(row.sessionId)
    if (!entry) return
    setWishResult(entry)
    navigate({
      to: '/result/$sessionId/wish/$index',
      params: { sessionId: row.sessionId, index: String(row.wishIndex) },
      search: { line: row.optionIndex },
    })
  }

  async function handleRemove(e, id) {
    e.stopPropagation()
    await deleteFavorite(id)
    setRows(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="page-shell">
      <div className="w-full max-w-2xl">
        <h1 className="page-title text-left">Favorites</h1>
        <p className="page-lead text-left mx-0 mt-2 text-sm">
          Kriyashakti lines you starred are saved on this device.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col gap-3 w-full max-w-2xl" aria-busy="true" aria-label="Loading favorites">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[5.5rem] rounded-2xl bg-stone-200/60 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && loadError && (
        <div className="w-full max-w-2xl rounded-2xl border border-red-200/90 bg-red-50/80 px-5 py-4 text-sm text-red-900">
          Could not read favorites from this device (storage may be blocked or full). Try again after allowing site
          storage, or refresh the page.
        </div>
      )}

      {!loading && !loadError && rows.length === 0 && (
        <div className="w-full max-w-2xl rounded-2xl border border-dashed border-stone-200 bg-white/50 px-6 py-14 text-center">
          <p className="text-stone-600 text-sm font-medium mb-1">No favorites yet</p>
          <p className="text-stone-500 text-sm leading-relaxed max-w-sm mx-auto">
            Open a result and tap the star on a statement to save it here.
          </p>
        </div>
      )}

      {!loading && !loadError && rows.length > 0 && (
        <ul className="w-full max-w-2xl flex flex-col gap-3 list-none p-0 m-0">
          {rows.map(row => (
            <li
              key={row.id}
              role="button"
              aria-label="Open this Kriyashakti in context"
              onClick={() => handleOpen(row)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleOpen(row)
                }
              }}
              tabIndex={0}
              className="rounded-2xl border border-stone-100 bg-white/85 px-5 py-4 cursor-pointer shadow-sm shadow-stone-900/5 transition-all duration-200 hover:border-primary/25 hover:shadow-md hover:shadow-stone-900/8 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 group list-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 text-sm font-semibold leading-snug text-pretty">
                    {row.kriyashakti}
                  </p>
                  {row.coreWish ? (
                    <p className="text-stone-500 text-xs mt-2 leading-relaxed line-clamp-2 text-pretty">
                      Intention: {row.coreWish}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-stone-400 tabular-nums">{timeAgo(row.createdAt)}</span>
                  <button
                    type="button"
                    onClick={e => handleRemove(e, row.id)}
                    className="text-xs text-stone-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
