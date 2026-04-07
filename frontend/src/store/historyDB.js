const DB_NAME = 'kriyashakti'
const STORE_NAME = 'history'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('wish', 'wish', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = e => reject(e.target.error)
  })
}

export async function saveToHistory(result) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const entry = { ...result, createdAt: Date.now() }
    const req = store.add(entry)
    req.onsuccess = e => resolve(e.target.result) // returns new id
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
