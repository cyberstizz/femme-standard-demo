import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import * as api from './lib/api'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

// Shown until the first load returns, so nothing reads undefined settings.
const DEFAULT_SETTINGS = {
  storeName: 'The Femme Standard',
  shipFrom: 'Miami',
  freeShippingOver: 150,
  flatShipping: 8,
  taxRate: 0.07,
  holdMinutes: 15,
  storyEyebrow: 'The Standard',
  storyTitle: '',
  quote: '',
  quoteBy: '',
  storyBody: '',
}

export function StoreProvider({ children }) {
  const [pieces, setPieces] = useState([])
  const [categories, setCategories] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [bag, setBag] = useState([])
  const [saved, setSaved] = useState([])
  const [orders, setOrders] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* ---------------------------------------------------------- loading -- */

  const loadShop = useCallback(async () => {
    const shop = await api.fetchShop()
    setPieces(shop.pieces)
    setCategories(shop.categories)
    setSettings({ ...DEFAULT_SETTINGS, ...shop.settings })
  }, [])

  // Everything that only exists for a signed-in person.
  const loadMine = useCallback(async (profile) => {
    if (!profile) {
      setBag([])
      setSaved([])
      setOrders([])
      return
    }
    const [holds, savedIds, myOrders] = await Promise.all([
      api.fetchMyHolds(),
      api.fetchSaved(),
      api.fetchOrders(),
    ])
    setBag(holds)
    setSaved(savedIds)
    setOrders(myOrders)
  }, [])

  const refresh = useCallback(
    async (profile = user) => {
      try {
        await Promise.all([loadShop(), loadMine(profile)])
        setError(null)
      } catch (e) {
        setError(e.message ?? String(e))
      }
    },
    [loadShop, loadMine, user],
  )

  useEffect(() => {
    let alive = true

    const boot = async () => {
      try {
        const profile = await api.fetchProfile()
        if (!alive) return
        setUser(profile)
        await Promise.all([loadShop(), loadMine(profile)])
      } catch (e) {
        if (alive) setError(e.message ?? String(e))
      } finally {
        if (alive) setLoading(false)
      }
    }
    boot()

    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return
      const profile = await api.fetchProfile()
      if (!alive) return
      setUser(profile)
      await Promise.all([loadShop(), loadMine(profile)])
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [loadShop, loadMine])

  // Drop holds locally the moment they lapse; the database frees them too.
  useEffect(() => {
    const t = setInterval(() => {
      setBag((b) => {
        const live = b.filter((h) => h.heldUntil > Date.now())
        return live.length === b.length ? b : live
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  /* ---------------------------------------------------------- actions -- */

  const value = useMemo(() => {
    const run = async (fn) => {
      try {
        const out = await fn()
        setError(null)
        return out
      } catch (e) {
        setError(e.message ?? String(e))
        throw e
      }
    }

    return {
      pieces,
      categories,
      settings,
      bag,
      saved,
      orders,
      user,
      loading,
      error,
      clearError: () => setError(null),
      isOwner: user?.role === 'owner',
      mySize: user?.size ?? 'M',
      alerts: user?.alerts ?? true,

      byId: (id) => pieces.find((p) => p.id === id),
      live: () => pieces.filter((p) => p.status === 'live'),
      inBag: (id) => bag.some((b) => b.id === id),
      isSaved: (id) => saved.includes(id),
      categoryById: (id) => categories.find((c) => c.id === id) ?? null,
      categoryName: (id) => categories.find((c) => c.id === id)?.name ?? 'Uncategorised',
      countIn: (id) => pieces.filter((p) => p.categoryId === id).length,

      refresh: () => refresh(user),

      /* ---- auth ---- */
      signIn: (email, password) => run(() => api.signInWithPassword(email, password)),
      signUp: (email, password) => run(() => api.signUpWithPassword(email, password)),
      signOut: () => run(async () => { await api.signOut(); setUser(null) }),
      changePassword: (password) => run(() => api.updatePassword(password)),

      setMySize: (size) =>
        run(async () => {
          await api.updateProfile({ size })
          setUser((u) => (u ? { ...u, size } : u))
        }),
      setAlerts: (alerts) =>
        run(async () => {
          await api.updateProfile({ alerts })
          setUser((u) => (u ? { ...u, alerts } : u))
        }),

      /* ---- shopping ---- */
      // Returns false when someone else claimed it first.
      addToBag: (id) =>
        run(async () => {
          const won = await api.claimPiece(id)
          await refresh(user)
          return won
        }),
      removeFromBag: (id) =>
        run(async () => {
          await api.releasePiece(id)
          await refresh(user)
        }),
      toggleSaved: (id) =>
        run(async () => {
          await api.toggleSaved(id, saved.includes(id))
          setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
        }),

      checkout: (buyer) =>
        run(async () => {
          const orderId = await api.createOrder(buyer)
          // Stripe replaces this line. See markOrderPaidDemo in lib/api.js.
          await api.markOrderPaidDemo(orderId)
          const fresh = await api.fetchOrders()
          setOrders(fresh)
          await loadShop()
          setBag([])
          return fresh.find((o) => o.id === orderId)?.ref ?? ''
        }),

      togglePacked: (ref, key) =>
        run(async () => {
          const order = orders.find((o) => o.ref === ref)
          if (!order) return
          const packed = { ...order.packed, [key]: !order.packed[key] }
          await api.setPacked(ref, packed)
          setOrders((os) => os.map((o) => (o.ref === ref ? { ...o, packed } : o)))
        }),

      /* ---- admin ---- */
      savePiece: (piece, files = [], removePaths = []) =>
        run(async () => {
          const id = await api.savePiece(piece, files)
          for (const path of removePaths) await api.deletePhoto(piece.id, path)
          await loadShop()
          return id
        }),
      deletePiece: (id) => run(async () => { await api.deletePiece(id); await loadShop() }),
      setPieceStatus: (id, status) =>
        run(async () => { await api.savePiece({ ...pieces.find((p) => p.id === id), status }); await loadShop() }),

      addCategory: (name, silhouette) =>
        run(async () => { await api.addCategory(name, silhouette, categories.length); await loadShop() }),
      updateCategory: (id, changes) =>
        run(async () => {
          setCategories((cs) => cs.map((c) => (c.id === id ? { ...c, ...changes } : c)))
          await api.updateCategory(id, changes)
        }),
      moveCategory: (id, dir) =>
        run(async () => {
          const i = categories.findIndex((c) => c.id === id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= categories.length) return
          const next = [...categories]
          ;[next[i], next[j]] = [next[j], next[i]]
          setCategories(next)
          await api.reorderCategories(next)
        }),
      deleteCategory: (id, moveToId) =>
        run(async () => { await api.deleteCategory(id, moveToId); await loadShop() }),

      updateSettings: (changes) =>
        run(async () => {
          setSettings((s) => ({ ...s, ...changes }))
          await api.updateSettings(changes)
        }),
    }
  }, [pieces, categories, settings, bag, saved, orders, user, loading, error, refresh, loadShop, loadMine])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
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

export const money = (n) => `$${Number(n).toFixed(2).replace(/\.00$/, '')}`