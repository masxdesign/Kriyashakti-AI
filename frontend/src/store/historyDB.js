const DB_NAME = 'kriyashakti'
const STORE_NAME = 'history'
const FAVORITES_STORE = 'favorites'
const DB_VERSION = 4

// Lightweight pub/sub for favorites changes so subscribers re-check state
const _favListeners = new Set()
export function onFavoritesChange(cb) {
  _favListeners.add(cb)
  return () => _favListeners.delete(cb)
}
function _notifyFavorites() {
  _favListeners.forEach(cb => cb())
}

function createFavoritesStore(db) {
  if (db.objectStoreNames.contains(FAVORITES_STORE)) return
  const favStore = db.createObjectStore(FAVORITES_STORE, { keyPath: 'id', autoIncrement: true })
  favStore.createIndex('dedupeKey', 'dedupeKey', { unique: true })
  favStore.createIndex('createdAt', 'createdAt', { unique: false })
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      const db = e.target.result
      const old = e.oldVersion
      if (old < 1) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('wish', 'wish', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
      if (old < 2) {
        const tx = e.target.transaction
        const store = tx.objectStore(STORE_NAME)
        if (!store.indexNames.contains('sessionId')) {
          store.createIndex('sessionId', 'sessionId', { unique: false })
        }
      }
      if (old < 3) {
        createFavoritesStore(db)
      }
      // Recover installs where v3 existed but the favorites store was never created.
      if (old < 4) {
        createFavoritesStore(db)
      }
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = e => reject(e.target.error)
  })
}

/** New saves get a stable session id for /result/:sessionId (refresh-safe). */
export async function saveToHistory(result) {
  const sessionId = crypto.randomUUID()
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const entry = { ...result, createdAt: Date.now(), sessionId }
    const req = store.add(entry)
    req.onsuccess = e => resolve({ id: e.target.result, sessionId })
    req.onerror = e => reject(e.target.error)
  })
}

/** Load a saved submission by session id (URL param). */
export async function getHistoryBySessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return null
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    if (store.indexNames.contains('sessionId')) {
      const index = store.index('sessionId')
      const req = index.get(sessionId)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error)
      return
    }
    const req = store.getAll()
    req.onsuccess = () => {
      const rows = req.result ?? []
      resolve(rows.find(e => e.sessionId === sessionId) ?? null)
    }
    req.onerror = () => reject(req.error)
  })
}

/** Older history rows may lack sessionId — assign once and persist for shareable URLs. */
export async function ensureSessionIdForEntry(entry) {
  if (!entry || entry.sessionId) return entry
  const sessionId = crypto.randomUUID()
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const updated = { ...entry, sessionId }
    const req = store.put(updated)
    req.onsuccess = () => resolve(updated)
    req.onerror = e => reject(e.target.error)
  })
}

export async function findInHistory(wish) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = e => {
      const normalized = wish.trim().toLowerCase()
      const match = e.target.result.find(
        entry => entry.wish?.trim().toLowerCase() === normalized
      )
      resolve(match ?? null)
    }
    req.onerror = e => reject(e.target.error)
  })
}

export async function getAllHistory() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = e => {
      // Most recent first
      resolve(e.target.result.reverse())
    }
    req.onerror = e => reject(e.target.error)
  })
}

export async function updateVisualizationsInHistory(id, wishIndex, visualizations) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const getReq = store.get(id)
    getReq.onsuccess = e => {
      const entry = e.target.result
      if (!entry) return resolve()
      entry.data[wishIndex].visualizations = visualizations
      const putReq = store.put(entry)
      putReq.onsuccess = () => resolve()
      putReq.onerror = e => reject(e.target.error)
    }
    getReq.onerror = e => reject(e.target.error)
  })
}

