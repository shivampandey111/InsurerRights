import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import DashBoard from './pages/DashBoard.jsx'
import Chat from './pages/Chat.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Auth from './components/Auth.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = '/' element = {<Auth/>} />
        <Route path='/login' element = {<Auth/>} />
        <Route path='/dashboard' element = {
          <ProtectedRoute><DashBoard/></ProtectedRoute>
        } />
        <Route path='chat/:doc_id' element = {
          <ProtectedRoute><Chat/></ProtectedRoute>
        } /> 
      </Routes>
    </BrowserRouter>
  )
}

export default App
