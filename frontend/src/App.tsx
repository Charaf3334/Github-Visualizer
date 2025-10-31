import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Background from './components/Background'
import UserData from './pages/UserData'

const App = () => {
  return (
    <>
      <Background />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/user/:login' element={<UserData />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App