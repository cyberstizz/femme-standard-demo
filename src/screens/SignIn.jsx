import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useStore } from '../store'

// One sign-in for everyone. Who you are is decided by your account, not by which
// door you came through — Latavia signs in here exactly like a shopper and lands
// in Admin because her profile says owner.
export default function SignIn() {
  const { signIn, signUp, settings, error, clearError } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')
  const wantsAdmin = next?.startsWith('/admin')

  const [mode, setMode] = useState('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const valid = email.includes('@') && password.length >= 6

  const go = async () => {
    if (!valid || busy) return
    setBusy(true)
    try {
      if (mode === 'in') await signIn(email.trim(), password)
      else await signUp(email.trim(), password)
      nav(next || '/', { replace: true })
    } catch {
      // the store surfaces the message below
    } finally {
      setBusy(false)
    }
  }

  const swap = (m) => {
    clearError()
    setMode(m)
  }

  return (
    <div className="view">
      <div className="gate">
        <div className="k">{settings.storeName}</div>
        <h4>{mode === 'in' ? (wantsAdmin ? 'Sign in to your shop' : 'Sign in') : 'Create an account'}</h4>
        <p>
          {mode === 'in'
            ? 'Your account keeps your size, your saved pieces, and your orders.'
            : 'Pick any password of six characters or more. Nothing is emailed to you.'}
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
          aria-label="Email address"
        />
        <input
          className="input"
          style={{ marginTop: 12 }}
          type="password"
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          aria-label="Password"
        />

        {error && <div className="formerror">{error}</div>}

        <button className="btn" style={{ marginTop: 14 }} disabled={!valid || busy} onClick={go}>
          {busy ? 'One moment…' : mode === 'in' ? 'Sign in' : 'Create account'}
        </button>

        <button className="linkbtn" style={{ marginTop: 18 }} onClick={() => swap(mode === 'in' ? 'up' : 'in')}>
          {mode === 'in' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>

        <Link to="/" className="linkout" style={{ display: 'block', marginTop: 22 }}>
          Keep browsing
        </Link>
      </div>
    </div>
  )
}