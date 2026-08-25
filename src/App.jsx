import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useStore } from './store'

import Shop from './screens/Shop'
import Piece from './screens/Piece'
import Search from './screens/Search'
import Saved from './screens/Saved'
import Bag from './screens/Bag'
import Confirmed from './screens/Confirmed'
import Standard from './screens/Standard'
import Account from './screens/Account'
import SignIn from './screens/SignIn'

import AdminSignIn from './screens/AdminSignIn'
import AdminHome from './screens/AdminHome'
import AdminPieces from './screens/AdminPieces'
import AdminCategories from './screens/AdminCategories.jsx'
import AdminSettings from './screens/AdminSettings'
import AdminOrders from './screens/AdminOrders'
import ListPiece from './screens/ListPiece'
import Ship from './screens/Ship'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.querySelector('.view')?.scrollTo(0, 0)
  }, [pathname])
  return null
}

function RequireOwner({ children }) {
  const { isOwner } = useStore()
  return isOwner ? children : <Navigate to="/admin/signin" replace />
}

function DemoBar() {
  const { reset, quotaFull, isOwner } = useStore()
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <div className="demo">
      <span>{quotaFull ? 'Storage full — photos held for this session only' : 'Demo · sample data, no payments taken'}</span>
      <span style={{ display: 'flex', gap: 14, flex: '0 0 auto' }}>
        <Link to={isOwner ? '/admin' : '/admin/signin'}>Admin</Link>
        <Link to="/">Shop</Link>
        <button onClick={reset}>Reset</button>
        <button onClick={() => setHidden(true)}>Hide</button>
      </span>
    </div>
  )
}

export default function App() {
  return (
    <div className="app">
      <DemoBar />
      <ScrollTop />
      <Routes>
        {/* shopper */}
        <Route path="/" element={<Shop />} />
        <Route path="/piece/:id" element={<Piece />} />
        <Route path="/search" element={<Search />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/bag" element={<Bag />} />
        <Route path="/confirmed/:ref" element={<Confirmed />} />
        <Route path="/standard" element={<Standard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/signin" element={<SignIn />} />

        {/* admin */}
        <Route path="/admin/signin" element={<AdminSignIn />} />
        <Route path="/admin" element={<RequireOwner><AdminHome /></RequireOwner>} />
        <Route path="/admin/pieces" element={<RequireOwner><AdminPieces /></RequireOwner>} />
        <Route path="/admin/pieces/new" element={<RequireOwner><ListPiece /></RequireOwner>} />
        <Route path="/admin/pieces/:id" element={<RequireOwner><ListPiece /></RequireOwner>} />
        <Route path="/admin/categories" element={<RequireOwner><AdminCategories /></RequireOwner>} />
        <Route path="/admin/orders" element={<RequireOwner><AdminOrders /></RequireOwner>} />
        <Route path="/admin/orders/:ref" element={<RequireOwner><Ship /></RequireOwner>} />
        <Route path="/admin/settings" element={<RequireOwner><AdminSettings /></RequireOwner>} />

        {/* old owner paths */}
        <Route path="/owner/*" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}