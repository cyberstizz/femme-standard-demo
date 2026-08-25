import { useState } from 'react'
import { useStore } from '../store'
import { Icon, Tile, TabBar } from '../ui'
import { CONDITIONS, SIZES } from '../data/pieces'

export default function Search() {
  const { pieces, mySize, setMySize, categories } = useStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [sizes, setSizes] = useState([mySize])
  const [conds, setConds] = useState([])
  const [cat, setCat] = useState('Any')
  const [hideSold, setHideSold] = useState(true)

  const toggle = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const results = pieces
    .filter((p) => p.status !== 'draft')
    .filter((p) => (hideSold ? p.status === 'live' : true))
    .filter((p) => (q ? (p.title + p.fabric).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((p) => (sizes.length ? sizes.includes(p.size) : true))
    .filter((p) => (conds.length ? conds.includes(p.condition) : true))
    .filter((p) => (cat === 'Any' ? true : p.categoryId === cat))

  const clear = () => { setSizes([]); setConds([]); setCat('Any'); setHideSold(true) }

  return (
    <>
      <div className="appbar">
        <div className="title">Search</div>
        <button className="icons" onClick={() => setOpen(true)} aria-label="Filters">
          <Icon name="filter" />
        </button>
      </div>

      <div className="searchbar">
        <Icon name="search" size={16} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="satin, denim, tote…" aria-label="Search pieces" />
      </div>

      <div className="view" style={{ position: 'relative' }}>
        <div className="resultline">
          <span>{results.length} {results.length === 1 ? 'piece' : 'pieces'}</span>
          <span>Newest first</span>
        </div>

        {results.length === 0 ? (
          <div className="empty">
            <h5>No matches</h5>
            <p>Try widening the size or condition filters — with one of everything, the list moves fast.</p>
          </div>
        ) : (
          <div className="grid">
            {results.map((p) => (
              <Tile key={p.id} piece={p} />
            ))}
          </div>
        )}

        {open && (
          <>
            <div className="scrim" onClick={() => setOpen(false)} />
            <div className="sheet" role="dialog" aria-label="Filters">
              <div className="sheet-h">
                <h5>Filters</h5>
                <button onClick={clear}>Clear all</button>
              </div>

              <div className="sheet-scroll">
                <div className="frow bare">
                  <span>Size</span>
                  <em className="g">{sizes.length ? sizes.join(', ') : 'Any'}</em>
                </div>
                <div className="chips">
                  {SIZES.map((s) => (
                    <button key={s} className={`pill sm${sizes.includes(s) ? ' on' : ''}`} onClick={() => toggle(sizes, setSizes, s)}>
                      {s}
                    </button>
                  ))}
                </div>

                <div className="frow bare" style={{ marginTop: 16 }}>
                  <span>Condition</span>
                  <em>{conds.length ? `${conds.length} selected` : 'Any'}</em>
                </div>
                <div className="chips">
                  {CONDITIONS.map((c) => (
                    <button key={c} className={`pill sm${conds.includes(c) ? ' on' : ''}`} onClick={() => toggle(conds, setConds, c)}>
                      {c}
                    </button>
                  ))}
                </div>

                <div className="frow bare" style={{ marginTop: 16 }}>
                  <span>Category</span>
                  <em>{cat === 'Any' ? 'Any' : categories.find((c) => c.id === cat)?.name}</em>
                </div>
                <div className="chips">
                  {[{ id: 'Any', name: 'Any' }, ...categories].map((c) => (
                    <button key={c.id} className={`pill sm${cat === c.id ? ' on' : ''}`} onClick={() => setCat(c.id)}>
                      {c.name}
                    </button>
                  ))}
                </div>

                <button className="frow" style={{ width: '100%', marginTop: 16 }} onClick={() => setHideSold(!hideSold)}>
                  <span>Hide sold pieces</span>
                  <em className={hideSold ? 'g' : undefined}>{hideSold ? 'On' : 'Off'}</em>
                </button>

                <button
                  className="frow"
                  style={{ width: '100%' }}
                  onClick={() => sizes.length === 1 && setMySize(sizes[0])}
                >
                  <span>Save as my size</span>
                  <em className="g">{sizes.length === 1 ? `Set to ${sizes[0]}` : `Currently ${mySize}`}</em>
                </button>
              </div>

              <button className="btn" style={{ marginTop: 14 }} onClick={() => setOpen(false)}>
                Show {results.length} {results.length === 1 ? 'piece' : 'pieces'}
              </button>
            </div>
          </>
        )}
      </div>

      <TabBar />
    </>
  )
}