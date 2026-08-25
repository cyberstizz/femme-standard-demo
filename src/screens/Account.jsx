import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { TabBar } from '../ui'
import { SIZES } from '../data/pieces'

export default function Account() {
  const { saved, orders, mySize, setMySize, alerts, setAlerts, pieces } = useStore()
  const inTransit = orders.length
  const savedSelling = pieces.filter((p) => saved.includes(p.id) && p.saves > 10).length

  return (
    <>
      <div className="view">
        <div className="acct">
          <div className="avatar">JM</div>
          <h5>Jasmine M.</h5>
          <div className="sub">Member since 2025</div>
          <div className="tier">◆ First look · 24h early access</div>
        </div>

        <div className="stats">
          <div>
            <b>{7 + orders.length}</b>
            <span>Orders</span>
          </div>
          <div>
            <b>{saved.length}</b>
            <span>Saved</span>
          </div>
          <div>
            <b className="g">{mySize}</b>
            <span>Your size</span>
          </div>
        </div>

        <div className="lab" style={{ padding: '20px 18px 0' }}>
          Your size
        </div>
        <div className="sizepick">
          {SIZES.map((s) => (
            <button key={s} className={`sizebtn${mySize === s ? ' on' : ''}`} onClick={() => setMySize(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="menu">
          <Link className="mrow" to="/">
            Orders &amp; tracking <span>{inTransit ? `${inTransit} in transit` : 'None open'}</span>
          </Link>
          <Link className="mrow" to="/saved">
            Saved pieces <span className={savedSelling ? 'g' : undefined}>
              {savedSelling ? `${savedSelling} selling fast` : `${saved.length} saved`}
            </span>
          </Link>
          <button className="mrow" onClick={() => setAlerts(!alerts)}>
            Alert me in size {mySize} <span className={alerts ? 'g' : undefined}>{alerts ? 'On' : 'Off'}</span>
          </button>
          <Link className="mrow" to="/standard">
            About The Femme Standard <span>▸</span>
          </Link>
          <Link className="mrow" to="/owner">
            Owner view <span className="g">Latavia only</span>
          </Link>
        </div>
      </div>

      <TabBar />
    </>
  )
}
