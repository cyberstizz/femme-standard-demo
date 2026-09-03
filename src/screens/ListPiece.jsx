import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useStore } from '../store'
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
        }
      : { ...blank, categoryId: categories[0]?.id ?? '' },
  )

  // Photos already in Storage, plus files chosen but not uploaded yet.
  const [saved, setSaved] = useState(() =>
    (editing?.photos ?? []).map((url, i) => ({ url, path: editing.photoPaths?.[i] })),
  )
  const [added, setAdded] = useState([])
  const [removePaths, setRemovePaths] = useState([])

  useEffect(() => () => added.forEach((a) => URL.revokeObjectURL(a.url)), [added])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const pickPhotos = (e) => {
    const files = [...e.target.files].slice(0, 8 - saved.length - added.length)
    setAdded((cur) => [...cur, ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))])
    e.target.value = ''
  }

  const removeSaved = (path) => {
    setRemovePaths((r) => [...r, path])
    setSaved((s) => s.filter((p) => p.path !== path))
  }
  const removeAdded = (i) => setAdded((a) => a.filter((_, n) => n !== i))

  const ready = f.title.trim() && f.price && !busy
  const canAddMore = saved.length + added.length < 8

  const publish = async (status) => {
    setBusy(true)
    try {
      await savePiece(
        {
          id: editing?.id,
          title: f.title.trim() || 'Untitled piece',
          categoryId: f.categoryId || null,
          size: f.size,
          condition: f.condition,
          price: Number(f.price) || 0,
          status,
          silhouette: silhouetteFor(f.categoryId, categories),
          worn: editing?.worn ?? 'Worn once',
          fabric: f.fabric,
          notes: f.notes,
          measurements:
            f.bust || f.waist || f.length
              ? {
                  ...(f.bust && { bust: f.bust }),
                  ...(f.waist && { waist: f.waist }),
                  ...(f.length && { length: f.length }),
                }
              : null,
        },
        added.map((a) => a.file),
        removePaths,
      )
      nav('/admin/pieces')
    } catch {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!editing) return
    setBusy(true)
    try {
      await deletePiece(editing.id)
      nav('/admin/pieces')
    } catch {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="appbar">
        <div className="title">{editing ? 'Edit piece' : 'List a piece'}</div>
        <button className="linkout" style={{ color: 'var(--muted)' }} onClick={() => publish('draft')} disabled={busy}>
          Save draft
        </button>
      </div>

      <div className="view">
        <div className="form">
          <div className="field">
            <div className="lb">
              Photos · 4 recommended{busy && ' · uploading…'}
            </div>
            <div className="photos">
              {saved.map((p, i) => (
                <div className="ph" key={p.path ?? i}>
                  <img src={p.url} alt="" />
                  {i === 0 && <div className="cov">Cover</div>}
                  <button className="rm" onClick={() => removeSaved(p.path)} aria-label="Remove photo">
                    ×
                  </button>
                </div>
              ))}
              {added.map((a, i) => (
                <div className="ph" key={`new-${i}`}>
                  <img src={a.url} alt="" />
                  {saved.length === 0 && i === 0 && <div className="cov">Cover</div>}
                  <button className="rm" onClick={() => removeAdded(i)} aria-label="Remove photo">
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
            {saved.length + added.length === 0 && (
              <p className="hint">Front, back, a close detail, and one on the mannequin.</p>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={pickPhotos} style={{ display: 'none' }} />
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
              <select className="input" value={f.categoryId ?? ''} onChange={set('categoryId')}>
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

          {editing && (
            <button className="linkbtn" style={{ marginTop: 20, color: '#E0A0A0' }} onClick={remove} disabled={busy}>
              Delete this piece
            </button>
          )}
        </div>
      </div>

      <div className="cta">
        <Link className="btn quiet narrow" to="/admin/pieces">
          Cancel
        </Link>
        <button className="btn" disabled={!ready} onClick={() => publish('live')}>
          {busy ? 'Saving…' : 'Publish'}
        </button>
      </div>
    </>
  )
}

// The stand-in drawing comes from the category, so a new category automatically
// gives its pieces the right placeholder until real photos are added.
function silhouetteFor(categoryId, categories) {
  return categories.find((c) => c.id === categoryId)?.silhouette ?? 'dress'
}