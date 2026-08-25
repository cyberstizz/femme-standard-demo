import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, money } from '../store'
import { Icon, Shot } from '../ui'
import latavia from '../assets/latavia.jpg'

export default function Closet() {
  const { pieces, orders } = useStore()
  const [tab, setTab] = useState('live')

  const live = pieces.filter((p) => p.status === 'live')
  const sold = pieces.filter((p) => p.status === 'sold')
  const drafts = pieces.filter((p) => p.status === 'draft')
  const shown = tab === 'live' ? live : tab === 'sold' ? sold : drafts

  const monthTotal = sold.reduce((n, p) => n + p.price, 0)
  const toShip = orders.filter((o) => !o.packed.label).length

  return (
    <>
      <div className="ownerbar">
        <div className="who">
          <div className="av">
            <img src={latavia} alt="" />
          </div>
          <div>
            <b>Latavia</b>
            <em>The Femme Standard</em>
          </div>
        </div>
        <Link to="/account" className="icons" aria-label="Back to shopper view">
          <Icon name="chart" />
        </Link>
      </div>

      <div className="kpis">
        <div className="kpi">
          <b>{live.length}</b>
          <span>Live</span>
        </div>
        <div className="kpi">
          <b className="g">{money(monthTotal)}</b>
          <span>Sold to date</span>
        </div>
        <div className="kpi">
          <b>{toShip}</b>
          <span>To ship</span>
        </div>
      </div>

      <div className="pills" style={{ paddingTop: 14 }}>
        <button className={`pill${tab === 'live' ? ' on' : ''}`} onClick={() => setTab('live')}>
          Live {live.length}
        </button>
        <button className={`pill${tab === 'sold' ? ' on' : ''}`} onClick={() => setTab('sold')}>
          Sold {sold.length}
        </button>
        <button className={`pill${tab === 'drafts' ? ' on' : ''}`} onClick={() => setTab('drafts')}>
          Drafts {drafts.length}
        </button>
      </div>

      <div className="view">
        {orders.length > 0 && tab === 'live' && (
          <div className="pad" style={{ paddingBottom: 6 }}>
            <div className="lab">Waiting to go out</div>
            {orders.map((o) => (
              <Link key={o.ref} className="orow" to={`/owner/order/${o.ref}`}>
                <div className="th">
                  <Shot piece={pieces.find((p) => p.id === o.ids[0]) ?? { silhouette: 'dress', photos: [] }} />
                </div>
                <div className="m">
                  <b>Order #{o.ref}</b>
                  <em>
                    {o.buyer.name} · {o.ids.length} {o.ids.length === 1 ? 'piece' : 'pieces'}
                  </em>
                  <span className={`tagp${o.packed.label ? ' sold' : ' live'}`}>
                    {o.packed.label ? 'Shipped' : 'Pack & ship'}
                  </span>
                </div>
                <div className="pr">
                  {money(o.ids.reduce((n, id) => n + (pieces.find((p) => p.id === id)?.price ?? 0), 0))}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="pad">
          {tab === 'live' && orders.length > 0 && <div className="lab" style={{ paddingTop: 14 }}>Your closet</div>}
          {shown.length === 0 ? (
            <div className="empty">
              <h5>Nothing here</h5>
              <p>
                {tab === 'drafts'
                  ? 'Drafts are pieces you started listing but haven’t priced or published yet.'
                  : 'Pieces will show up here as you list them.'}
              </p>
            </div>
          ) : (
            shown.map((p) => (
              <Link key={p.id} className="orow" to={p.status === 'draft' ? `/owner/new?edit=${p.id}` : `/piece/${p.id}`}>
                <div className="th">
                  <Shot piece={p} />
                </div>
                <div className="m">
                  <b>{p.title}</b>
                  <em>
                    {p.size === 'One size' ? 'One size' : `Size ${p.size}`} · {p.condition}
                  </em>
                  <span className={`tagp${p.status === 'live' ? ' live' : p.status === 'sold' ? ' sold' : ''}`}>
                    {p.status === 'live'
                      ? `Live · ${p.views} views · ${p.saves} saves`
                      : p.status === 'sold'
                        ? `Sold in ${p.soldInDays || 1}d`
                        : 'Draft · no price yet'}
                  </span>
                </div>
                <div className="pr" style={{ color: p.price ? undefined : 'var(--muted)' }}>
                  {p.price ? money(p.price) : '—'}
                </div>
              </Link>
            ))
          )}
          <div className="spacer" />
        </div>
      </div>

      <div className="cta">
        <Link className="btn" to="/owner/new">
          <Icon name="plus" size={17} />
          List a piece
        </Link>
      </div>
    </>
  )
}
