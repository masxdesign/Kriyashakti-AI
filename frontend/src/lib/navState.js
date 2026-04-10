import { useRouterState } from '@tanstack/react-router'
import { getWishResult } from '@/store/wishResult.js'

/** Home tab = input + result flow; History = saved list only. */
export function usePrimaryNavActive() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const homeActive = pathname === '/' || pathname.startsWith('/result')
  const historyActive = pathname === '/history'
  return { pathname, homeActive, historyActive }
}

/** When on /result/:sessionId/wish/:index, return title for top bar; otherwise null. */
export function useWishDetailHeaderMeta() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const m = pathname.match(/\/result\/[^/]+\/wish\/(\d+)$/)
  if (!m) return null
  const idx = Number(m[1])
  const result = getWishResult()
  const item = result?.data?.[idx]
  if (!item) return { title: null, index: idx }
  return { title: item.wish, index: idx }
}

/** Multi-wish overview /result/:sessionId — show back + centered context (not …/wish/…). */
export function useResultOverviewHeaderMeta() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const base = pathname.replace(/\/$/, '') || '/'
  if (!/^\/result\/[^/]+$/.test(base)) return null
  const result = getWishResult()
  if (!result) return null
  const raw = (result.wish ?? '').trim()
  const title = raw.length > 52 ? `${raw.slice(0, 52)}…` : raw || 'Your Kriyashakti'
  return { title }
}
