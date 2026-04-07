import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Placeholder components — will be replaced in Task 3 and Task 4
function InputPagePlaceholder() {
  return <div>Input page — coming soon</div>
}

function ResultPagePlaceholder() {
  return <div>Result page — coming soon</div>
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: InputPagePlaceholder,
})

export const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result',
  component: ResultPagePlaceholder,
})

export const routeTree = rootRoute.addChildren([indexRoute, resultRoute])
