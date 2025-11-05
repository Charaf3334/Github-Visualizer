import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()

  return (
    <nav className="kadwa-regular px-8 py-4 flex justify-around items-center">
      <span
        className="md:text-3xl text-[20px] font-bold text-white tracking-wide hover:text-white/90 transition-colors duration-500 ease-out transform cursor-pointer"
        onClick={() => navigate('/home')}>
        Git Visualizer
      </span>
      <button
        onClick={() => window.open('https://github.com/Charaf3334/Github-Visualizer', '_blank')}
        className="flex items-center gap-2 text-lg border rounded-xl px-5 py-2 text-white border-white/30 hover:bg-yellow-500/20 transition-all duration-300 cursor-pointer">
        <Star className="w-5 h-5 text-yellow-400" />
        Give a Star
      </button>
    </nav>
  )
}

export default Navbar