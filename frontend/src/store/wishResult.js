// Module-level store for the current wish result. On refresh, /result/:sessionId reloads from IndexedDB.
import { useSyncExternalStore } from 'react'

let _result = null
const _listeners = new Set()

function _notify() {
  _listeners.forEach(l => l())
}

export function setWishResult(result) {
  _result = result
  _notify()
}

export function getWishResult() {
  return _result
}

export function clearWishResult() {
  _result = null
  _notify()
}

export function useWishResult() {
  return useSyncExternalStore(
    cb => { _listeners.add(cb); return () => _listeners.delete(cb) },
    () => _result,
  )
}

export function setPendingEdit(wish) {
  sessionStorage.setItem('pendingEdit', wish)
}

export function getPendingEdit() {
  return sessionStorage.getItem('pendingEdit')
}

export function clearPendingEdit() {
  sessionStorage.removeItem('pendingEdit')
}
