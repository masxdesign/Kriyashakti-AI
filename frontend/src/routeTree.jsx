import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router'
import InputPage from './pages/InputPage.jsx'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Placeholder component — will be replaced in Task 4
function ResultPagePlaceholder() {
  return <div>Result page — coming soon</div>
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: InputPage,
})

export const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result',
  component: ResultPagePlaceholder,
})

export const routeTree = rootRoute.addChildren([indexRoute, resultRoute])
