import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { motion } from 'motion/react'

const NotFound = () => {
  
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <motion.div className="lora-regular flex-1 flex flex-col items-center justify-center text-center gap-6 p-10 md:p-0"
        initial={{opacity:0, y:50}} animate={{opacity:1, y:0}} transition={{duration: 0.5}}>
        <h1 className="text-5xl md:text-6xl text-white lora-bold">404</h1>
        <p className="text-white text-lg md:text-xl">Are you lost? This page got deleted or it does not exist.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-transparent text-white border border-white/30 rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/15">
          Take Me Home
        </button>
      </motion.div>
    </div>
  )
}

export default NotFound
