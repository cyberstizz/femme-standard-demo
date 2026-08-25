import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, Tile, TabBar } from '../ui'

export default function Shop() {
  const { pieces, bag, mySize, categories, settings } = useStore()
  const [filter, setFilter] = useState('All')

  const visible = pieces
    .filter((p) => p.status !== 'draft')
    .filter((p) => {
      if (filter === 'All') return true
      if (filter === 'My size') return p.size === mySize && p.status === 'live'
      return p.categoryId === filter
    })

  const liveCount = pieces.filter((p) => p.status === 'live').length

  return (
    <>
      <div className="appbar">
        <div className="logo">
          {settings.storeName.replace(/^The /, '')}
        </div>
        <div className="icons">
          <Link to="/saved" aria-label="Saved">
            <Icon name="heart" />
          </Link>
          <Link to="/bag" aria-label="Bag" style={{ position: 'relative' }}>
            <Icon name="bag" />
            {bag.length > 0 && <i className="tally">{bag.length}</i>}
          </Link>
        </div>
      </div>

      <Link to="/search" className="searchbar">
        <Icon name="search" size={16} />
        Search dresses, denim, bags
      </Link>

      <div className="pills">
        {[{ id: 'All', name: 'All' }, { id: 'My size', name: 'My size' }, ...categories].map((c) => (
          <button key={c.id} className={`pill${filter === c.id ? ' on' : ''}`} onClick={() => setFilter(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="strip">
        <div className="l">One of one</div>
        <div className="r">
          {liveCount} <span>live now</span>
        </div>
      </div>

      <div className="view">
        {visible.length === 0 ? (
          <div className="empty">
            <h5>Nothing here yet</h5>
            <p>No pieces match that filter right now. New pieces land as Latavia lists them.</p>
          </div>
        ) : (
          <div className="grid">
            {visible.map((p) => (
              <Tile key={p.id} piece={p} />
            ))}
          </div>
        )}
        <Link to="/standard" className="storylink">
          Read the Standard
        </Link>
      </div>

      <TabBar />
    </>
  )
}