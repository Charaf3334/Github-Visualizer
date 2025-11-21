import Navbar from '../components/Navbar'
import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'

interface User 
{
  username: string,
  avatar: string,
  score: number
}

interface LanguageOccur 
{
  lang: string,
  percentage: number
}

const Home = () => {
  const [usernameState, setUsername] = useState('')
  const navigate = useNavigate()
  const [isEmpty, setIsEmpty] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const [wait, setWait] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [users, setUsers] = useState<User[]>([])
  const [language, setLanguage] = useState<LanguageOccur[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<number | null>(null)
  const searchResultsRef = useRef<HTMLDivElement>(null)

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    setIsEmpty(false)
    setNotFound(false)
    if (searchTimeoutRef.current)
      clearTimeout(searchTimeoutRef.current)
    if (value.trim().length >= 3) 
    {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => await searchUsers(value), 300)
    } 
    else 
    {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node))
        setSearchResults([])
    }
    if (searchResults.length > 0)
      document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchResults])

  const searchUsers = async (query: string) => {
    query = query.trim().toLowerCase()
    if (!query) 
    {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    try 
    {
      const {data} = await axios.get(`${import.meta.env.VITE_BACK_URL}/search/users`, {params: {q: query}, headers: {'api-key': import.meta.env.VITE_API_KEY}})
      const users: User[] = data.map((user: User) => ({
          username: user.username,
          avatar: user.avatar,
          score: user.username.toLowerCase() === query ? 2 : user.username.toLowerCase().startsWith(query) ? 1 : 0})).sort((a: User, b: User) => b.score - a.score).slice(0, 5).map(({username, avatar}: User) => ({username, avatar}))
      setSearchResults(users)
    } 
    catch (error: unknown) 
    {
      setSearchResults([])
      console.log(error)
    } 
    finally 
    {
      setIsSearching(false)
    }
  }

  const handleUserSelect = (selectedUsername: string) => {
    setUsername(selectedUsername)
    setSearchResults([])
    handleSearch(selectedUsername)
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current)
        clearTimeout(searchTimeoutRef.current)
    }
  }, [])
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')
      buttonRef.current?.click()
  }
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      try 
      {
        const {data} = await axios.get(`${import.meta.env.VITE_BACK_URL}/history`, {headers: {'api-key': import.meta.env.VITE_API_KEY}})
        setUsers(data)
        const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/occurences`, {headers: {'api-key': import.meta.env.VITE_API_KEY}})
        setLanguage(res.data)
      } 
      catch (err: unknown) 
      {
        console.error(err)
      }
      setWait(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = async (selectedUsername?: string) => {
    const usernameToSearch = selectedUsername || usernameState
    if (notFound)
      return
    if (usernameToSearch.trim() === '') 
    {
      setIsEmpty(true)
      return 
    }
    setIsEmpty(false)
    setLoading(true)
    try 
    {
      const {data} = await axios.get(`${import.meta.env.VITE_BACK_URL}/users`, {params: {username: usernameToSearch}, headers: {'api-key': import.meta.env.VITE_API_KEY}})
      setNotFound(false)
      navigate(`/user/${data.login}`)
    } 
    catch (err: unknown) 
    {
      if (axios.isAxiosError(err) && err.status === 404)
        setNotFound(true)
      else
        console.error(err)
    } 
    finally 
    {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen">
    <Navbar />
    <div className="lora-regular flex flex-col items-center justify-center text-center px-5 py-16 md:py-0 w-full max-w-3xl mx-auto">
      {!wait 
      ? (
        <div className="flex justify-center mt-20">
          <Loader2 size={40} className="animate-spin text-white/10 mb-4" />
        </div>
      ) 
      : (
        <>
          <motion.h1 className="text-white text-[42px] md:text-6xl font-bold leading-tight" initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration: 0.7}}>
            Visualize Your <br/> Github Account
          </motion.h1>
          <motion.p className="text-gray-400 text-[15px] md:text-xl mt-2" initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration: 0.7}}>
            Your developer journey in one view. 
          </motion.p>
          <motion.div className={`flex w-full mt-8 md:mt-15 relative hover:shadow-xl transition-shadow duration-300 shadow-2xl`}
            initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration: 0.7}}>
            <input
              type="text"
              value={usernameState}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              placeholder="Enter your Github username"
              className={`flex-1 px-5 py-3 text-white text-sm md:text-lg placeholder:text-gray-400 outline-none bg-transparent border-t-2 border-l-2 border-b-2 ${isEmpty || notFound ? 'border-red-500' : 'border-white/30'} ${searchResults.length > 0 ? 'rounded-tl-xl' : 'rounded-l-xl'}`}/>
            <button 
              className={`px-5 py-3 bg-white/30 border-2 hover:bg-white/35 transition-colors duration-300 text-white flex items-center justify-center cursor-pointer ${isEmpty || notFound ? 'border-red-500' : 'border-white/15'} ${searchResults.length > 0 ? 'rounded-tr-xl' : 'rounded-r-xl'}`}
              onClick={() => handleSearch(usernameState)}
              ref={buttonRef}
              disabled={loading || isSearching}>
              {loading || isSearching ? (
                <Loader2 className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" />
              ) : (
                <i className="bx bx-search text-white text-sm md:text-xl"></i>
              )}
            </button>
            {searchResults.length > 0 && (
              <motion.div 
                className="absolute left-0 top-full w-full backdrop-blur-2xl z-20 border-2 border-white/30 border-t-0 rounded-b-xl shadow-2xl"
                ref={searchResultsRef}>
                <ul className="bg-transparent rounded-b-xl">
                  {searchResults.map((user, index) => {
                    return ((
                    <motion.li
                      key={user.username + "-" + index}
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      transition={{duration: 0.2, delay: index * 0.1}}
                      className="border-b border-white/10 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => handleUserSelect(user.username)}
                        className="cursor-pointer flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 transition-colors duration-200 text-left">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.png'
                            e.currentTarget.onerror = null
                          }}/>
                        <div className="flex-1">
                          <div className="text-white text-sm md:text-lg">{user.username}</div>
                          <div className="text-gray-400 text-xs md:text-sm">@{user.username}</div>
                        </div>
                      </button>
                    </motion.li>
                  ))})}
                </ul>
              </motion.div>
            )}
          </motion.div>
          {notFound && (
            <div className="flex items-center gap-2 text-red-500 mt-2">
              <div className='hidden md:flex'>
                <i className="bx bx-error text-red-500 text-sm md:text-base"></i>
              </div>
              <p className="text-sm">This username doesn't exist, please enter a valid one.</p>
            </div>
          )}
          {isEmpty && (
            <div className="flex items-center gap-2 text-red-500 mt-2">
              <div className='hidden md:flex'>
                <i className="bx bx-error text-red-500 text-sm md:text-base"></i>
              </div>
              <p className="text-sm">Please enter your username.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8 justify-items-center">
            <motion.div className="mt-10 w-full max-w-md bg-transparent rounded-xl p-4 backdrop-blur-xs border-3 border-white/10"
              initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration: 0.7}}>
              <h2 className="text-white text-lg font-semibold mb-3">Recently searched users</h2>
              <ul className="space-y-2">
                {users.map((u, i) => (
                  <motion.li
                    initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration: 1}}
                    key={i}
                    className="flex justify-between items-center px-3 py-2 bg-white/5 rounded-lg hover:bg-white/15 transition-colors duration-300 cursor-pointer">
                    <Link
                      to={`/user/${u.username}`}
                      className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar}
                          alt={u.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="text-white/90 text-left">
                            {u.username.length > 22 ? u.username.slice(0, 15) + '...' : u.username}
                          </span>
                          <span className="text-gray-400 text-xs text-left lora-italic">@{u.username}</span>
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm">#{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>  
            <motion.div className="mt-10 mb-20 w-full max-w-md bg-transparent rounded-xl p-4 backdrop-blur-xs border-3 border-white/10"
              initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration: 0.7}}>
              <h2 className="text-white text-lg font-semibold mb-3">Most loved languages</h2>
              <ul className="space-y-2">
                {language.map((language, i) => (
                  <motion.li
                    initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration: 1}}
                    key={i}
                    className="flex justify-between items-center px-3 py-2 bg-white/5 rounded-lg hover:bg-white/15 transition-colors duration-300 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <img
                          src={`/icons/${language.lang == 'C#' ? "CSharp" : language.lang}.png`}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.src = '/icons/default.png'
                          }}
                          className="w-6 h-6"
                        />
                        <div className="flex flex-col">
                          <span className="text-white/90 text-left">
                            {language.lang}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm">{language.percentage} %</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>  
          </div>
        </>
      )}
    </div>
  </div>
)
}

export default Home