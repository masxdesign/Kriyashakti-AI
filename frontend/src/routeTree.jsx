import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router'
import InputPage from './pages/InputPage.jsx'
import ResultPage from './pages/ResultPage.jsx'

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
  component: ResultPage,
})

export const routeTree = rootRoute.addChildren([indexRoute, resultRoute])
