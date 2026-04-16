import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { usePrimaryNavActive, useWishDetailHeaderMeta, useResultOverviewHeaderMeta } from '@/lib/navState.js'
import { getWishResult, clearWishResult } from '@/store/wishResult.js'
import { LibraryPopover } from './LibraryPanel.jsx'
import { isKriya } from '@/lib/mode.js'

function ChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export default function AppHeader() {
  const navigate = useNavigate()
  const { historyActive, favoritesActive } = usePrimaryNavActive()
  const wishDetail = useWishDetailHeaderMeta()
  const resultOverview = useResultOverviewHeaderMeta()
  const libraryActive = historyActive || favoritesActive
  const pathname = useRouterState({ select: s => s.location.pathname })
  const isHome = pathname === '/'

  const NavRight = () => (
    <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center md:flex sm:right-3">
      <LibraryPopover active={libraryActive} defaultTab="favorites" />
    </div>
  )

  return (
    <header className={`sticky top-0 z-40 shrink-0 border-b border-stone-200/70 bg-[color-mix(in_oklab,var(--background)_88%,transparent)] pt-[max(0.25rem,env(safe-area-inset-top))] backdrop-blur-md supports-backdrop-filter:bg-[color-mix(in_oklab,var(--background)_75%,transparent)] ${isHome ? 'hidden md:block' : ''}`}>
      <div className="relative mx-auto flex h-13 max-w-3xl items-center px-2 sm:h-14 sm:px-4">
        {wishDetail ? (
          <>
            <button
              type="button"
              onClick={() => {
                const result = getWishResult()
                const sid = result?.sessionId
                const isMulti = (result?.data?.length ?? 1) > 1
                if (isMulti && sid) navigate({ to: '/result/$sessionId', params: { sessionId: sid } })
                else { navigate({ to: '/' }); clearWishResult() }
              }}
              className="absolute left-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 rounded-lg py-2 pl-1 pr-2 text-sm font-semibold text-primary transition-colors duration-200 hover:opacity-85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:left-3"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 opacity-90" />
              <span className="hidden sm:inline">
                {(getWishResult()?.data?.length ?? 1) > 1 ? 'Intentions' : 'Start over'}
              </span>
            </button>
            <div
              className="pointer-events-none mx-auto max-w-[min(65vw,16rem)] truncate text-center text-[0.8125rem] font-semibold leading-tight text-stone-900 sm:max-w-[min(50vw,22rem)] sm:text-sm"
              aria-hidden="true"
            >
              {wishDetail.title ?? 'Intention'}
            </div>
            <NavRight />
          </>
        ) : resultOverview ? (
          <>
            <button
              type="button"
              onClick={() => { navigate({ to: '/' }); clearWishResult() }}
              className="absolute left-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 rounded-lg py-2 pl-1 pr-2 text-sm font-semibold text-primary transition-colors duration-200 hover:opacity-85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:left-3"
              aria-label="Start over"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 opacity-90" />
              <span className="hidden sm:inline">Start over</span>
            </button>
            <div
              className="pointer-events-none mx-auto max-w-[min(65vw,16rem)] truncate text-center text-[0.8125rem] font-semibold leading-tight text-stone-900 sm:max-w-[min(50vw,22rem)] sm:text-sm"
              aria-hidden="true"
            >
              {resultOverview.title}
            </div>
            <NavRight />
          </>
        ) : (
          <div className="flex w-full items-center justify-between gap-3 px-2 sm:px-1">
            <Link
              to="/"
              className="min-w-0 font-semibold tracking-tight text-stone-900 transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md truncate text-[1.05rem] sm:text-base"
            >
              {isKriya ? 'Kriyashakti' : 'Shape My Wish'}
            </Link>
            <div className="hidden md:flex items-center">
              <LibraryPopover active={libraryActive} defaultTab="favorites" />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
