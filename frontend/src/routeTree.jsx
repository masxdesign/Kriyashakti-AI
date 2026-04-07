import { createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router'
import InputPage from './pages/InputPage.jsx'
import ResultPage from './pages/ResultPage.jsx'
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

export const routeTree = rootRoute.addChildren([indexRoute, resultRoute])
