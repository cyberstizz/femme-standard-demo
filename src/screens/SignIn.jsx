import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useStore } from '../store'

// One sign-in for everyone. Who you are is decided by your account, not by
// which door you came through — Latavia signs in here exactly like a shopper,
// and lands in Admin because her profile says so.
export const OWNER_EMAIL = 'latavia@thefemmestandard.com'

export default function SignIn() {
  const { signIn, signInOwner, settings } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')
  const wantsAdmin = next?.startsWith('/admin')
  const [email, setEmail] = useState('')
  const valid = email.includes('@')

  const go = () => {
    if (!valid) return
    if (email.trim().toLowerCase() === OWNER_EMAIL) {
      signInOwner()
      nav(next || '/admin', { replace: true })
    } else {
      signIn(email.trim())
      nav(next && !wantsAdmin ? next : '/account', { replace: true })
    }
  }

  return (
    <div className="view">
      <div className="gate">
        <div className="k">{settings.storeName}</div>
        <h4>{wantsAdmin ? 'Sign in to your shop' : 'Sign in'}</h4>
        <p>
          {wantsAdmin
            ? 'Use the email on your account. If it’s the shop owner’s, you’ll land in Admin.'
            : 'We email you a link — no password. An account keeps your size, your saved pieces, and your orders.'}
        </p>
        <input
          className="input"
          style={{ marginTop: 24 }}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          aria-label="Email address"
        />
        <button className="btn" style={{ marginTop: 14 }} disabled={!valid} onClick={go}>
          Email me a link
        </button>

        <div className="demo-hint">
          <b>Demo</b>
          Any address signs in as a shopper.
          <br />
          <button className="linkbtn" onClick={() => setEmail(OWNER_EMAIL)}>
            {OWNER_EMAIL}
          </button>{' '}
          signs in as the owner.
        </div>

        <Link to="/" className="linkout" style={{ display: 'inline-block', marginTop: 22 }}>
          Keep browsing
        </Link>
      </div>
    </div>
  )
}