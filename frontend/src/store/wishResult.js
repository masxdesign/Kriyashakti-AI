// Module-level store for the current wish result. On refresh, /result/:sessionId reloads from IndexedDB.

let _result = null

export function setWishResult(result) {
  _result = result
}

export function getWishResult() {
  return _result
}

export function clearWishResult() {
  _result = null
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
