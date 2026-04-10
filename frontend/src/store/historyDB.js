const DB_NAME = 'kriyashakti'
const STORE_NAME = 'history'
const DB_VERSION = 2

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
        entry => entry.wish.trim().toLowerCase() === normalized
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
