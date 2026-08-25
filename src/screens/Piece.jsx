import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore, money } from '../store'
import { Icon, Shot, Empty } from '../ui'

export default function Piece() {
  const { id } = useParams()
  const nav = useNavigate()
  const { byId, addToBag, inBag, isSaved, toggleSaved, settings } = useStore()
  const [shot, setShot] = useState(0)

  const piece = byId(id)
  if (!piece) return <Empty title="Piece not found" body="It may have sold and been removed." action="Back to shop" to="/" />

  const sold = piece.status === 'sold'
  const held = inBag(piece.id)
  const saved = isSaved(piece.id)
  const photos = piece.photos?.length ? piece.photos : [null]
  const m = piece.measurements

  return (
    <>
      <div className="view">
        <div className="hero">
          {piece.photos?.length ? (
            <img src={piece.photos[shot]} alt={piece.title} />
          ) : (
            <Shot piece={piece} />
          )}
          <button className="back" onClick={() => nav(-1)} aria-label="Back">
            <Icon name="back" />
          </button>
          {!sold && <div className="oneof">One of one</div>}
          <button
            className={`fav${saved ? ' on' : ''}`}
            onClick={() => toggleSaved(piece.id)}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from saved' : 'Save this piece'}
          >
            <Icon name={saved ? 'heartFill' : 'heart'} />
          </button>
          {photos.length > 1 && (
            <div className="dots">
              {photos.map((_, i) => (
                <i key={i} className={i === shot ? 'on' : undefined} onClick={() => setShot(i)} />
              ))}
            </div>
          )}
        </div>

        <div className="detail">
          <div className="d-name">{piece.title}</div>
          <div className="d-price">{money(piece.price)}</div>
          <div className="d-ship">Free shipping · Ships from {settings.shipFrom} in 1–2 days</div>

          <div className="rule" />
          <div className="factbar">
            <div className="fact">
              <b>{piece.size}</b>
              <span>Size</span>
            </div>
            <div className="fact gold">
              <b>{piece.condition}</b>
              <span>Condition</span>
            </div>
            <div className="fact">
              <b>{piece.worn}</b>
              <span>History</span>
            </div>
          </div>

          {m && (
            <>
              <div className="rule" />
              <div className="lab">Measurements laid flat</div>
              <div className="specs">
                {Object.entries(m).map(([k, v]) => (
                  <div key={k}>
                    <span style={{ textTransform: 'capitalize' }}>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
                {piece.fabric && (
                  <div>
                    <span>Fabric</span>
                    <b>{piece.fabric}</b>
                  </div>
                )}
              </div>
            </>
          )}

          {piece.notes && (
            <>
              <div className="rule" />
              <div className="lab">Condition notes</div>
              <p className="desc">{piece.notes}</p>
            </>
          )}

          <div className="rule" />
          <p className="note">
            This piece is one of one. Nothing here is restocked — when it sells, it comes off the shop for good.
          </p>
        </div>
      </div>

      <div className="cta">
        {sold ? (
          <Link to="/" className="btn off" style={{ pointerEvents: 'none' }}>
            Sold
          </Link>
        ) : held ? (
          <Link to="/bag" className="btn">
            In your bag · view
          </Link>
        ) : (
          <button className="btn" onClick={() => { addToBag(piece.id); nav('/bag') }}>
            Add to bag · holds {settings.holdMinutes} min
          </button>
        )}
        <button
          className="btn ghost"
          onClick={() => toggleSaved(piece.id)}
          aria-label={saved ? 'Remove from saved' : 'Save this piece'}
        >
          <Icon name={saved ? 'heartFill' : 'heart'} />
        </button>
      </div>
    </>
  )
}