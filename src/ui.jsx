import { NavLink, Link } from 'react-router-dom'
import { useStore, money } from './store'

/* ---------------- icons ---------------- */
const PATHS = {
  home: <path d="M3.5 11 L12 4 L20.5 11 V20 H3.5 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 16 L21 21" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </>
  ),
  heart: <path d="M12 20 C4 15 3 10 6 7.5 C8.5 5.4 11 7 12 8.7 C13 7 15.5 5.4 18 7.5 C21 10 20 15 12 20 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  heartFill: <path d="M12 20 C4 15 3 10 6 7.5 C8.5 5.4 11 7 12 8.7 C13 7 15.5 5.4 18 7.5 C21 10 20 15 12 20 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  bag: (
    <>
      <path d="M5 8 H19 L20 20 H4 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 8 V6.2 A3 3 0 0 1 15 6.2 V8" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 20 C5 15.6 8.2 13.5 12 13.5 C15.8 13.5 19 15.6 19 20" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  back: <path d="M15 4 L7 12 L15 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  filter: <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />,
  plus: <path d="M12 5 V19 M5 12 H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />,
  box: (
    <>
      <path d="M4 8 L12 4 L20 8 V17 L12 21 L4 17 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4 8 L12 12 L20 8 M12 12 V21" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  chart: <path d="M4 20 V12 M10 20 V5 M16 20 V9 M22 20 H3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />,
  check: <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
}

export function Icon({ name, size = 20, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      {PATHS[name]}
    </svg>
  )
}

/* ---------------- garment silhouettes ---------------- */
const SILS = {
  dress: 'M35 8 L50 20 L65 8 L74 16 L64 34 L72 118 L28 118 L36 34 L26 16 Z',
  blazer: 'M30 10 L50 22 L70 10 L86 22 L80 110 L20 110 L14 22 Z',
  top: 'M32 16 L50 26 L68 16 L84 30 L76 46 L70 42 L70 96 L30 96 L30 42 L24 46 L16 30 Z',
  pants: 'M28 12 L72 12 L70 60 L66 118 L54 118 L50 62 L46 118 L34 118 L30 60 Z',
  skirt: 'M30 20 L70 20 L82 112 L18 112 Z',
  bag: 'M22 46 H78 L84 112 H16 Z',
  heel: 'M18 76 C40 76 58 62 66 44 L80 44 L80 96 L18 96 Z',
}

export function Silhouette({ kind = 'dress', className = 'sil' }) {
  return (
    <svg className={className} viewBox="0 0 100 130" aria-hidden="true">
      <path d={SILS[kind] ?? SILS.dress} fill="none" stroke="#E8D7A6" strokeWidth="1.6" />
      {kind === 'bag' && <path d="M38 46 V32 A12 12 0 0 1 62 32 V46" fill="none" stroke="#E8D7A6" strokeWidth="1.6" />}
      {kind === 'heel' && <path d="M80 96 L80 116" fill="none" stroke="#E8D7A6" strokeWidth="1.6" />}
      {kind === 'blazer' && <path d="M30 10 L50 22 L70 10 M50 22 L50 110" fill="none" stroke="#E8D7A6" strokeWidth="1.2" />}
    </svg>
  )
}

/* ---------------- photo or placeholder ---------------- */
export function Shot({ piece, index = 0 }) {
  const src = piece.photos?.[index]
  if (src) return <img src={src} alt={piece.title} />
  return <Silhouette kind={piece.silhouette} />
}

/* ---------------- product tile ---------------- */
export function Tile({ piece }) {
  const { isSaved, toggleSaved } = useStore()
  const sold = piece.status === 'sold'
  const saved = isSaved(piece.id)

  return (
    <div className="tile">
      <div className="shot">
        <Link to={`/piece/${piece.id}`} className="shot-link" aria-label={piece.title}>
          <Shot piece={piece} />
        </Link>
        {sold ? (
          <div className="gone">Sold</div>
        ) : (
          <>
            <div className="flag">{piece.condition}</div>
            <button
              className={`fav${saved ? ' on' : ''}`}
              onClick={() => toggleSaved(piece.id)}
              aria-pressed={saved}
              aria-label={saved ? `Remove ${piece.title} from saved` : `Save ${piece.title}`}
            >
              <Icon name={saved ? 'heartFill' : 'heart'} size={18} />
            </button>
          </>
        )}
      </div>
      <Link to={`/piece/${piece.id}`} tabIndex={-1}>
        <div className={`t-price${sold ? ' dim' : ''}`}>{money(piece.price)}</div>
        <div className={`t-name${sold ? ' dim' : ''}`}>{piece.title}</div>
        <div className="t-meta">
          {piece.size === 'One size' ? 'One size' : `Size ${piece.size}`} ·{' '}
          {sold ? `Sold in ${piece.soldInDays || 1}d` : <i>1 only</i>}
        </div>
      </Link>
    </div>
  )
}

/* ---------------- bottom tabs ---------------- */
const TABS = [
  { to: '/', label: 'Shop', icon: 'home' },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/saved', label: 'Saved', icon: 'heart' },
  { to: '/bag', label: 'Bag', icon: 'bag' },
  { to: '/account', label: 'You', icon: 'user' },
]

export function TabBar() {
  const { bag } = useStore()
  return (
    <nav className="tabs">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => `tab${isActive ? ' on' : ''}`}>
          <span className={t.to === '/bag' && bag.length ? 'count' : undefined} style={{ position: 'relative' }}>
            <Icon name={t.icon} />
            {t.to === '/bag' && bag.length > 0 && <i style={badge}>{bag.length}</i>}
          </span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}

const badge = {
  position: 'absolute',
  top: -4,
  right: -8,
  background: 'var(--gold)',
  color: '#0A0A0A',
  fontSize: 9,
  fontStyle: 'normal',
  fontWeight: 600,
  borderRadius: 100,
  minWidth: 15,
  height: 15,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 3px',
}

/* ---------------- empty state ---------------- */
export function Empty({ title, body, action, to }) {
  return (
    <div className="empty">
      <h5>{title}</h5>
      <p>{body}</p>
      {action && (
        <Link className="btn" to={to} style={{ marginTop: 24 }}>
          {action}
        </Link>
      )}
    </div>
  )
}
