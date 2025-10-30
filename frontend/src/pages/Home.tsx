import Navbar from '../components/Navbar'
import { useState } from 'react'

const Home = () => {

  const [username, setUsername] = useState('')
  const [isEmpty, setIsEmpty] = useState(false)

  const onchangeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    setIsEmpty(false)
  }

  const handleSearch = () => {
    if (username.trim() === '')
      setIsEmpty(true)
    else
      setIsEmpty(false)
    // send the username as a GET request to backend: /users/{username}
  }

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="kadwa-regular flex flex-col items-center justify-center text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 w-full max-w-2xl">
          <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight">
            Visualize Your Github Account
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mt-2">
            All your Github stats and top projects, made simple!
          </p>
          <div className={`flex w-full mt-15 border-2 ${isEmpty ? 'border-red-500' : 'border-white/30'} rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 shadow-2xl`}>
            <input
              type="text"
              value={username}
              onChange={onchangeHandle}
              placeholder="Enter your Github Username"
              className="flex-1 px-5 py-3 text-white text-base md:text-lg placeholder:text-gray-400 outline-none bg-transparent"
            />
            <button className="px-5 py-3 bg-white/30 hover:bg-white/35 transition-colors duration-300 text-white flex items-center justify-center cursor-pointer"
              onClick={handleSearch}
            >
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
            </button>
          </div>
          {isEmpty && (
            <div className="flex items-center gap-2 text-red-500 mt-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-9-4a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm">Please enter your username.</p>
            </div>
          )}
        </div>
    </div>
  )
}

export default Home