import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useStore } from '../store'

export default function SignIn() {
  const { signIn, settings } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') ?? '/account'
  const [email, setEmail] = useState('')

  const go = () => {
    if (!email.includes('@')) return
    signIn(email)
    nav(next, { replace: true })
  }

  return (
    <div className="view">
      <div className="gate">
        <div className="k">{settings.storeName}</div>
        <h4>Sign in to buy</h4>
        <p>
          An account keeps your size, your saved pieces, and your order history. We'll email you a link — no password to
          remember.
        </p>
        <input
          className="input"
          style={{ marginTop: 24 }}
          type="email"
          inputMode="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          aria-label="Email address"
        />
        <button className="btn" style={{ marginTop: 14 }} disabled={!email.includes('@')} onClick={go}>
          Email me a link
        </button>
        <p className="hint" style={{ marginTop: 16 }}>
          Demo — any address signs you straight in.
        </p>
        <Link to="/" className="linkout" style={{ display: 'inline-block', marginTop: 22 }}>
          Keep browsing
        </Link>
      </div>
    </div>
  )
}