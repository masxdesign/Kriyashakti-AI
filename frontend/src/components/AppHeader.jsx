import { Link } from '@tanstack/react-router'
import { usePrimaryNavActive } from '@/lib/navState.js'

export default function AppHeader() {
  const { homeActive, historyActive } = usePrimaryNavActive()

  const linkClass = active =>
    [
      'text-sm font-medium transition-colors duration-200 rounded-md px-2 py-1.5 -mx-1',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
      active ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800',
    ].join(' ')

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-stone-200/70 bg-[color-mix(in_oklab,var(--background)_88%,transparent)] pt-[max(0.25rem,env(safe-area-inset-top))] backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--background)_75%,transparent)]">
      <div className="mx-auto flex h-[3.25rem] max-w-3xl items-center justify-between gap-3 px-4 sm:h-14 sm:px-5">
        <Link
          to="/"
          className="min-w-0 font-semibold tracking-tight text-stone-900 transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-md truncate text-[1.05rem] sm:text-base"
        >
          Kriyashakti
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <Link to="/" className={linkClass(homeActive)} aria-current={homeActive ? 'page' : undefined}>
            Home
          </Link>
          <Link to="/history" className={linkClass(historyActive)} aria-current={historyActive ? 'page' : undefined}>
            History
          </Link>
        </nav>
      </div>
    </header>
  )
}
