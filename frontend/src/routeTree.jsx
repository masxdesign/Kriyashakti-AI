import { createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router'
import InputPage from './pages/InputPage.jsx'
import ResultPage from './pages/ResultPage.jsx'
import WishDetailPage from './pages/WishDetailPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import { getWishResult } from './store/wishResult.js'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: InputPage,
})

export const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result',
  beforeLoad: () => {
    if (!getWishResult()) throw redirect({ to: '/' })
  },
  component: ResultPage,
})

export const wishDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result/wish/$index',
  beforeLoad: () => {
    if (!getWishResult()) throw redirect({ to: '/' })
  },
  component: WishDetailPage,
})

export const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
})

export const routeTree = rootRoute.addChildren([indexRoute, resultRoute, wishDetailRoute, historyRoute])
