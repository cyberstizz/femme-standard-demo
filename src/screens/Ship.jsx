import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore, money } from '../store'
import { Shot, Icon, Empty } from '../ui'

const STEPS = [
  { key: 'paid', label: 'Payment cleared', locked: true },
  { key: 'steamed', label: 'Steamed and folded' },
  { key: 'card', label: 'Care card enclosed' },
  { key: 'label', label: 'Label printed' },
]

export default function Ship() {
  const { ref } = useParams()
  const nav = useNavigate()
  const { orders, byId, togglePacked } = useStore()
  const order = orders.find((o) => String(o.ref) === String(ref))

  if (!order) return <Empty title="Order not found" body="It may have been cleared with the demo data." action="Back to closet" to="/admin/orders" />

  const pieces = order.ids.map(byId).filter(Boolean)
  const total = pieces.reduce((n, p) => n + p.price, 0)
  const done = order.packed.label

  return (
    <>
      <div className="ship-h">
        <div className="k">Order #{order.ref} · Paid</div>
        <h5>{pieces.length === 1 ? pieces[0].title : `${pieces.length} pieces`}</h5>
      </div>

      <div className="view">
        <div className="pad">
          {pieces.map((p) => (
            <div className="line" key={p.id}>
              <div className="thumb">
                <Shot piece={p} />
              </div>
              <div className="info">
                <h6>
                  {p.size === 'One size' ? 'One size' : `Size ${p.size}`} · {p.condition}
                </h6>
                <em>{p.title}</em>
                <div className="p">{money(p.price)}</div>
              </div>
            </div>
          ))}

          <div className="addr" style={{ marginTop: 18 }}>
            <span>Ship to</span>
            {order.buyer.name}
            <br />
            {order.buyer.line1}
            <br />
            {order.buyer.city}
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="lab">Before it goes out</div>
            {STEPS.map((s) =>
              s.locked ? (
                <div className="check done" key={s.key}>
                  <div className="box on">
                    <Icon name="check" size={12} />
                  </div>
                  {s.label}
                </div>
              ) : (
                <button className="check" key={s.key} onClick={() => togglePacked(order.ref, s.key)}>
                  <div className={`box${order.packed[s.key] ? ' on' : ''}`}>
                    {order.packed[s.key] && <Icon name="check" size={12} />}
                  </div>
                  {s.label}
                </button>
              ),
            )}
          </div>

          <p className="note" style={{ marginTop: 20 }}>
            Total collected {money(total)}. Tracking texts the buyer automatically once the label is printed.
          </p>
          <div className="spacer" />
        </div>
      </div>

      <div className="cta">
        <Link className="btn quiet narrow" to="/admin/orders">
          Orders
        </Link>
        <button className="btn" onClick={() => (done ? nav('/admin/orders') : togglePacked(order.ref, 'label'))}>
          <Icon name="box" size={17} />
          {done ? 'Shipped' : 'Buy label · $5.85'}
        </button>
      </div>
    </>
  )
}