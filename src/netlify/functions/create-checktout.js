// Turns a pending order into a Stripe Checkout session.
//
// Runs on the server so the price is never taken from the browser: the order is
// re-read from the database and the total recomputed from what's stored. A
// tampered client can't discount anything.
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Secret key, server side only. It bypasses row level security, which is why it
// must never carry a VITE_ prefix.
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const { orderId } = await req.json()
    if (!orderId) return json({ error: 'Missing orderId' }, 400)

    const { data: order, error } = await admin
      .from('orders')
      .select('id, ref, status, subtotal_cents, shipping_cents, tax_cents, total_cents, order_items(piece_id, price_cents)')
      .eq('id', orderId)
      .single()

    if (error || !order) return json({ error: 'Order not found' }, 404)
    if (order.status !== 'pending') return json({ error: 'Order is not awaiting payment' }, 409)

    const ids = order.order_items.map((i) => i.piece_id)
    const { data: pieces } = await admin.from('pieces').select('id, title, status').in('id', ids)

    // Someone else may have taken a piece while this order sat unpaid.
    const unavailable = (pieces ?? []).filter((p) => p.status === 'sold')
    if (unavailable.length) {
      return json({ error: `No longer available: ${unavailable.map((p) => p.title).join(', ')}` }, 409)
    }

    const byId = Object.fromEntries((pieces ?? []).map((p) => [p.id, p]))
    const origin = req.headers.get('origin') || process.env.URL || ''

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Stripe Checkout shows card, Apple Pay and Google Pay automatically
      // wherever the shopper's device supports them.
      line_items: [
        ...order.order_items.map((item) => ({
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: item.price_cents,
            product_data: { name: byId[item.piece_id]?.title ?? 'Piece' },
          },
        })),
        ...(order.shipping_cents > 0
          ? [{
              quantity: 1,
              price_data: {
                currency: 'usd',
                unit_amount: order.shipping_cents,
                product_data: { name: 'Shipping' },
              },
            }]
          : []),
        ...(order.tax_cents > 0
          ? [{
              quantity: 1,
              price_data: {
                currency: 'usd',
                unit_amount: order.tax_cents,
                product_data: { name: 'Tax' },
              },
            }]
          : []),
      ],
      shipping_address_collection: { allowed_countries: ['US'] },
      // The webhook trusts this, not the browser.
      metadata: { order_id: order.id },
      payment_intent_data: { metadata: { order_id: order.id } },
      success_url: `${origin}/confirmed/${order.ref}`,
      cancel_url: `${origin}/bag`,
    })

    return json({ url: session.url })
  } catch (e) {
    console.error('create-checkout failed:', e)
    return json({ error: e.message ?? 'Could not start checkout' }, 500)
  }
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })