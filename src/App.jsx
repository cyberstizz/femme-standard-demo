import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from './store'
import { configError } from './lib/supabase'
import { SiteHeader, AdminSidebar } from './ui'

import Shop from './screens/Shop'
import Piece from './screens/Piece'
import Search from './screens/Search'
import Saved from './screens/Saved'
import Bag from './screens/Bag'
import Confirmed from './screens/Confirmed'
import Standard from './screens/Standard'
import Account from './screens/Account'
import SignIn from './screens/SignIn'

import AdminHome from './screens/AdminHome'
import AdminPieces from './screens/AdminPieces'
import AdminCategories from './screens/AdminCategories'
import AdminSettings from './screens/AdminSettings'
import AdminOrders from './screens/AdminOrders'
import ListPiece from './screens/ListPiece'
import Ship from './screens/Ship'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.querySelector('.view')?.scrollTo(0, 0)
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// One sign-in for everyone. If the signed-in profile is the owner, /admin opens;
// otherwise it bounces to sign-in and comes back here afterwards.
function RequireOwner({ children }) {
  const { isOwner } = useStore()
  const { pathname } = useLocation()
  return isOwner ? children : <Navigate to={`/signin?next=${encodeURIComponent(pathname)}`} replace />
}

function Banner() {
  const { error, clearError } = useStore()
  return (
    <div className="demo">
      <span>{error ? `Something went wrong: ${error}` : 'Demo · no payments are taken'}</span>
      {error && (
        <span style={{ display: 'flex', gap: 14, flex: '0 0 auto' }}>
          <button onClick={clearError}>Dismiss</button>
        </span>
      )}
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const { isOwner, loading } = useStore()
  const inAdmin = pathname.startsWith('/admin') && isOwner

  if (configError) {
    return (
      <div className="app">
        <div className="setup">
          <div className="k">Not configured</div>
          <h4>{configError}</h4>
          <p>
            Set both variables in <b>Netlify → Site configuration → Environment variables</b>, then
            redeploy. Vite reads them when the site is built, so an existing deploy won’t pick them
            up on its own.
          </p>
          <pre>
VITE_SUPABASE_URL=https://YOUR-REF.supabase.co{'\n'}VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
          </pre>
          <p className="hint">
            Both values: Supabase → your project → <b>Connect</b> → App Frameworks → React / Vite.
            Editing <code>.env.example</code> has no effect — it’s only a template.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="app">
        <div className="booting">Loading the shop…</div>
      </div>
    )
  }

  return (
    <div className={`app${inAdmin ? ' is-admin' : ''} has-demo`}>
      <Banner />
      {inAdmin ? <AdminSidebar /> : <SiteHeader />}
      <div className="main">
        <ScrollTop />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/piece/:id" element={<Piece />} />
          <Route path="/search" element={<Search />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/bag" element={<Bag />} />
          <Route path="/confirmed/:ref" element={<Confirmed />} />
          <Route path="/standard" element={<Standard />} />
          <Route path="/account" element={<Account />} />
          <Route path="/signin" element={<SignIn />} />

          <Route path="/admin" element={<RequireOwner><AdminHome /></RequireOwner>} />
          <Route path="/admin/pieces" element={<RequireOwner><AdminPieces /></RequireOwner>} />
          <Route path="/admin/pieces/new" element={<RequireOwner><ListPiece /></RequireOwner>} />
          <Route path="/admin/pieces/:id" element={<RequireOwner><ListPiece /></RequireOwner>} />
          <Route path="/admin/categories" element={<RequireOwner><AdminCategories /></RequireOwner>} />
          <Route path="/admin/orders" element={<RequireOwner><AdminOrders /></RequireOwner>} />
          <Route path="/admin/orders/:ref" element={<RequireOwner><Ship /></RequireOwner>} />
          <Route path="/admin/settings" element={<RequireOwner><AdminSettings /></RequireOwner>} />

          {/* older links */}
          <Route path="/admin/signin" element={<Navigate to="/signin?next=/admin" replace />} />
          <Route path="/owner/*" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}