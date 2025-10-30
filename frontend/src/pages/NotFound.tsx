import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="kadwa-regular flex flex-col items-center justify-center text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 gap-6">
        <h1 className="text-6xl text-white kadwa-bold">404</h1>
        <p className="text-white text-xl">Are you lost? This page got deleted or it does not exist.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-transparent text-white border border-white/30 rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/15"
        >
          Take Me Home
        </button>
      </div>
    </div>
  );
}

export default NotFound;
