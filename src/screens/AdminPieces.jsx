import { useSearchParams, Link } from 'react-router-dom'
import { useStore, money } from '../store'
import { Icon, Shot, AdminNav } from '../ui'

const TABS = [
  { key: 'live', label: 'Live' },
  { key: 'sold', label: 'Sold' },
  { key: 'draft', label: 'Drafts' },
]

export default function AdminPieces() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'live'
  const { pieces, categoryName } = useStore()

  const shown = pieces.filter((p) => p.status === tab)

  return (
    <>
      <div className="appbar">
        <div className="title">Pieces</div>
        <Link to="/admin/pieces/new" className="linkout">
          + New
        </Link>
      </div>

      <div className="pills">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`pill${tab === t.key ? ' on' : ''}`}
            onClick={() => setParams({ tab: t.key })}
          >
            {t.label} {pieces.filter((p) => p.status === t.key).length}
          </button>
        ))}
      </div>

      <div className="view">
        <div className="pad">
          {shown.length === 0 ? (
            <div className="empty">
              <h5>Nothing here</h5>
              <p>
                {tab === 'draft'
                  ? 'Drafts are pieces you started but never priced or published.'
                  : tab === 'sold'
                    ? 'Sold pieces will collect here.'
                    : 'Tap New to list your first piece.'}
              </p>
            </div>
          ) : (
            shown.map((p) => (
              <Link key={p.id} className="orow" to={`/admin/pieces/${p.id}`}>
                <div className="th">
                  <Shot piece={p} />
                </div>
                <div className="m">
                  <b>{p.title}</b>
                  <em>
                    {categoryName(p.categoryId)} · {p.size === 'One size' ? 'One size' : `Size ${p.size}`} ·{' '}
                    {p.condition}
                  </em>
                  <span className={`tagp${p.status === 'live' ? ' live' : p.status === 'sold' ? ' sold' : ''}`}>
                    {p.status === 'live'
                      ? `${p.views} views · ${p.saves} saves`
                      : p.status === 'sold'
                        ? `Sold in ${p.soldInDays || 1}d`
                        : 'No price yet'}
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

      <AdminNav />
    </>
  )
}