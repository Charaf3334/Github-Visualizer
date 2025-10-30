import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Background from './components/Background'

const App = () => {
  return (
    <>
      <Background />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App