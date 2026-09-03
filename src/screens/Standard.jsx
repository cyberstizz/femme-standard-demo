import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Shot, TabBar } from '../ui'
import latavia from '../assets/latavia.jpg'

export default function Standard() {
  const { pieces, settings } = useStore()
  const live = pieces.filter((p) => p.status === 'live')
  const three = live.slice(0, 3)

  return (
    <>
      <div className="view">
        <div className="story-layout">
        <div className="st-hero">
          <img src={latavia} alt="Latavia, founder of The Femme Standard" />
          <div className="veil" />
          <div className="cap">
            <div className="k">{settings.storyEyebrow}</div>
            <h4>{settings.storyTitle}</h4>
          </div>
        </div>

        <div className="st-body">
          <blockquote className="pull">{settings.quote}</blockquote>
          <div className="attrib">{settings.quoteBy}</div>

          {settings.storyBody.split(/\n\s*\n/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}

          <div className="mini">
            {three.map((p) => (
              <Link key={p.id} to={`/piece/${p.id}`}>
                <Shot piece={p} />
              </Link>
            ))}
          </div>
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