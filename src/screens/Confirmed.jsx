import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '../store'
import { Icon } from '../ui'

export default function Confirmed() {
  const { ref } = useParams()
  const { orders, refresh } = useStore()

  // Coming back from Stripe, the webhook may have landed moments ago.
  useEffect(() => {
    refresh()
    const t = setTimeout(refresh, 2500)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const order = orders.find((o) => String(o.ref) === String(ref))

  return (
    <>
      <div className="view">
        <div className="confirm">
          <div className="seal">
            <Icon name="check" size={26} />
          </div>
          <h4>It's yours</h4>
          <p>
            {order ? (order.ids.length === 1 ? 'Your piece is' : 'Your pieces are') : 'Your order is'} off the shop for
            good. Latavia packs and ships from Miami — tracking arrives by text within a day.
          </p>
          <div className="ord">Order #{ref}</div>
        </div>
      </div>
      <div className="cta">
        <Link className="btn quiet narrow" to="/account">
          Orders
        </Link>
        <Link className="btn" to="/">
          Keep shopping
        </Link>
      </div>
    </>
  )
}