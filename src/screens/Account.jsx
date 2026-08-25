import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { TabBar } from '../ui'
import { SIZES } from '../data/pieces'

const initials = (n) =>
  n.split(' ').slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('')

export default function Account() {
  const { saved, orders, mySize, setMySize, alerts, setAlerts, pieces, user, signOut, isOwner } = useStore()
  const inTransit = orders.length
  const savedSelling = pieces.filter((p) => saved.includes(p.id) && p.saves > 10).length

  return (
    <>
      <div className="view">
        <div className="acct">
          <div className="avatar">{user ? initials(user.name) : '—'}</div>
          <h5>{user ? user.name : 'Not signed in'}</h5>
          <div className="sub">{user ? user.email : 'Sign in to buy and save pieces'}</div>
          {user && <div className="tier">◆ First look · 24h early access</div>}
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
          {user ? (
            <button className="mrow" onClick={signOut}>
              Sign out <span>▸</span>
            </button>
          ) : (
            <Link className="mrow" to="/signin">
              Sign in <span className="g">Needed to buy</span>
            </Link>
          )}
          {isOwner && (
            <Link className="mrow" to="/admin">
              Shop admin <span className="g">Your shop</span>
            </Link>
          )}
        </div>
      </div>

      <TabBar />
    </>
  )
}