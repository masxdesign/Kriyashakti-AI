import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getAllHistory, deleteFromHistory } from '../store/historyDB.js'
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

export default function HistoryPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllHistory().then(data => {
      setEntries(data)
      setLoading(false)
    })
  }, [])

  function handleLoad(entry) {
    setWishResult(entry)
    navigate({ to: '/result' })
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    await deleteFromHistory(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="page-shell">
      <div className="w-full max-w-2xl">
        <h1 className="page-title text-left">History</h1>
        <p className="page-lead text-left mx-0 mt-2 text-sm">Open any entry to continue where you left off.</p>
      </div>

      {loading && (
        <div className="flex flex-col gap-3 w-full max-w-2xl" aria-busy="true" aria-label="Loading history">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-[5.5rem] rounded-2xl bg-stone-200/60 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="w-full max-w-2xl rounded-2xl border border-dashed border-stone-200 bg-white/50 px-6 py-14 text-center">
          <p className="text-stone-600 text-sm font-medium mb-1">Nothing saved yet</p>
          <p className="text-stone-500 text-sm leading-relaxed max-w-sm mx-auto">
            Shape a wish on the home screen. It will show up here so you can return anytime.
          </p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <ul className="w-full max-w-2xl flex flex-col gap-3 list-none p-0 m-0">
          {entries.map(entry => (
            <li
              key={entry.id}
              role="button"
              aria-label={`Open wish from ${timeAgo(entry.createdAt)}`}
              onClick={() => handleLoad(entry)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleLoad(entry)
                }
              }}
              tabIndex={0}
              className="rounded-2xl border border-stone-100 bg-white/85 px-5 py-4 cursor-pointer shadow-sm shadow-stone-900/5 transition-all duration-200 hover:border-primary/25 hover:shadow-md hover:shadow-stone-900/8 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 group list-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 text-sm font-medium leading-snug line-clamp-2 italic text-pretty">
                    &ldquo;{entry.wish}&rdquo;
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {entry.data.map((item, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-primary-muted/80 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {item.wish}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-stone-400 tabular-nums">{timeAgo(entry.createdAt)}</span>
                  <button
                    type="button"
                    onClick={e => handleDelete(e, entry.id)}
                    className="text-xs text-stone-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Delete
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
