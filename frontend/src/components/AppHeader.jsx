import { Link, useNavigate } from '@tanstack/react-router'
import { usePrimaryNavActive, useWishDetailHeaderMeta, useResultOverviewHeaderMeta } from '@/lib/navState.js'
import { getWishResult } from '@/store/wishResult.js'

function ChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export default function AppHeader() {
  const navigate = useNavigate()
  const { homeActive, historyActive, favoritesActive } = usePrimaryNavActive()
  const wishDetail = useWishDetailHeaderMeta()
  const resultOverview = useResultOverviewHeaderMeta()

  const linkClass = active =>
    [
      'text-sm font-medium transition-colors duration-200 rounded-md px-2 py-1.5 -mx-1',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
      active ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800',
    ].join(' ')

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-stone-200/70 bg-[color-mix(in_oklab,var(--background)_88%,transparent)] pt-[max(0.25rem,env(safe-area-inset-top))] backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--background)_75%,transparent)]">
      <div className="relative mx-auto flex h-[3.25rem] max-w-3xl items-center px-2 sm:h-14 sm:px-4">
        {wishDetail ? (
          <>
            <button
              type="button"
              onClick={() => {
                const sid = getWishResult()?.sessionId
                if (sid) navigate({ to: '/result/$sessionId', params: { sessionId: sid } })
                else navigate({ to: '/' })
              }}
              className="absolute left-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 rounded-lg py-2 pl-1 pr-2 text-sm font-semibold text-primary transition-colors duration-200 hover:opacity-85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:left-3"
              aria-label="Back to overview"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 opacity-90" />
              <span className="hidden sm:inline">Overview</span>
            </button>
            {/* Decorative mirror of page title — real h1 lives in <main> */}
            <div
              className="pointer-events-none mx-auto max-w-[min(65vw,16rem)] truncate text-center text-[0.8125rem] font-semibold leading-tight text-stone-900 sm:max-w-[min(50vw,22rem)] sm:text-sm"
              aria-hidden="true"
            >
              {wishDetail.title ?? 'Intention'}
            </div>
            <nav className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 md:flex sm:right-3" aria-label="Main">
              <Link to="/" className={linkClass(homeActive)} aria-current={homeActive ? 'page' : undefined}>
                Home
              </Link>
              <Link to="/history" className={linkClass(historyActive)} aria-current={historyActive ? 'page' : undefined}>
                History
              </Link>
              <Link to="/favorites" className={linkClass(favoritesActive)} aria-current={favoritesActive ? 'page' : undefined}>
                Favorites
              </Link>
            </nav>
          </>
        ) : resultOverview ? (
          <>
            <button
              type="button"
              onClick={() => navigate({ to: '/' })}
              className="absolute left-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 rounded-lg py-2 pl-1 pr-2 text-sm font-semibold text-primary transition-colors duration-200 hover:opacity-85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:left-3"
              aria-label="Back to edit wish"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 opacity-90" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div
              className="pointer-events-none mx-auto max-w-[min(65vw,16rem)] truncate text-center text-[0.8125rem] font-semibold leading-tight text-stone-900 sm:max-w-[min(50vw,22rem)] sm:text-sm"
              aria-hidden="true"
            >
              {resultOverview.title}
            </div>
            <nav className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 md:flex sm:right-3" aria-label="Main">
              <Link to="/" className={linkClass(homeActive)} aria-current={homeActive ? 'page' : undefined}>
                Home
              </Link>
              <Link to="/history" className={linkClass(historyActive)} aria-current={historyActive ? 'page' : undefined}>
                History
              </Link>
              <Link to="/favorites" className={linkClass(favoritesActive)} aria-current={favoritesActive ? 'page' : undefined}>
                Favorites
              </Link>
            </nav>
          </>
        ) : (
          <div className="flex w-full items-center justify-between gap-3 px-2 sm:px-1">
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
              <Link to="/favorites" className={linkClass(favoritesActive)} aria-current={favoritesActive ? 'page' : undefined}>
                Favorites
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
