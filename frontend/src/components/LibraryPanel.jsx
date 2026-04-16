import { useState, useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { ensureSessionIdForEntry, getAllHistory, deleteFromHistory, getAllFavorites, deleteFavorite, getHistoryBySessionId } from '../store/historyDB.js'
import { setWishResult } from '../store/wishResult.js'
import { isKriya } from '@/lib/mode.js'

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

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function EmptyState({ message, sub }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-medium text-stone-600 mb-1">{message}</p>
      <p className="text-sm text-stone-400 leading-relaxed max-w-xs">{sub}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 rounded-xl bg-stone-100 animate-pulse" />
      ))}
    </div>
  )
}

function HistoryTab({ onClose }) {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllHistory().then(data => { setEntries(data); setLoading(false) })
  }, [])

  async function handleLoad(entry) {
    const withSession = await ensureSessionIdForEntry(entry)
    setWishResult(withSession)
    navigate({ to: '/result/$sessionId', params: { sessionId: withSession.sessionId } })
    onClose()
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    await deleteFromHistory(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  if (loading) return <Skeleton />

  if (entries.length === 0) return (
    <EmptyState
      message="Nothing saved yet"
      sub="Shape a wish on the home screen. It will appear here so you can return anytime."
    />
  )

  return (
    <ul className="flex flex-col gap-2 px-4 pt-2 pb-6 list-none p-0 m-0">
      {entries.map(entry => (
        <li
          key={entry.id}
          role="button"
          tabIndex={0}
          aria-label={`Open wish from ${timeAgo(entry.createdAt)}`}
          onClick={() => handleLoad(entry)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLoad(entry) } }}
          className="group rounded-xl border border-stone-100 bg-white px-4 py-3.5 cursor-pointer shadow-sm shadow-stone-900/4 transition-all duration-200 hover:border-primary/25 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 list-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-stone-800 text-sm font-medium leading-snug line-clamp-2 italic text-pretty">
                &ldquo;{entry.wish}&rdquo;
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {entry.data.map((item, i) => (
                  <span key={i} className="rounded-md bg-primary-muted/80 px-2 py-0.5 text-xs font-medium text-primary">
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
                className="text-xs text-stone-400 hover:text-red-500 transition-colors focus-visible:opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function FavoritesTab({ onClose }) {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    getAllFavorites()
      .then(data => { setRows(data); setLoading(false) })
      .catch(() => { setRows([]); setLoadError(true); setLoading(false) })
  }, [])

  async function handleOpen(row) {
    const entry = await getHistoryBySessionId(row.sessionId)
    if (!entry) return
    setWishResult(entry)
    onClose()
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

  if (loading) return <Skeleton />

  if (loadError) return (
    <div className="mx-4 mt-2 rounded-xl border border-red-200/90 bg-red-50/80 px-4 py-3 text-sm text-red-900">
      Could not read favorites. Try refreshing the page.
    </div>
  )

  if (rows.length === 0) return (
    <EmptyState
      message="No favorites yet"
      sub="Open a result and tap Save to favorites on a statement to save it here."
    />
  )

  return (
    <ul className="flex flex-col gap-2 px-4 pt-2 pb-6 list-none p-0 m-0">
      {rows.map(row => (
        <li
          key={row.id}
          role="button"
          tabIndex={0}
          aria-label={isKriya ? 'Open this Kriyashakti in context' : 'Open this statement in context'}
          onClick={() => handleOpen(row)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen(row) } }}
          className="group rounded-xl border border-stone-100 bg-white px-4 py-3.5 cursor-pointer shadow-sm shadow-stone-900/4 transition-all duration-200 hover:border-primary/25 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 list-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-stone-800 text-sm font-semibold leading-snug text-pretty">
                {row.kriyashakti}
              </p>
              {row.coreWish && (
                <p className="text-stone-400 text-xs mt-1.5 leading-relaxed line-clamp-2 text-pretty">
                  {row.coreWish}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-xs text-stone-400 tabular-nums">{timeAgo(row.createdAt)}</span>
              <button
                type="button"
                onClick={e => handleRemove(e, row.id)}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors focus-visible:opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function LibraryContent({ onClose, defaultTab = 'favorites', CloseButton }) {
  const [tab, setTab] = useState(defaultTab)

  useEffect(() => { setTab(defaultTab) }, [defaultTab])

  const tabClass = active =>
    cn(
      'flex-1 pb-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm',
      active ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600 border-b-2 border-transparent',
    )

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0">
        <h2 className="text-base font-bold tracking-tight text-stone-900">Library</h2>
        {CloseButton}
      </div>
      <div className="flex gap-0 px-5 mt-4 shrink-0 border-b border-stone-100">
        <button type="button" className={tabClass(tab === 'favorites')} onClick={() => setTab('favorites')}>
          Saved
        </button>
        <button type="button" className={tabClass(tab === 'history')} onClick={() => setTab('history')}>
          History
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 pt-3">
        {tab === 'history'
          ? <HistoryTab onClose={onClose} />
          : <FavoritesTab onClose={onClose} />
        }
      </div>
    </div>
  )
}

function IconLibrary({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

/** Desktop: Popover anchored to trigger */
export function LibraryPopover({ active = false, defaultTab = 'favorites' }) {
  const [open, setOpen] = useState(false)
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
          active || open ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700',
        )}
        aria-label="Open library"
      >
        <IconLibrary className="h-[1.1rem] w-[1.1rem]" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            'z-50 w-80 rounded-2xl border border-stone-200/80 bg-white shadow-xl shadow-stone-900/10 outline-none',
            'flex flex-col max-h-[min(32rem,80vh)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            'duration-150',
          )}
        >
          <LibraryContent
            onClose={() => setOpen(false)}
            defaultTab={defaultTab}
            CloseButton={
              <PopoverPrimitive.Close className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40">
                <CloseIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Close</span>
              </PopoverPrimitive.Close>
            }
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

/** Mobile: bottom sheet dialog */
export default function LibraryPanel({ open, onOpenChange, defaultTab = 'favorites' }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className={cn(
          'fixed z-50 bg-white outline-none',
          'inset-x-0 bottom-0 rounded-t-2xl max-h-[88vh] flex flex-col',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'duration-250',
        )}>
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-stone-200" aria-hidden />
          <LibraryContent
            onClose={() => onOpenChange(false)}
            defaultTab={defaultTab}
            CloseButton={
              <DialogPrimitive.Close className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40">
                <CloseIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            }
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
