import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useStore } from './store'

import Shop from './screens/Shop'
import Piece from './screens/Piece'
import Search from './screens/Search'
import Saved from './screens/Saved'
import Bag from './screens/Bag'
import Confirmed from './screens/Confirmed'
import Standard from './screens/Standard'
import Account from './screens/Account'
import Closet from './screens/Closet'
import ListPiece from './screens/ListPiece'
import Ship from './screens/Ship'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.querySelector('.view')?.scrollTo(0, 0)
  }, [pathname])
  return null
}

function DemoBar() {
  const { reset, quotaFull } = useStore()
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <div className="demo">
      <span>{quotaFull ? 'Storage full — photos held for this session only' : 'Demo · sample data, no payments taken'}</span>
      <span style={{ display: 'flex', gap: 14, flex: '0 0 auto' }}>
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
        <Route path="/" element={<Shop />} />
        <Route path="/piece/:id" element={<Piece />} />
        <Route path="/search" element={<Search />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/bag" element={<Bag />} />
        <Route path="/confirmed/:ref" element={<Confirmed />} />
        <Route path="/standard" element={<Standard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/owner" element={<Closet />} />
        <Route path="/owner/new" element={<ListPiece />} />
        <Route path="/owner/order/:ref" element={<Ship />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
