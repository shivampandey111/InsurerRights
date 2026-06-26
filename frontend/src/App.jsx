import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import DashBoard from './pages/DashBoard.jsx'
import Chat from './pages/Chat.jsx'
import Landing from './pages/LandingPage.jsx'
import GlobalChat from './pages/GlobalChat.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PrimaryDashBoard from './pages/PrimaryDashBoard.jsx'
import Auth from './components/Auth.jsx'
import { useState } from 'react'
import Sidebar from './pages/SideBar.jsx'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path = '/' element = {<Landing/>} />
        <Route path='/login' element = {<Auth/>} />
        <Route path='/dashboard' element = {
          <ProtectedRoute>
            <DashBoard/>
          </ProtectedRoute>

        }>
          <Route index element={<PrimaryDashBoard/>} />
          <Route path='assistant' element={<GlobalChat/>}/>
        </Route>
        <Route path='chat/:doc_id' element = {
          <ProtectedRoute><Chat/></ProtectedRoute>
        } /> 
      </Routes>
    </BrowserRouter>
  )
}

export default App
