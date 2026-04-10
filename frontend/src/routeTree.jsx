import { createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router'
import AppHeader from './components/AppHeader.jsx'
import AppBottomNav from './components/AppBottomNav.jsx'
import InputPage from './pages/InputPage.jsx'
import ResultPage from './pages/ResultPage.jsx'
import WishDetailPage from './pages/WishDetailPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import { getHistoryBySessionId } from './store/historyDB.js'
import { setWishResult } from './store/wishResult.js'

async function loadResultFromSession(params) {
  const entry = await getHistoryBySessionId(params.sessionId)
  if (!entry) throw redirect({ to: '/' })
  // Older history rows may omit sessionId; URL is authoritative for favorites + deep links.
  setWishResult({
    ...entry,
    sessionId: entry.sessionId ?? params.sessionId,
  })
}

function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-[max(1rem,env(safe-area-inset-top))] focus:z-[100] focus:rounded-lg focus:bg-stone-900 focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
      >
        Skip to content
      </a>
      <AppHeader />
      <main
        id="main-content"
        className="flex w-full min-h-0 flex-1 flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0"
      >
        <Outlet />
      </main>
      <AppBottomNav />
    </div>
  )
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: InputPage,
})

export const wishDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result/$sessionId/wish/$index',
  validateSearch: raw => ({
    line: (() => {
      const n = Number(raw?.line)
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined
    })(),
  }),
  beforeLoad: ({ params }) => loadResultFromSession(params),
  component: WishDetailPage,
})

export const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result/$sessionId',
  beforeLoad: ({ params }) => loadResultFromSession(params),
  component: ResultPage,
})

export const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
})

export const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  component: FavoritesPage,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  wishDetailRoute,
  resultRoute,
  historyRoute,
  favoritesRoute,
])
