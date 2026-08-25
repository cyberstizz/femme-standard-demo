import { useNavigate, Link } from 'react-router-dom'
import { useStore, useCountdown, money } from '../store'
import { Shot, TabBar, Empty } from '../ui'

function BagLine({ entry }) {
  const { byId, removeFromBag } = useStore()
  const piece = byId(entry.id)
  const { label, left } = useCountdown(entry.heldUntil)
  if (!piece) return null

  return (
    <div className="line">
      <Link to={`/piece/${piece.id}`} className="thumb">
        <Shot piece={piece} />
      </Link>
      <div className="info">
        <h6>{piece.title}</h6>
        <em>
          {piece.size === 'One size' ? 'One size' : `Size ${piece.size}`} · {piece.condition}
        </em>
        <div className="p">{money(piece.price)}</div>
        <div className={`hold${left < 5 * 60 * 1000 ? ' warn' : ''}`}>Held for you · {label}</div>
        <button className="drop-x" onClick={() => removeFromBag(piece.id)}>
          Release it
        </button>
      </div>
    </div>
  )
}

export default function Bag() {
  const { bag, byId, checkout, settings, user } = useStore()
  const nav = useNavigate()

  const items = bag.map((b) => ({ b, p: byId(b.id) })).filter((x) => x.p)
  const subtotal = items.reduce((n, x) => n + x.p.price, 0)
  const shipping = subtotal >= settings.freeShippingOver || subtotal === 0 ? 0 : 8
  const tax = subtotal * settings.taxRate
  const total = subtotal + shipping + tax

  const soonest = bag.length ? Math.min(...bag.map((b) => b.heldUntil)) : 0
  const { label } = useCountdown(soonest)

  const place = () => {
    if (!user) return nav('/signin?next=/bag')
    const ref = checkout({ name: user.name, line1: '1420 NW 62nd St, Apt 3B', city: 'Miami, FL 33142' })
    nav(`/confirmed/${ref}`)
  }

  return (
    <>
      <div className="appbar">
        <div className="title">Your bag</div>
        {bag.length > 0 && (
          <div className="icons" style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '.1em' }}>
            HELD {label}
          </div>
        )}
      </div>

      <div className="view">
        {items.length === 0 ? (
          <Empty
            title="Your bag is empty"
            body="Pieces are held for 15 minutes once you add them, so nobody can buy the one you're deciding on."
            action="Browse the shop"
            to="/"
          />
        ) : (
          <div className="pad">
            {items.map((x) => (
              <BagLine key={x.b.id} entry={x.b} />
            ))}

            <div className="totals">
              <div>
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--gold)' : undefined }}>
                  {shipping === 0 ? `Free over ${money(settings.freeShippingOver)}` : money(shipping)}
                </span>
              </div>
              <div>
                <span>Estimated tax</span>
                <span>{money(tax)}</span>
              </div>
              <div className="grand">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>

            <p className="note" style={{ marginTop: 18 }}>
              Each piece is one of one. If a hold runs out, it goes back to the shop for someone else.
            </p>
            <div className="spacer" />
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="cta">
          <button className="btn" onClick={place}>
            {user ? `Checkout · ${money(total)}` : 'Sign in to check out'}
          </button>
        </div>
      )}

      {items.length === 0 && <TabBar />}
    </>
  )
}