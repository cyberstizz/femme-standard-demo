import { useStore } from '../store'
import { Tile, TabBar, Empty } from '../ui'

export default function Saved() {
  const { pieces, saved } = useStore()
  const list = pieces.filter((p) => saved.includes(p.id))

  return (
    <>
      <div className="appbar">
        <div className="title">Saved</div>
        <div className="icons" style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '.1em' }}>
          {list.length} {list.length === 1 ? 'PIECE' : 'PIECES'}
        </div>
      </div>

      <div className="view">
        {list.length === 0 ? (
          <Empty
            title="Nothing saved yet"
            body="Tap the heart on any piece and it lands here. Saved pieces warn you before they sell."
            action="Browse the shop"
            to="/"
          />
        ) : (
          <div className="grid">
            {list.map((p) => (
              <Tile key={p.id} piece={p} />
            ))}
          </div>
        )}
      </div>

      <TabBar />
    </>
  )
}
