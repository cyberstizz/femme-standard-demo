import { useState } from 'react'
import { useStore } from '../store'
import { AdminNav } from '../ui'

export default function AdminSettings() {
  const { settings, updateSettings, signOut, changePassword, user } = useStore()
  const [pw, setPw] = useState('')
  const [pwDone, setPwDone] = useState(false)
  const set = (k) => (e) => updateSettings({ [k]: e.target.value })
  const setNum = (k) => (e) => updateSettings({ [k]: Number(e.target.value) || 0 })

  return (
    <>
      <div className="appbar">
        <div className="title">Settings</div>
        <span className="linkout" style={{ color: 'var(--muted)' }}>
          Saves as you type
        </span>
      </div>

      <div className="view">
        <div className="form">
          <div className="lab">Your shop</div>
          <div className="field">
            <div className="lb">Shop name</div>
            <input className="input" value={settings.storeName} onChange={set('storeName')} />
          </div>
          <div className="field">
            <div className="lb">Ships from</div>
            <input className="input" value={settings.shipFrom} onChange={set('shipFrom')} />
            <p className="hint">Shown on every piece as “Ships from {settings.shipFrom} in 1–2 days”.</p>
          </div>

          <div className="rule" />
          <div className="lab">Money</div>
          <div className="two">
            <div className="field">
              <div className="lb">Free shipping over</div>
              <input className="input" inputMode="decimal" value={settings.freeShippingOver} onChange={setNum('freeShippingOver')} />
            </div>
            <div className="field">
              <div className="lb">Tax rate %</div>
              <input
                className="input"
                inputMode="decimal"
                value={(settings.taxRate * 100).toFixed(1)}
                onChange={(e) => updateSettings({ taxRate: (Number(e.target.value) || 0) / 100 })}
              />
            </div>
          </div>
          <div className="field">
            <div className="lb">Hold a piece for (minutes)</div>
            <input className="input" inputMode="numeric" value={settings.holdMinutes} onChange={setNum('holdMinutes')} />
            <p className="hint">
              How long a piece stays reserved in someone's bag before it goes back on sale. Everything here is one of
              one, so this is what stops two people buying the same thing.
            </p>
          </div>

          <div className="rule" />
          <div className="lab">Your story page</div>
          <div className="field">
            <div className="lb">Small label above the headline</div>
            <input className="input" value={settings.storyEyebrow} onChange={set('storyEyebrow')} />
          </div>
          <div className="field">
            <div className="lb">Headline</div>
            <input className="input" value={settings.storyTitle} onChange={set('storyTitle')} />
          </div>
          <div className="field">
            <div className="lb">Your quote</div>
            <textarea className="input" rows="3" value={settings.quote} onChange={set('quote')} />
          </div>
          <div className="field">
            <div className="lb">Signed</div>
            <input className="input" value={settings.quoteBy} onChange={set('quoteBy')} />
          </div>
          <div className="field">
            <div className="lb">The rest of the page</div>
            <textarea className="input" rows="6" value={settings.storyBody} onChange={set('storyBody')} />
            <p className="hint">Leave a blank line between paragraphs.</p>
          </div>

          <div className="rule" />
          <div className="lab">Your sign-in</div>
          <div className="field">
            <div className="lb">Email</div>
            <input className="input" value={user?.email ?? ''} readOnly />
            <p className="hint">Changing the email is done in Supabase → Authentication → Users.</p>
          </div>
          <div className="field">
            <div className="lb">New password</div>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwDone(false) }}
            />
          </div>
          <button
            className="btn quiet"
            style={{ width: '100%' }}
            disabled={pw.length < 6}
            onClick={async () => { await changePassword(pw); setPw(''); setPwDone(true) }}
          >
            {pwDone ? 'Password changed' : 'Change password'}
          </button>

          <div className="rule" />
          <button className="btn quiet" onClick={signOut} style={{ width: '100%' }}>
            Sign out
          </button>
          <div className="spacer" />
        </div>
      </div>

      <AdminNav />
    </>
  )
}