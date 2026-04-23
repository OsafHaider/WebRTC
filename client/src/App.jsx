import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/home-page'
import { SocketProvider } from './context/socket'
import RoomPage from './pages/room-page'
import { PeerProvider } from './context/peer'

const App = () => {
  return (
    <div className='App'>
<SocketProvider>
<PeerProvider>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/room/:roomid' element={<RoomPage/>} />
    </Routes>
</PeerProvider>
</SocketProvider>
    </div>
  )
}

export default App