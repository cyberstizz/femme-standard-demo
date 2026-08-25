import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SEED_PIECES, SAVED_SEED, CATEGORY_SEED, SETTINGS_SEED } from './data/pieces'

const KEY = 'fs-demo-v2'
const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

const fresh = () => ({
  pieces: SEED_PIECES,
  categories: CATEGORY_SEED,
  settings: SETTINGS_SEED,
  bag: [],
  saved: SAVED_SEED,
  orders: [],
  mySize: 'M',
  alerts: true,
  user: null,
})

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY))
    if (!d || !Array.isArray(d.pieces) || !Array.isArray(d.categories)) return null
    return { ...fresh(), ...d, settings: { ...SETTINGS_SEED, ...(d.settings ?? {}) } }
  } catch {
    return null
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => load() ?? fresh())
  const [quotaFull, setQuotaFull] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
      setQuotaFull(false)
    } catch {
      setQuotaFull(true)
    }
  }, [state])

  // Expired holds go back on sale.
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
    const patch = (fn) => setState(fn)
    const { settings, categories } = state

    return {
      ...state,
      quotaFull,
      isOwner: state.user?.role === 'owner',

      byId: (id) => state.pieces.find((p) => p.id === id),
      live: () => state.pieces.filter((p) => p.status === 'live'),
      inBag: (id) => state.bag.some((b) => b.id === id),
      isSaved: (id) => state.saved.includes(id),

      categoryById: (id) => categories.find((c) => c.id === id) ?? null,
      categoryName: (id) => categories.find((c) => c.id === id)?.name ?? 'Uncategorised',
      countIn: (id) => state.pieces.filter((p) => p.categoryId === id).length,

      /* ---------- shopping ---------- */
      addToBag: (id) =>
        patch((s) =>
          s.bag.some((b) => b.id === id)
            ? s
            : { ...s, bag: [...s.bag, { id, heldUntil: Date.now() + settings.holdMinutes * 60000 }] },
        ),
      removeFromBag: (id) => patch((s) => ({ ...s, bag: s.bag.filter((b) => b.id !== id) })),
      toggleSaved: (id) =>
        patch((s) => ({
          ...s,
          saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
        })),
      setMySize: (mySize) => patch((s) => ({ ...s, mySize })),
      setAlerts: (alerts) => patch((s) => ({ ...s, alerts })),

      /* ---------- accounts ---------- */
      signIn: (email) =>
        patch((s) => ({
          ...s,
          user: { role: 'shopper', email, name: nameFrom(email) },
        })),
      signInOwner: () =>
        patch((s) => ({
          ...s,
          user: { role: 'owner', email: 'latavia@thefemmestandard.com', name: 'Latavia' },
        })),
      signOut: () => patch((s) => ({ ...s, user: null })),

      /* ---------- orders ---------- */
      checkout: (buyer) => {
        const ref = 1043 + state.orders.length
        patch((s) => {
          const ids = s.bag.map((b) => b.id)
          return {
            ...s,
            pieces: s.pieces.map((p) => (ids.includes(p.id) ? { ...p, status: 'sold', soldInDays: 0 } : p)),
            bag: [],
            orders: [
              { ref, ids, buyer, placedAt: Date.now(), packed: { steamed: false, card: false, label: false } },
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

      /* ---------- pieces (admin) ---------- */
      savePiece: (piece) =>
        patch((s) => ({
          ...s,
          pieces: s.pieces.some((p) => p.id === piece.id)
            ? s.pieces.map((p) => (p.id === piece.id ? { ...p, ...piece } : p))
            : [piece, ...s.pieces],
        })),
      deletePiece: (id) => patch((s) => ({ ...s, pieces: s.pieces.filter((p) => p.id !== id) })),
      setPieceStatus: (id, status) =>
        patch((s) => ({ ...s, pieces: s.pieces.map((p) => (p.id === id ? { ...p, status } : p)) })),

      /* ---------- categories (admin) ---------- */
      addCategory: (name, silhouette) =>
        patch((s) => ({
          ...s,
          categories: [...s.categories, { id: `c-${Date.now().toString(36)}`, name, silhouette }],
        })),
      updateCategory: (id, changes) =>
        patch((s) => ({
          ...s,
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)),
        })),
      moveCategory: (id, dir) =>
        patch((s) => {
          const i = s.categories.findIndex((c) => c.id === id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= s.categories.length) return s
          const next = [...s.categories]
          ;[next[i], next[j]] = [next[j], next[i]]
          return { ...s, categories: next }
        }),
      // Pieces are never orphaned: they move to the category you choose.
      deleteCategory: (id, moveToId) =>
        patch((s) => ({
          ...s,
          categories: s.categories.filter((c) => c.id !== id),
          pieces: s.pieces.map((p) => (p.categoryId === id ? { ...p, categoryId: moveToId } : p)),
        })),

      /* ---------- settings (admin) ---------- */
      updateSettings: (changes) => patch((s) => ({ ...s, settings: { ...s.settings, ...changes } })),

      reset: () => {
        localStorage.removeItem(KEY)
        setState(fresh())
      },
    }
  }, [state, quotaFull])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

function nameFrom(email) {
  const raw = String(email).split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (!raw) return 'Shopper'
  return raw
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
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

// Real build swaps this for a direct upload to Supabase Storage, keeping only the URL.
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