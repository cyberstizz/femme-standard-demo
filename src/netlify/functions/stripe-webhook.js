// The only thing allowed to mark an order paid.
//
// Deliberately server side: if the browser could do this, a shopper could close
// the tab mid-payment and still own the dress. Stripe signs every event, and an
// unsigned request is rejected before anything is read.
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})

export default async (req) => {
  const signature = req.headers.get('stripe-signature')
  const raw = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    console.error('Bad Stripe signature:', e.message)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata?.order_id
      if (orderId && session.payment_status === 'paid') {
        // Idempotent: mark_order_paid only acts on a pending order, so Stripe
        // retrying the same event changes nothing.
        const { error } = await admin.rpc('mark_order_paid', {
          p_order: orderId,
          p_intent: session.payment_intent ?? session.id,
        })
        if (error) throw error

        if (session.shipping_details?.address) {
          const a = session.shipping_details.address
          await admin
            .from('orders')
            .update({
              ship_to: {
                name: session.shipping_details.name ?? session.customer_details?.name,
                line1: [a.line1, a.line2].filter(Boolean).join(', '),
                city: `${a.city}, ${a.state} ${a.postal_code}`,
                email: session.customer_details?.email,
              },
            })
            .eq('id', orderId)
        }
      }
    }

    // A shopper who abandons Checkout gets their held pieces back.
    if (event.type === 'checkout.session.expired') {
      const orderId = event.data.object.metadata?.order_id
      if (orderId) {
        await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId).eq('status', 'pending')
        await admin.rpc('release_expired_holds')
      }
    }

    return new Response('ok', { status: 200 })
  } catch (e) {
    console.error('Webhook handling failed:', e)
    // Non-2xx makes Stripe retry, which is what we want on a transient failure.
    return new Response('Handler error', { status: 500 })
  }
}