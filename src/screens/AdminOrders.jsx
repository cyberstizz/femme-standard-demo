import { Link } from 'react-router-dom'
import { useStore, money } from '../store'
import { Shot, AdminNav, Empty } from '../ui'

export default function AdminOrders() {
  const { orders, byId } = useStore()
  const open = orders.filter((o) => !o.packed.label)
  const done = orders.filter((o) => o.packed.label)

  const row = (o) => {
    const pieces = o.ids.map(byId).filter(Boolean)
    const total = pieces.reduce((n, p) => n + p.price, 0)
    return (
      <Link key={o.ref} className="orow" to={`/admin/orders/${o.ref}`}>
        <div className="th">{pieces[0] && <Shot piece={pieces[0]} />}</div>
        <div className="m">
          <b>Order #{o.ref}</b>
          <em>
            {o.buyer.name} · {pieces.length} {pieces.length === 1 ? 'piece' : 'pieces'}
          </em>
          <span className={`tagp${o.packed.label ? ' sold' : ' live'}`}>
            {o.packed.label ? 'Shipped' : 'Pack & ship'}
          </span>
        </div>
        <div className="pr">{money(total)}</div>
      </Link>
    )
  }

  return (
    <>
      <div className="appbar">
        <div className="title">Orders</div>
        <span className="linkout" style={{ color: 'var(--muted)' }}>
          {orders.length} total
        </span>
      </div>

      <div className="view">
        {orders.length === 0 ? (
          <Empty
            title="No orders yet"
            body="When someone checks out, the order lands here with their address and a packing checklist."
            action="View shop"
            to="/"
          />
        ) : (
          <div className="pad">
            {open.length > 0 && (
              <>
                <div className="lab" style={{ paddingTop: 14 }}>
                  To ship
                </div>
                {open.map(row)}
              </>
            )}
            {done.length > 0 && (
              <>
                <div className="lab" style={{ paddingTop: 20 }}>
                  Shipped
                </div>
                {done.map(row)}
              </>
            )}
            <div className="spacer" />
          </div>
        )}
      </div>

      <AdminNav />
    </>
  )
}