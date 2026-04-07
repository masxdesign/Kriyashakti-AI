// Simple module-level store for passing the wish result between InputPage and ResultPage.
// This is intentionally ephemeral — data is gone on page refresh, which is correct for a stateless prototype.

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
