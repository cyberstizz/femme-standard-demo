import { useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useStore, compressImage } from '../store'
import { Icon } from '../ui'
import { CONDITIONS } from '../data/pieces'

const blank = {
  title: '',
  categoryId: '',
  size: 'M',
  condition: 'Excellent',
  price: '',
  bust: '',
  waist: '',
  length: '',
  fabric: '',
  notes: '',
  photos: [],
}

export default function ListPiece() {
  const nav = useNavigate()
  const { id: routeId } = useParams()
  const { byId, savePiece, categories, deletePiece } = useStore()
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const editing = routeId ? byId(routeId) : null
  const [f, setF] = useState(() =>
    editing
      ? {
          ...blank,
          ...editing,
          price: editing.price || '',
          bust: editing.measurements?.bust ?? '',
          waist: editing.measurements?.waist ?? '',
          length: editing.measurements?.length ?? '',
          photos: editing.photos ?? [],
        }
      : { ...blank, categoryId: categories[0]?.id ?? '' },
  )

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const pickPhotos = async (e) => {
    const files = [...e.target.files].slice(0, 8 - f.photos.length)
    if (!files.length) return
    setBusy(true)
    try {
      const next = []
      for (const file of files) next.push(await compressImage(file))
      setF((cur) => ({ ...cur, photos: [...cur.photos, ...next] }))
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const removePhoto = (i) => setF({ ...f, photos: f.photos.filter((_, n) => n !== i) })

  const ready = f.title.trim() && f.price

  const publish = (status) => {
    const id = editing?.id ?? `fs-${Date.now().toString(36)}`
    savePiece({
      id,
      title: f.title.trim() || 'Untitled piece',
      categoryId: f.categoryId,
      size: f.size,
      condition: f.condition,
      price: Number(f.price) || 0,
      photos: f.photos,
      silhouette: editing?.silhouette ?? silhouetteFor(f.categoryId, categories),
      status,
      views: editing?.views ?? 0,
      saves: editing?.saves ?? 0,
      worn: editing?.worn ?? 'Worn once',
      fabric: f.fabric,
      notes: f.notes,
      measurements:
        f.bust || f.waist || f.length
          ? { ...(f.bust && { bust: f.bust }), ...(f.waist && { waist: f.waist }), ...(f.length && { length: f.length }) }
          : null,
    })
    nav('/admin/pieces')
  }

  const canAddMore = f.photos.length < 8

  return (
    <>
      <div className="appbar">
        <div className="title">{editing ? 'Edit piece' : 'List a piece'}</div>
        <button className="icons" style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '.14em' }} onClick={() => publish('draft')}>
          SAVE DRAFT
        </button>
      </div>

      <div className="view">
        <div className="form">
          <div className="field">
            <div className="lb">Photos · 4 recommended {busy && '· working…'}</div>
            <div className="photos">
              {f.photos.map((src, i) => (
                <div className="ph" key={i}>
                  <img src={src} alt="" />
                  {i === 0 && <div className="cov">Cover</div>}
                  <button className="rm" onClick={() => removePhoto(i)} aria-label="Remove photo">
                    ×
                  </button>
                </div>
              ))}
              {canAddMore && (
                <button className="ph add" onClick={() => fileRef.current?.click()} aria-label="Add photos">
                  <Icon name="plus" size={18} />
                </button>
              )}
            </div>
            {f.photos.length === 0 && (
              <p className="hint">Front, back, a close detail, and one on the mannequin.</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={pickPhotos}
              style={{ display: 'none' }}
            />
          </div>

          <div className="field">
            <div className="lb">Title</div>
            <input className="input" value={f.title} onChange={set('title')} placeholder="Black satin midi dress" />
          </div>

          <div className="two">
            <div className="field">
              <div className="lb">Size</div>
              <input className="input" value={f.size} onChange={set('size')} placeholder="M" />
            </div>
            <div className="field">
              <div className="lb">Condition</div>
              <select className="input done" value={f.condition} onChange={set('condition')}>
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="two">
            <div className="field">
              <div className="lb">Category</div>
              <select className="input" value={f.categoryId} onChange={set('categoryId')}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <div className="lb">Price</div>
              <input
                className={`input${f.price ? ' done' : ''}`}
                value={f.price}
                onChange={set('price')}
                inputMode="decimal"
                placeholder="$"
              />
            </div>
          </div>

          <div className="field">
            <div className="lb">Measurements laid flat</div>
            <div className="three">
              <input className="input" value={f.bust} onChange={set('bust')} placeholder="Bust" />
              <input className="input" value={f.waist} onChange={set('waist')} placeholder="Waist" />
              <input className="input" value={f.length} onChange={set('length')} placeholder="Length" />
            </div>
          </div>

          <div className="field">
            <div className="lb">Fabric</div>
            <input className="input" value={f.fabric} onChange={set('fabric')} placeholder="Satin · fully lined" />
          </div>

          <div className="field">
            <div className="lb">Condition notes</div>
            <textarea
              className="input"
              rows="3"
              value={f.notes}
              onChange={set('notes')}
              placeholder="Anything a buyer should know — marks, pulls, softening."
            />
          </div>

          <p className="note">One of one is set automatically. Every piece publishes as a single quantity.</p>
        </div>
      </div>

      <div className="cta">
        <Link className="btn quiet narrow" to="/admin/pieces">
          Cancel
        </Link>
        <button className="btn" disabled={!ready} onClick={() => publish('live')}>
          Publish
        </button>
      </div>
    </>
  )
}

// The stand-in drawing comes from whichever category the piece is filed under,
// so adding a new category automatically gives its pieces the right placeholder.
function silhouetteFor(categoryId, categories) {
  return categories.find((c) => c.id === categoryId)?.silhouette ?? 'dress'
}