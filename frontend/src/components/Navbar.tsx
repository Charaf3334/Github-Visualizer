import { useNavigate } from 'react-router-dom'

const Navbar = () => {

  const navigate = useNavigate()

  return (
    <nav className="kadwa-regular px-8 py-4 flex justify-around items-center">
      <span className="text-3xl font-bold text-white tracking-wide hover:text-white/90 transition-colors duration-500 ease-out transform cursor-pointer"
      onClick={() => navigate('/home')}>
        Git Visualizer
      </span>
      <button className="text-white text-lg border border-white/30 rounded-xl px-5 py-2 hover:bg-white/15 transition-all duration-300 cursor-pointer"
      onClick={() => window.open('https://github.com/Charaf3334/Github-Visualizer', '_blank')}>
        See Repository
      </button>
    </nav>
  )
}

export default Navbar
