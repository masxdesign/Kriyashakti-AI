import { useRouterState } from '@tanstack/react-router'

/** Home tab = input + result flow; History = saved list only. */
export function usePrimaryNavActive() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const homeActive = pathname === '/' || pathname.startsWith('/result')
  const historyActive = pathname === '/history'
  return { pathname, homeActive, historyActive }
}
