import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { SEED_PIECES, SAVED_SEED } from './data/pieces'

const KEY = 'fs-demo-v1'
const HOLD_MS = 15 * 60 * 1000

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const d = JSON.parse(raw)
    if (!d || !Array.isArray(d.pieces)) return null
    return d
  } catch {
    return null
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = load()
    return (
      saved ?? {
        pieces: SEED_PIECES,
        bag: [],
        saved: SAVED_SEED,
        orders: [],
        mySize: 'M',
        alerts: true,
      }
    )
  })
  const [quotaFull, setQuotaFull] = useState(false)

  // Persist. Photos are stored as compressed data URLs, so this can fill up —
  // if it does, the demo keeps working in memory for the rest of the session.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
      setQuotaFull(false)
    } catch {
      setQuotaFull(true)
    }
  }, [state])

  // Release expired holds back to the shop.
  useEffect(() => {
    const t = setInterval(() => {
      setState((s) => {
        const live = s.bag.filter((b) => b.heldUntil > Date.now())
        return live.length === s.bag.length ? s : { ...s, bag: live }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const api = useMemo(() => {
    const patch = (fn) => setState((s) => fn(s))

    return {
      ...state,
      quotaFull,

      byId: (id) => state.pieces.find((p) => p.id === id),
      live: () => state.pieces.filter((p) => p.status === 'live'),
      inBag: (id) => state.bag.some((b) => b.id === id),
      isSaved: (id) => state.saved.includes(id),

      addToBag: (id) =>
        patch((s) =>
          s.bag.some((b) => b.id === id)
            ? s
            : { ...s, bag: [...s.bag, { id, heldUntil: Date.now() + HOLD_MS }] },
        ),

      removeFromBag: (id) => patch((s) => ({ ...s, bag: s.bag.filter((b) => b.id !== id) })),

      toggleSaved: (id) =>
        patch((s) => ({
          ...s,
          saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
        })),

      setMySize: (mySize) => patch((s) => ({ ...s, mySize })),
      setAlerts: (alerts) => patch((s) => ({ ...s, alerts })),

      // Checkout marks every held piece sold and opens an order to pack.
      checkout: (buyer) => {
        const ref = 1043 + state.orders.length
        patch((s) => {
          const ids = s.bag.map((b) => b.id)
          return {
            ...s,
            pieces: s.pieces.map((p) =>
              ids.includes(p.id) ? { ...p, status: 'sold', soldInDays: 0 } : p,
            ),
            bag: [],
            orders: [
              {
                ref,
                ids,
                buyer,
                placedAt: Date.now(),
                packed: { steamed: false, card: false, label: false },
              },
              ...s.orders,
            ],
          }
        })
        return ref
      },

      togglePacked: (ref, key) =>
        patch((s) => ({
          ...s,
          orders: s.orders.map((o) =>
            o.ref === ref ? { ...o, packed: { ...o.packed, [key]: !o.packed[key] } } : o,
          ),
        })),

      savePiece: (piece) =>
        patch((s) => {
          const exists = s.pieces.some((p) => p.id === piece.id)
          return {
            ...s,
            pieces: exists
              ? s.pieces.map((p) => (p.id === piece.id ? { ...p, ...piece } : p))
              : [piece, ...s.pieces],
          }
        }),

      reset: () => {
        localStorage.removeItem(KEY)
        setState({
          pieces: SEED_PIECES,
          bag: [],
          saved: SAVED_SEED,
          orders: [],
          mySize: 'M',
          alerts: true,
        })
      },
    }
  }, [state, quotaFull])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useCountdown(until) {
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const left = Math.max(0, until - Date.now())
  const m = Math.floor(left / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return { left, label: `${m}:${String(s).padStart(2, '0')}` }
}

// Shrinks a photo before it goes into storage. Real build swaps this for a
// direct upload to Supabase Storage / R2 and keeps only the URL.
export async function compressImage(file, max = 900, quality = 0.75) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  return canvas.toDataURL('image/jpeg', quality)
}

export const money = (n) => `$${Number(n).toFixed(2).replace(/\.00$/, '')}`
export { HOLD_MS }
