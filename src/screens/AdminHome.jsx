import { Link } from 'react-router-dom'
import { useStore, money } from '../store'
import { Icon, AdminNav } from '../ui'
import latavia from '../assets/latavia.jpg'

export default function AdminHome() {
  const { pieces, orders, categories, settings } = useStore()

  const live = pieces.filter((p) => p.status === 'live')
  const sold = pieces.filter((p) => p.status === 'sold')
  const drafts = pieces.filter((p) => p.status === 'draft')
  const toShip = orders.filter((o) => !o.packed.label)
  const earned = sold.reduce((n, p) => n + p.price, 0)
  const noPhotos = live.filter((p) => !p.photos?.length).length
  const noMeasure = live.filter((p) => !p.measurements).length

  return (
    <>
      <div className="ownerbar">
        <div className="who">
          <div className="av">
            <img src={latavia} alt="" />
          </div>
          <div>
            <b>{settings.storeName}</b>
            <em>Admin</em>
          </div>
        </div>
        <Link to="/" className="linkout">
          View shop
        </Link>
      </div>

      <div className="kpis">
        <div className="kpi">
          <b>{live.length}</b>
          <span>Live</span>
        </div>
        <div className="kpi">
          <b className="g">{money(earned)}</b>
          <span>Sold to date</span>
        </div>
        <div className="kpi">
          <b>{toShip.length}</b>
          <span>To ship</span>
        </div>
      </div>

      <div className="view">
        <div className="pad">
          {toShip.length > 0 && (
            <>
              <div className="lab" style={{ paddingTop: 18 }}>
                Needs you now
              </div>
              {toShip.map((o) => (
                <Link key={o.ref} className="taskrow" to={`/admin/orders/${o.ref}`}>
                  <div>
                    <b>Order #{o.ref}</b>
                    <em>
                      {o.buyer.name} · {o.ids.length} {o.ids.length === 1 ? 'piece' : 'pieces'} · not shipped
                    </em>
                  </div>
                  <Icon name="chev" size={16} />
                </Link>
              ))}
            </>
          )}

          {(drafts.length > 0 || noPhotos > 0 || noMeasure > 0) && (
            <>
              <div className="lab" style={{ paddingTop: 20 }}>
                Worth tidying
              </div>
              {drafts.length > 0 && (
                <Link className="taskrow" to="/admin/pieces?tab=draft">
                  <div>
                    <b>
                      {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
                    </b>
                    <em>Started but never published</em>
                  </div>
                  <Icon name="chev" size={16} />
                </Link>
              )}
              {noPhotos > 0 && (
                <Link className="taskrow" to="/admin/pieces">
                  <div>
                    <b>{noPhotos} live without photos</b>
                    <em>These show a drawing instead of the real piece</em>
                  </div>
                  <Icon name="chev" size={16} />
                </Link>
              )}
              {noMeasure > 0 && (
                <Link className="taskrow" to="/admin/pieces">
                  <div>
                    <b>{noMeasure} without measurements</b>
                    <em>Measurements are what prevent returns</em>
                  </div>
                  <Icon name="chev" size={16} />
                </Link>
              )}
            </>
          )}

          <div className="lab" style={{ paddingTop: 20 }}>
            Your shop
          </div>
          <Link className="taskrow" to="/admin/categories">
            <div>
              <b>{categories.length} categories</b>
              <em>{categories.map((c) => c.name).join(' · ')}</em>
            </div>
            <Icon name="chev" size={16} />
          </Link>
          <Link className="taskrow" to="/admin/settings">
            <div>
              <b>Shop settings</b>
              <em>
                Free shipping over {money(settings.freeShippingOver)} · {settings.holdMinutes} min hold
              </em>
            </div>
            <Icon name="chev" size={16} />
          </Link>
          <div className="spacer" />
        </div>
      </div>

      <div className="cta">
        <Link className="btn" to="/admin/pieces/new">
          <Icon name="plus" size={17} />
          List a piece
        </Link>
      </div>

      <AdminNav />
    </>
  )
}