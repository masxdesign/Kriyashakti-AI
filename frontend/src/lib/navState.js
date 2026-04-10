import { useRouterState } from '@tanstack/react-router'
import { getWishResult } from '@/store/wishResult.js'

/** Home tab = input + result flow; History = saved list only. */
export function usePrimaryNavActive() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const homeActive = pathname === '/' || pathname.startsWith('/result')
  const historyActive = pathname === '/history'
  return { pathname, homeActive, historyActive }
}

/** When on /result/wish/:index, return title for top bar; otherwise null. */
export function useWishDetailHeaderMeta() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const m = pathname.match(/\/result\/wish\/(\d+)$/)
  if (!m) return null
  const idx = Number(m[1])
  const result = getWishResult()
  const item = result?.data?.[idx]
  if (!item) return { title: null, index: idx }
  return { title: item.wish, index: idx }
}

/** Main results page /result — show back + centered context (not /result/wish/…). */
export function useResultOverviewHeaderMeta() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const base = pathname.replace(/\/$/, '') || '/'
  if (base !== '/result') return null
  const result = getWishResult()
  if (!result) return null
  const raw = (result.wish ?? '').trim()
  const title = raw.length > 52 ? `${raw.slice(0, 52)}…` : raw || 'Your Kriyashakti'
  return { title }
}
