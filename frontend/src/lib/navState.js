import { useRouterState } from '@tanstack/react-router'
import { getWishResult } from '@/store/wishResult.js'

/** Home tab = input + result flow; History = saved list; Favorites = starred lines. */
export function usePrimaryNavActive() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const homeActive = pathname === '/' || pathname.startsWith('/result')
  const historyActive = pathname === '/history'
  const favoritesActive = pathname === '/favorites'
  return { pathname, homeActive, historyActive, favoritesActive }
}

/** When on /result/:sessionId/wish/:index, return title for top bar; otherwise null. */
export function useWishDetailHeaderMeta() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const m = pathname.match(/\/result\/[^/]+\/wish\/(\d+)$/)
  if (!m) return null
  const idx = Number(m[1])
  const result = getWishResult()
  const isMulti = (result?.data?.length ?? 1) > 1
  const title = isMulti ? `Intention ${idx + 1}` : 'Your Kriyashakti'
  return { title, index: idx }
}

/** Multi-wish overview /result/:sessionId — show back + centered context (not …/wish/…). */
export function useResultOverviewHeaderMeta() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const base = pathname.replace(/\/$/, '') || '/'
  if (!/^\/result\/[^/]+$/.test(base)) return null
  const result = getWishResult()
  if (!result) return null
  const isMulti = (result.data?.length ?? 1) > 1
  return { title: isMulti ? 'Core intentions' : 'Your Kriyashakti' }
}
