# The Femme Standard — clickable demo

A front-end-only React app matching the approved mockups. Every screen is real and
navigable; the data lives in the browser. Built for Latavia to hold in her hand and
react to, not to take orders.

**Client:** Latavia · The Femme Standard
**Built by:** EasyCode
**Stage:** Design review

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
```

## Deploy to Netlify

Push to GitHub, then in Netlify: **Add new site → Import an existing project**.
`netlify.toml` already sets build command `npm run build`, publish directory `dist`,
and the SPA redirect, so no manual configuration is needed.

The SPA redirect matters — without it, refreshing on `/piece/fs-01` returns a 404.
It's covered twice (in `netlify.toml` and `public/_redirects`) so it can't be missed.

---

## Showing it to her

A five-minute path that lands the concept:

1. **Shop** — two-across grid, condition badge on each photo, sold pieces greyed out.
2. Tap a piece — **size, condition, and measurements** as three facts. No size selector,
   because there's one of everything.
3. **Add to bag** — the 15-minute hold timer starts and counts down live.
4. **Checkout** — the piece flips to sold and leaves the shop for good.
5. Switch to **You → Owner view** — that's her side.
6. **List a piece** — hand her the phone. Let her photograph the mannequin and publish.
   It appears in the shop with her photo in about ten seconds.

Step 6 is the one that sells the project. Everything before it she can imagine; that one
she has to feel.

The **Reset** button in the top banner restores the sample data — useful between demos.

---

## What's real and what isn't

| Real | Faked |
| --- | --- |
| All 11 screens and navigation | No server — data lives in `localStorage` |
| Photo upload, compression, publish | No payment is taken at checkout |
| Hold timers, expiry, release | Buyer is always "Jasmine M." |
| Filters, search, saved pieces | Views and saves counts are seeded |
| Sold state flowing to the owner side | No email, SMS, or shipping labels |

Photos are compressed to roughly 900px before storage. Browser storage caps around 5MB,
so after a few dozen photos the banner switches to a warning and the demo keeps running
in memory for that session. That's a demo limitation, not a design one.

---

## Code layout

```
src/
  data/pieces.js     seed inventory — swap for a Supabase query, same shape
  store.jsx          state, persistence, hold logic, image compression
  ui.jsx             icons, garment silhouettes, product tile, tab bar
  screens/           one file per screen
  styles.css         the whole design system
```

The store is deliberately the only thing that knows where data comes from. Replacing
`localStorage` with Supabase means rewriting `store.jsx` and nothing else — the screens
never touch storage directly.

---

## Recommended architecture for the real build

### Supabase only. No separate backend service.

The entire domain is pieces, orders, and holds, with one seller and low write volume.
Supabase covers Postgres, auth, file storage, row-level security, and server-side
functions in one project. A Spring Boot service would be a second deployable to keep
alive and pay for, and it wouldn't do anything Postgres and an Edge Function can't.

Worth saying plainly: a shared backend across every EasyCode client would be a mistake
here. Per-client Supabase projects mean the client owns their data, the project can be
handed over intact if the relationship ends, and one client's outage can't touch another's.

### Schema

```sql
profiles      (id, role 'owner'|'shopper', size, alert_size)
pieces        (id, title, category, size, condition, price_cents,
               status 'draft'|'live'|'held'|'sold',
               measurements jsonb, fabric, notes, created_at)
piece_photos  (id, piece_id, path, position)
holds         (piece_id pk, buyer_id, expires_at)
orders        (id, buyer_id, total_cents, stripe_payment_intent, status, created_at)
order_items   (order_id, piece_id, price_cents)
saved_pieces  (buyer_id, piece_id)
```

### The one genuinely hard part

Two people, one dress. This has to be guaranteed by the database, never by React.

```sql
update pieces
   set status = 'held'
 where id = $1
   and status = 'live'
returning id;
```

Zero rows back means someone else got it — show "just sold" and move on. That single
conditional update is the whole one-of-one guarantee. Everything else is presentation.

Expired holds go back on sale with a `pg_cron` job running every minute:

```sql
update pieces set status = 'live'
 where status = 'held'
   and id in (select piece_id from holds where expires_at < now());
```

### The rest

- **Payments** — Stripe. One Edge Function creates the PaymentIntent, a second receives
  the webhook and flips `held → sold`. The status change happens on the webhook, never
  from the browser, or a closed tab mid-payment leaves a piece in limbo.
- **Photos** — Supabase Storage, public read, insert restricted to the owner role.
  Use Supabase's image transformation parameters for grid thumbnails rather than
  generating sizes on upload.
- **Auth** — Supabase Auth with magic links. Shoppers won't make passwords for a store
  they visit twice a month. Latavia's `profiles.role` is set to `owner` by hand, once.
- **RLS** — anonymous users select pieces where `status <> 'draft'`; buyers select their
  own orders; only the owner writes pieces. Written properly, RLS is the entire
  authorization layer.
- **Native app** — this is already installable to a home screen. If the App Store
  matters later, Capacitor wraps this same code. Starting in React Native would mean
  rebuilding what already works.

### Build order

1. Supabase project, schema, RLS policies
2. Owner auth and List a piece writing to the real database
3. Shop and piece pages reading from it
4. Stripe checkout and webhook
5. Holds and the `pg_cron` release job
6. Shipping labels, only if she wants them in the app

Running cost is roughly Netlify free, Supabase free to $25/month, plus Stripe's
2.9% + 30¢. Small enough to fold into a maintenance plan.

---

## Open questions for Latavia

- Do sold pieces stay visible in the shop, or drop out of it?
- Is free shipping over $150 right, or above what people actually spend?
- Will she measure every piece? Nothing else prevents returns on one-of-one stock.
- Does she want to buy shipping labels in the app, or keep her current workflow?
- Should there be a **brand** field on each piece? Recognizable labels sell resale, but
  it's another thing to fill in per listing.
- Worth checking with her accountant how sales tax is handled on resale in Florida
  before checkout goes live.
