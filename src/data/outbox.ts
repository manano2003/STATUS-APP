import { supabase } from './supabase'

interface OutboxItem {
  id: string
  rpcName: string
  params: Record<string, any>
  createdAt: number
  attempts: number
  lastError?: string
  isPermanentError?: boolean
}

const DB_NAME = 'status_outbox'
const STORE_NAME = 'queue'
const DRAIN_INTERVAL = 30000

let db: IDBDatabase | null = null
let draining = false
let listeners: Array<(count: number) => void> = []

function openDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    req.onsuccess = () => { db = req.result; resolve(db) }
    req.onerror = () => reject(req.error)
  })
}

async function getAll(): Promise<OutboxItem[]> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

async function put(item: OutboxItem): Promise<void> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(item)
    tx.oncomplete = () => { resolve(); notifyListeners() }
    tx.onerror = () => reject(tx.error)
  })
}

async function remove(id: string): Promise<void> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(id)
    tx.oncomplete = () => { resolve(); notifyListeners() }
    tx.onerror = () => reject(tx.error)
  })
}

function isPermanentError(error: any): boolean {
  const msg = String(error?.message || error || '')
  return msg.includes('unique') || msg.includes('foreign key') || msg.includes('violates') || msg.includes('schema')
}

async function notifyListeners() {
  const items = await getAll()
  const pending = items.filter(i => !i.isPermanentError).length
  listeners.forEach(fn => fn(pending))
}

export function onPendingChange(fn: (count: number) => void) {
  listeners.push(fn)
  notifyListeners()
  return () => { listeners = listeners.filter(l => l !== fn) }
}

export async function getPendingCount(): Promise<number> {
  const items = await getAll()
  return items.filter(i => !i.isPermanentError).length
}

export async function writeOrQueue(rpcName: string, params: Record<string, any>): Promise<any> {
  try {
    const { data, error } = await supabase.rpc(rpcName, params)
    if (error) throw error
    return data
  } catch (err: any) {
    if (isPermanentError(err)) {
      console.error(`[Outbox] Permanent error for ${rpcName}:`, err)
      return null
    }
    const item: OutboxItem = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      rpcName,
      params,
      createdAt: Date.now(),
      attempts: 1,
      lastError: String(err?.message || err),
    }
    await put(item)
    console.warn(`[Outbox] Queued ${rpcName} (offline/failed)`)
    return null
  }
}

export async function drain(): Promise<number> {
  if (draining) return 0
  draining = true
  let drained = 0
  try {
    const items = await getAll()
    const retryable = items.filter(i => !i.isPermanentError)
    for (const item of retryable) {
      try {
        const { error } = await supabase.rpc(item.rpcName, item.params)
        if (error) throw error
        await remove(item.id)
        drained++
      } catch (err: any) {
        if (isPermanentError(err)) {
          await put({ ...item, isPermanentError: true, lastError: String(err?.message || err) })
        } else {
          await put({ ...item, attempts: item.attempts + 1, lastError: String(err?.message || err) })
        }
      }
    }
  } finally {
    draining = false
    await notifyListeners()
  }
  return drained
}

export function startAutoDrain() {
  drain()

  setInterval(drain, DRAIN_INTERVAL)

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') drain()
    })
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => drain())
  }
}
