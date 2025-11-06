import Navbar from '../components/Navbar'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

interface User
{
  username: string,
  avatar: string
}

const Home = () => {

  const [username, setUsername] = useState('')
  const [isEmpty, setIsEmpty] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const [wait, setWait] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [users, setUsers] = useState<User[]>([])
  const navigate = useNavigate()
  
  const onchangeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    setIsEmpty(false)
    setNotFound(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')
      buttonRef.current?.click()
  }
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      try
      {
        const {data} = await axios.get(`${import.meta.env.VITE_BACK_URL}/history`)
        setUsers(data)
      }
      catch (err: unknown)
      {
        console.log(err)
      }
      setWait(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = async () => {
    if (username.trim() === '') 
    {
      setIsEmpty(true)
      return 
    }
    setIsEmpty(false)
    setLoading(true)
    try 
    {
      await new Promise(res => setTimeout(res, 1000))
      const {data} = await axios.get(`${import.meta.env.VITE_BACK_URL}/users`, {
        params: {username}
      })
      setNotFound(false)
      navigate(`/user/${data.login}`)
    }
    catch (err: unknown) 
    {
      if (axios.isAxiosError(err) && err.status === 404)
        setNotFound(true)
      else
        console.log(err)
    }
    finally 
    {
      setLoading(false)
    }
  }

  return (
  <div className="relative min-h-screen">
    <Navbar />
    <div className="kadwa-regular flex flex-col items-center justify-center text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 w-full max-w-2xl">
      {!wait 
      ? (
        <div className="flex justify-center mt-20">
          <Loader2 size={40} className="animate-spin text-white/10 mb-4" />
        </div>
      ) 
      : (
        <>
          <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight">
            Visualize Your Github Account
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mt-2">
            Your developer journey in one view. 
          </p>
          <div className={`flex w-full mt-15 border-2 ${isEmpty || notFound ? 'border-red-500' : 'border-white/30'} rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 shadow-2xl`}>
            <input
              type="text"
              value={username}
              onChange={onchangeHandle}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              placeholder="Enter your Github username"
              className="flex-1 px-5 py-3 text-white text-base md:text-lg placeholder:text-gray-400 outline-none bg-transparent"/>
              <button 
                className="px-5 py-3 bg-white/30 hover:bg-white/35 transition-colors duration-300 text-white flex items-center justify-center cursor-pointer"
                onClick={handleSearch}
                ref={buttonRef}
                disabled={loading}>
                {loading 
                ? (
                  <Loader2 className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" />
                ) 
                : (
                  <i className="bx bx-search text-white text-lg md:text-xl"></i>
                )}
              </button>
          </div>
          {notFound && (
            <div className="flex items-center gap-2 text-red-500 mt-2">
              <i className="bx bx-error text-red-500 text-sm md:text-base"></i>
              <p className="text-sm">This username doesn't exist, please enter a valid one.</p>
            </div>
          )}
          {isEmpty && (
            <div className="flex items-center gap-2 text-red-500 mt-2">
              <i className="bx bx-error text-red-500 text-sm md:text-base"></i>
              <p className="text-sm">Please enter your username.</p>
            </div>
          )}
          <div className="mt-10 w-full max-w-md bg-transparent rounded-xl p-4 backdrop-blur-xs border-3 border-white/10">
              <h2 className="text-white text-lg font-semibold mb-3">Recently searched</h2>
              <ul className="space-y-2">
                {users.map((u, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center px-3 py-2 bg-white/5 rounded-lg hover:bg-white/15 transition cursor-pointer"
                    onClick={() => navigate(`/user/${u.username}`)}>
                    <div className='flex items-center gap-2'>
                      <span className='w-8 h-8 rounded-full'>
                        <img src={u.avatar} alt="" className='w-8 h-8 rounded-full' />
                      </span>
                      <span className="text-white/90">@{u.username}</span>
                    </div>
                    <span className="text-gray-400 text-sm">#{i + 1}</span>
                  </li>
                ))}
              </ul>
            </div>
        </>
      )}
    </div>
  </div>
)
}

export default Home