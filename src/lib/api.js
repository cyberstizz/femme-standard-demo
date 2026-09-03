// Every database call the app makes, in one place.
// The screens never talk to Supabase directly — they call these.
import { supabase, photoUrl } from './supabase'

const centsToPrice = (c) => (c ?? 0) / 100
const priceToCents = (p) => Math.round(Number(p || 0) * 100)

// Database row -> the shape the screens already expect.
export function toPiece(row) {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    size: row.size,
    condition: row.condition,
    price: centsToPrice(row.price_cents),
    status: row.status,
    measurements: row.measurements,
    fabric: row.fabric ?? '',
    notes: row.notes ?? '',
    worn: row.worn ?? '',
    silhouette: row.silhouette ?? 'dress',
    views: row.views ?? 0,
    saves: row.saves ?? 0,
    soldAt: row.sold_at,
    photos: (row.piece_photos ?? [])
      .sort((a, b) => a.position - b.position)
      .map((p) => photoUrl(p.path)),
  }
}

const PIECE_SELECT = '*, piece_photos(path, position)'

/* ------------------------------------------------------------------ read -- */

export async function fetchShop() {
  const [pieces, categories, settings] = await Promise.all([
    supabase.from('pieces').select(PIECE_SELECT).order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('position'),
    supabase.from('settings').select('*').single(),
  ])
  if (pieces.error) throw pieces.error
  if (categories.error) throw categories.error
  if (settings.error) throw settings.error

  return {
    pieces: pieces.data.map(toPiece),
    categories: categories.data,
    settings: {
      storeName: settings.data.store_name,
      shipFrom: settings.data.ship_from,
      freeShippingOver: centsToPrice(settings.data.free_shipping_cents),
      flatShipping: centsToPrice(settings.data.flat_shipping_cents),
      taxRate: Number(settings.data.tax_rate),
      holdMinutes: settings.data.hold_minutes,
      storyEyebrow: settings.data.story_eyebrow,
      storyTitle: settings.data.story_title,
      quote: settings.data.quote,
      quoteBy: settings.data.quote_by,
      storyBody: settings.data.story_body,
    },
  }
}

export async function fetchMyHolds() {
  const { data, error } = await supabase.from('holds').select('piece_id, expires_at')
  if (error) throw error
  return data.map((h) => ({ id: h.piece_id, heldUntil: new Date(h.expires_at).getTime() }))
}

export async function fetchSaved() {
  const { data, error } = await supabase.from('saved_pieces').select('piece_id')
  if (error) throw error
  return data.map((r) => r.piece_id)
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(piece_id, price_cents)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map((o) => ({
    id: o.id,
    ref: o.ref,
    ids: o.order_items.map((i) => i.piece_id),
    buyer: o.ship_to ?? {},
    total: centsToPrice(o.total_cents),
    status: o.status,
    packed: o.packed,
    placedAt: new Date(o.created_at).getTime(),
  }))
}

/* --------------------------------------------------------------- shopping -- */

// Returns false when someone else got there first — show "just sold".
export async function claimPiece(pieceId) {
  const { data, error } = await supabase.rpc('claim_piece', { p_piece: pieceId })
  if (error) throw error
  return data === true
}

export async function releasePiece(pieceId) {
  const { error } = await supabase.rpc('release_piece', { p_piece: pieceId })
  if (error) throw error
}

export async function toggleSaved(pieceId, currentlySaved) {
  const { data: session } = await supabase.auth.getUser()
  const buyer = session?.user?.id
  if (!buyer) return
  if (currentlySaved) {
    await supabase.from('saved_pieces').delete().eq('piece_id', pieceId).eq('buyer_id', buyer)
  } else {
    await supabase.from('saved_pieces').insert({ piece_id: pieceId, buyer_id: buyer })
  }
}

// Creates a pending order. Stripe takes the money; the webhook calls
// mark_order_paid, which is the only thing that flips a piece to sold.
export async function createOrder(shipTo) {
  const { data, error } = await supabase.rpc('create_order', { p_ship_to: shipTo })
  if (error) throw error
  return data
}

/* ------------------------------------------------------------------ admin -- */

export async function savePiece(piece, photoFiles = []) {
  const row = {
    title: piece.title,
    category_id: piece.categoryId || null,
    size: piece.size,
    condition: piece.condition,
    price_cents: priceToCents(piece.price),
    status: piece.status,
    measurements: piece.measurements,
    fabric: piece.fabric,
    notes: piece.notes,
    worn: piece.worn,
    silhouette: piece.silhouette,
  }

  const { data, error } = piece.id
    ? await supabase.from('pieces').update(row).eq('id', piece.id).select('id').single()
    : await supabase.from('pieces').insert(row).select('id').single()
  if (error) throw error

  if (photoFiles.length) await uploadPhotos(data.id, photoFiles)
  return data.id
}

// Photos go straight to Storage; only the path is kept in the database.
export async function uploadPhotos(pieceId, files) {
  const existing = await supabase.from('piece_photos').select('position').eq('piece_id', pieceId)
  let next = (existing.data ?? []).reduce((n, p) => Math.max(n, p.position + 1), 0)

  for (const file of files) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${pieceId}/${next}.${ext}`
    const { error } = await supabase.storage
      .from('pieces')
      .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' })
    if (error) throw error
    await supabase.from('piece_photos').insert({ piece_id: pieceId, path, position: next })
    next += 1
  }
}

export async function deletePhoto(pieceId, path) {
  await supabase.storage.from('pieces').remove([path])
  await supabase.from('piece_photos').delete().eq('piece_id', pieceId).eq('path', path)
}

export async function deletePiece(id) {
  const { error } = await supabase.from('pieces').delete().eq('id', id)
  if (error) throw error
}

export async function addCategory(name, silhouette, position) {
  const { error } = await supabase.from('categories').insert({ name, silhouette, position })
  if (error) throw error
}

export async function updateCategory(id, changes) {
  const { error } = await supabase.from('categories').update(changes).eq('id', id)
  if (error) throw error
}

// Pieces are moved first so nothing is ever orphaned.
export async function deleteCategory(id, moveToId) {
  await supabase.from('pieces').update({ category_id: moveToId }).eq('category_id', id)
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function reorderCategories(ordered) {
  for (let i = 0; i < ordered.length; i += 1) {
    await supabase.from('categories').update({ position: i }).eq('id', ordered[i].id)
  }
}

export async function updateSettings(changes) {
  const row = {}
  const map = {
    storeName: 'store_name',
    shipFrom: 'ship_from',
    holdMinutes: 'hold_minutes',
    taxRate: 'tax_rate',
    storyEyebrow: 'story_eyebrow',
    storyTitle: 'story_title',
    quote: 'quote',
    quoteBy: 'quote_by',
    storyBody: 'story_body',
  }
  for (const [k, v] of Object.entries(changes)) {
    if (k === 'freeShippingOver') row.free_shipping_cents = priceToCents(v)
    else if (k === 'flatShipping') row.flat_shipping_cents = priceToCents(v)
    else if (map[k]) row[map[k]] = v
  }
  const { error } = await supabase.from('settings').update(row).eq('id', true)
  if (error) throw error
}

export async function setPacked(orderRef, packed) {
  const { error } = await supabase.from('orders').update({ packed }).eq('ref', orderRef)
  if (error) throw error
}

/* ------------------------------------------------------------------- auth -- */

export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function fetchProfile() {
  const { data: session } = await supabase.auth.getUser()
  if (!session?.user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  return data
    ? { id: data.id, email: session.user.email, name: data.full_name, role: data.role, size: data.size }
    : null
}