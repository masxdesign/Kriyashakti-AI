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
    <main className="min-h-screen bg-linear-to-br from-violet-50 to-stone-50 flex flex-col items-center px-4 py-16 gap-8">
      <div className="w-full max-w-2xl flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-stone-800 mb-1">History</h1>
        <p className="text-stone-400 text-sm">Tap any entry to load it.</p>
      </div>

      {loading && (
        <p className="text-stone-400 text-sm">Loading…</p>
      )}

      {!loading && entries.length === 0 && (
        <div className="w-full max-w-2xl text-center py-16 text-stone-400 text-sm">
          No history yet. Shape your first wish to get started.
        </div>
      )}

      {!loading && entries.length > 0 && (
        <ul className="w-full max-w-2xl flex flex-col gap-3">
          {entries.map(entry => (
            <li
              key={entry.id}
              onClick={() => handleLoad(entry)}
              className="rounded-2xl border border-stone-100 bg-white/80 px-5 py-4 cursor-pointer hover:border-violet-200 hover:bg-violet-50/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-stone-700 text-sm font-medium leading-snug line-clamp-2 italic">
                    "{entry.wish}"
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.data.map((item, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-violet-100 px-3 py-0.5 text-xs text-violet-600"
                      >
                        {item.wish}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-stone-400">{timeAgo(entry.createdAt)}</span>
                  <button
                    onClick={e => handleDelete(e, entry.id)}
                    className="text-xs text-stone-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