export async function updateAffirmationsInHistory(id, wishIndex, affirmations) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const getReq = store.get(id)
    getReq.onsuccess = e => {
      const entry = e.target.result
      if (!entry) return resolve()
      entry.data[wishIndex].affirmations = affirmations
      const putReq = store.put(entry)
      putReq.onsuccess = () => resolve()
      putReq.onerror = e => reject(e.target.error)
    }
    getReq.onerror = e => reject(e.target.error)
  })
}

export async function deleteFromHistory(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = e => reject(e.target.error)
  })
}

export function makeFavoriteDedupeKey(sessionId, wishIndex, optionIndex) {
  const w = Number(wishIndex)
  const o = Number(optionIndex)
  return `${sessionId}|${Number.isFinite(w) ? w : 0}|${Number.isFinite(o) ? o : 0}`
}

/** Returns whether the line is now favorited after toggle. */
export async function toggleFavorite(payload) {
  const {
    dedupeKey,
    sessionId,
    wishIndex,
    optionIndex,
    kriyashakti,
    coreWish,
    rootWish,
    visualization,
    affirmation,
  } = payload
  const db = await openDB()
  if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
    throw new Error('Favorites store missing — refresh the page to finish database upgrade')
  }
  const wIdx = Number.isFinite(Number(wishIndex)) ? Number(wishIndex) : 0
  const oIdx = Number.isFinite(Number(optionIndex)) ? Number(optionIndex) : 0
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FAVORITES_STORE, 'readwrite')
    tx.onerror = () => reject(tx.error)
    const store = tx.objectStore(FAVORITES_STORE)
    const idx = store.index('dedupeKey')
    const getReq = idx.get(dedupeKey)
    getReq.onsuccess = () => {
      const existing = getReq.result
      if (existing) {
        const delReq = store.delete(existing.id)
        delReq.onsuccess = () => { _notifyFavorites(); resolve({ favorited: false }) }
        delReq.onerror = () => reject(delReq.error)
        return
      }
      const addReq = store.add({
        dedupeKey,
        sessionId,
        wishIndex: wIdx,
        optionIndex: oIdx,
        kriyashakti: String(kriyashakti ?? ''),
        coreWish: coreWish ?? '',
        rootWish: rootWish ?? '',
        visualization: visualization ?? null,
        affirmation: affirmation ?? null,
        createdAt: Date.now(),
      })
      addReq.onsuccess = () => { _notifyFavorites(); resolve({ favorited: true }) }
      addReq.onerror = () => reject(addReq.error)
    }
    getReq.onerror = () => reject(getReq.error)
  })
}

export async function isFavoriteDedupeKey(dedupeKey) {
  const db = await openDB()
  if (!db.objectStoreNames.contains(FAVORITES_STORE)) return false
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FAVORITES_STORE, 'readonly')
    tx.onerror = () => reject(tx.error)
    const store = tx.objectStore(FAVORITES_STORE)
    const idx = store.index('dedupeKey')
    const req = idx.get(dedupeKey)
    req.onsuccess = () => resolve(Boolean(req.result))
    req.onerror = () => reject(req.error)
  })
}

export async function getAllFavorites() {
  const db = await openDB()
  if (!db.objectStoreNames.contains(FAVORITES_STORE)) return []
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FAVORITES_STORE, 'readonly')
    tx.onerror = () => reject(tx.error)
    const store = tx.objectStore(FAVORITES_STORE)
    const req = store.getAll()
    req.onsuccess = e => {
      const rows = e.target.result ?? []
      resolve([...rows].sort((a, b) => b.createdAt - a.createdAt))
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deleteFavorite(id) {
  const db = await openDB()
  if (!db.objectStoreNames.contains(FAVORITES_STORE)) return
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FAVORITES_STORE, 'readwrite')
    tx.onerror = () => reject(tx.error)
    const store = tx.objectStore(FAVORITES_STORE)
    const req = store.delete(id)
    req.onsuccess = () => { _notifyFavorites(); resolve() }
    req.onerror = () => reject(req.error)
  })
}
