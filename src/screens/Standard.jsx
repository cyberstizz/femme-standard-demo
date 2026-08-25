import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Shot, TabBar } from '../ui'
import latavia from '../assets/latavia.jpg'

export default function Standard() {
  const { pieces } = useStore()
  const live = pieces.filter((p) => p.status === 'live')
  const three = live.slice(0, 3)

  return (
    <>
      <div className="view">
        <div className="st-hero">
          <img src={latavia} alt="Latavia, founder of The Femme Standard" style={{width: "100vw"}} />
          <div className="veil" />
          <div className="cap">
            <div className="k">The Standard</div>
            <h4>
              Pieces that still deserve their <em>moment</em>
            </h4>
          </div>
        </div>

        <div className="st-body">
          <blockquote className="pull">
            I believe fashion should empower you to show up fully as yourself — without excess, without compromise.
          </blockquote>
          <div className="attrib">Latavia · Founder</div>

          <p>
            Every piece here is slightly worn, high quality, and one of one. Nothing is restocked. When it's gone, it's
            gone.
          </p>
          <p>
            Each one is measured flat and photographed as it is, marks and all. You should know exactly what's arriving
            before you buy it.
          </p>

          <div className="mini">
            {three.map((p) => (
              <Link key={p.id} to={`/piece/${p.id}`}>
                <Shot piece={p} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="cta">
        <Link className="btn" to="/">
          Shop all {live.length} pieces
        </Link>
      </div>
    </>
  )
}
