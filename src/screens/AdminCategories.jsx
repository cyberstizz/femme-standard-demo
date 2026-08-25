import { useState } from 'react'
import { useStore } from '../store'
import { Icon, Silhouette, AdminNav } from '../ui'
import { SILHOUETTES } from '../data/pieces'

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory, moveCategory, countIn } = useStore()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSil, setNewSil] = useState('dress')
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)

  const add = () => {
    if (!newName.trim()) return
    addCategory(newName.trim(), newSil)
    setNewName('')
    setNewSil('dress')
    setAdding(false)
  }

  return (
    <>
      <div className="appbar">
        <div className="title">Categories</div>
        <button className="linkout" onClick={() => setAdding(true)}>
          + New
        </button>
      </div>

      <div className="view">
        <div className="pad">
          <p className="note" style={{ marginTop: 4 }}>
            These are the filters shoppers tap at the top of your shop, in this order. Rename one whenever you like —
            pieces stay where they are.
          </p>

          <div style={{ marginTop: 18 }}>
            {categories.map((c, i) => (
              <div className="catrow" key={c.id}>
                <div className="catico">
                  <Silhouette kind={c.silhouette} />
                </div>

                <div className="catmain">
                  {editing === c.id ? (
                    <>
                      <input
                        className="input"
                        autoFocus
                        value={c.name}
                        onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && setEditing(null)}
                        aria-label="Category name"
                      />
                      <div className="chips" style={{ marginTop: 10 }}>
                        {SILHOUETTES.map((s) => (
                          <button
                            key={s.id}
                            className={`pill sm${c.silhouette === s.id ? ' on' : ''}`}
                            onClick={() => updateCategory(c.id, { silhouette: s.id })}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <button className="donebtn" onClick={() => setEditing(null)}>
                        Done
                      </button>
                    </>
                  ) : (
                    <>
                      <b>{c.name}</b>
                      <em>
                        {countIn(c.id)} {countIn(c.id) === 1 ? 'piece' : 'pieces'}
                      </em>
                    </>
                  )}
                </div>

                {editing !== c.id && (
                  <div className="catacts">
                    <button onClick={() => moveCategory(c.id, -1)} disabled={i === 0} aria-label={`Move ${c.name} up`}>
                      ↑
                    </button>
                    <button
                      onClick={() => moveCategory(c.id, 1)}
                      disabled={i === categories.length - 1}
                      aria-label={`Move ${c.name} down`}
                    >
                      ↓
                    </button>
                    <button onClick={() => setEditing(c.id)} aria-label={`Rename ${c.name}`}>
                      Edit
                    </button>
                    <button
                      onClick={() => setRemoving(c)}
                      disabled={categories.length <= 1}
                      aria-label={`Delete ${c.name}`}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {adding && (
            <div className="catrow" style={{ borderColor: 'var(--gold)' }}>
              <div className="catico">
                <Silhouette kind={newSil} />
              </div>
              <div className="catmain">
                <input
                  className="input"
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && add()}
                  placeholder="Jewellery"
                  aria-label="New category name"
                />
                <div className="chips" style={{ marginTop: 10 }}>
                  {SILHOUETTES.map((s) => (
                    <button
                      key={s.id}
                      className={`pill sm${newSil === s.id ? ' on' : ''}`}
                      onClick={() => setNewSil(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="donebtn" onClick={add}>
                    Add category
                  </button>
                  <button className="donebtn quiet" onClick={() => setAdding(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="hint" style={{ marginTop: 16 }}>
            The drawing is only a stand-in — it shows on a piece until you add its photos.
          </p>
          <div className="spacer" />
        </div>
      </div>

      {removing && (
        <MoveThenDelete
          category={removing}
          categories={categories}
          count={countIn(removing.id)}
          onCancel={() => setRemoving(null)}
          onConfirm={(moveTo) => {
            deleteCategory(removing.id, moveTo)
            setRemoving(null)
          }}
        />
      )}

      <AdminNav />
    </>
  )
}

function MoveThenDelete({ category, categories, count, onCancel, onConfirm }) {
  const others = categories.filter((c) => c.id !== category.id)
  const [target, setTarget] = useState(others[0]?.id)

  return (
    <>
      <div className="scrim" onClick={onCancel} />
      <div className="modal" role="dialog" aria-label={`Delete ${category.name}`}>
        <h5>Delete “{category.name}”?</h5>
        {count > 0 ? (
          <>
            <p>
              {count} {count === 1 ? 'piece is' : 'pieces are'} in this category. Choose where {count === 1 ? 'it' : 'they'}{' '}
              should go — nothing is deleted.
            </p>
            <div className="chips" style={{ marginTop: 14 }}>
              {others.map((c) => (
                <button key={c.id} className={`pill sm${target === c.id ? ' on' : ''}`} onClick={() => setTarget(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p>Nothing is filed under it, so this only removes the filter from your shop.</p>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn quiet" onClick={onCancel}>
            Keep it
          </button>
          <button className="btn" onClick={() => onConfirm(target)}>
            {count > 0 ? 'Move & delete' : 'Delete'}
          </button>
        </div>
      </div>
    </>
  )
}