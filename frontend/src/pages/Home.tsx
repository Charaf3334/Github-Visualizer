import Navbar from '../components/Navbar'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Home = () => {

  const [username, setUsername] = useState('')
  const [isEmpty, setIsEmpty] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const onchangeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    setIsEmpty(false)
    setNotFound(false)
  }

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
          <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight">
            Visualize Your Github Account
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mt-2">
            Showcased stats and top projects together.
          </p>
          <div className={`flex w-full mt-15 border-2 ${isEmpty || notFound ? 'border-red-500' : 'border-white/30'} rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 shadow-2xl`}>
            <input
              type="text"
              value={username}
              onChange={onchangeHandle}
              placeholder="Enter your Github Username"
              className="flex-1 px-5 py-3 text-white text-base md:text-lg placeholder:text-gray-400 outline-none bg-transparent"
            />
            <button 
              className="px-5 py-3 bg-white/30 hover:bg-white/35 transition-colors duration-300 text-white flex items-center justify-center cursor-pointer"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading 
              ? (
                <svg className="animate-spin h-5 w-5 md:h-6 md:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              ) 
              : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                  />
                </svg>
              )}
            </button>
          </div>
          {notFound && (
            <div className="flex items-center gap-2 text-red-500 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-9-4a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm">This username doesn't exist, please enter a valid one.</p>
            </div>
          )}
          {isEmpty && (
            <div className="flex items-center gap-2 text-red-500 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-9-4a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm">Please enter your username.</p>
            </div>
          )}
        </div>
    </div>
  )
}

export default Home
