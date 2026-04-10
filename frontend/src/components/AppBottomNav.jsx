import { Link } from '@tanstack/react-router'
import { usePrimaryNavActive } from '@/lib/navState.js'

function IconHome({ active }) {
  const c = active ? 'text-primary' : 'text-stone-400'
  return (
    <svg className={`h-6 w-6 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  )
}

function IconHistory({ active }) {
  const c = active ? 'text-primary' : 'text-stone-400'
  return (
    <svg className={`h-6 w-6 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

function IconStar({ active }) {
  const c = active ? 'text-primary' : 'text-stone-400'
  return (
    <svg className={`h-6 w-6 ${c}`} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export default function AppBottomNav() {
  const { homeActive, historyActive, favoritesActive } = usePrimaryNavActive()

  const itemClass = active =>
    [
      'flex min-h-[3.25rem] min-w-[4rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset',
      active ? 'text-primary' : 'text-stone-500 hover:text-stone-800',
    ].join(' ')

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-stone-200/80 bg-[color-mix(in_oklab,var(--background)_92%,transparent)] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-4px_24px_-8px_rgba(41,37,36,0.12)] backdrop-blur-lg supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--background)_82%,transparent)]"
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
        <Link
          to="/history"
          className={itemClass(historyActive)}
          aria-current={historyActive ? 'page' : undefined}
        >
          <IconHistory active={historyActive} />
          <span className={`text-[11px] font-semibold tracking-wide ${historyActive ? 'text-primary' : 'text-stone-500'}`}>History</span>
        </Link>
        <Link
          to="/favorites"
          className={itemClass(favoritesActive)}
          aria-current={favoritesActive ? 'page' : undefined}
        >
          <IconStar active={favoritesActive} />
          <span className={`text-[11px] font-semibold tracking-wide ${favoritesActive ? 'text-primary' : 'text-stone-500'}`}>Saved</span>
        </Link>
      </div>
    </nav>
  )
}
