import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { usePrimaryNavActive } from '@/lib/navState.js'
import LibraryPanel from './LibraryPanel.jsx'

function IconHome({ active }) {
  const c = active ? 'text-primary' : 'text-stone-400'
  return (
    <svg className={`h-6 w-6 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  )
}

function IconLibrary({ active }) {
  const c = active ? 'text-primary' : 'text-stone-400'
  return (
    <svg className={`h-6 w-6 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

export default function AppBottomNav() {
  const { homeActive, historyActive, favoritesActive } = usePrimaryNavActive()
  const libraryActive = historyActive || favoritesActive
  const [libraryOpen, setLibraryOpen] = useState(false)

  const itemClass = active =>
    [
      'flex min-h-[3.25rem] min-w-[4rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset',
      active ? 'text-primary' : 'text-stone-500 hover:text-stone-800',
    ].join(' ')

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-stone-200/80 bg-[color-mix(in_oklab,var(--background)_92%,transparent)] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-4px_24px_-8px_rgba(41,37,36,0.12)] backdrop-blur-lg supports-backdrop-filter:bg-[color-mix(in_oklab,var(--background)_82%,transparent)]"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
          <Link
            to="/"
            className={itemClass(homeActive)}
            aria-current={homeActive ? 'page' : undefined}
          >
            <IconHome active={homeActive} />
            <span className={`text-[11px] font-semibold tracking-wide ${homeActive ? 'text-primary' : 'text-stone-500'}`}>Home</span>
          </Link>
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className={itemClass(libraryActive)}
            aria-label="Open library"
          >
            <IconLibrary active={libraryActive} />
            <span className={`text-[11px] font-semibold tracking-wide ${libraryActive ? 'text-primary' : 'text-stone-500'}`}>Library</span>
          </button>
        </div>
      </nav>

      <LibraryPanel open={libraryOpen} onOpenChange={setLibraryOpen} defaultTab="favorites" />
    </>
  )
}
