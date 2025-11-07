import { useParams, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { Loader2 } from 'lucide-react'
import NotFound from './NotFound'
import UserList from '../components/UserList'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import {Star, GitFork, Eye} from 'lucide-react'

interface Repo 
{
  name: string
  description: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string
  html_url: string
}

interface User 
{
  login: string
  avatar_url: string
  followers: number
  following: number
  public_repos: number
  bio?: string
  languages?: Record<string, number>
  all_stars?: number
  active_since?: string
}

interface LangData 
{
  name: string
  value: number
  percentage: number
}

const UserData = () => {
  const {login} = useParams<{login: string}>()
  const location = useLocation()
  const stateData = location.state as {userData?: User} | null
  const [user, setUser] = useState<User | null>(stateData?.userData || null)
  const [loading, setLoading] = useState(!stateData?.userData)
  const [notFound, setNotFound] = useState(false)
  const [languages, setLanguages] = useState<LangData[]>([])
  const [topRepos, setTopRepos] = useState<Repo[]>([])
  const [showList, setShowList] = useState<null | 'followers' | 'following'>(null)
  const [listUsers, setListUsers] = useState<User[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const COLORS = ['#e91e63', '#9c27b0', '#ff9800', '#4caf50', '#f44336', '#2196f3', '#ffc107', '#00bcd4']
  const languageColors: Record<string, string> = {
    "Python": "#4B8BBE",
    "JavaScript": "#F7DF1E",
    "TypeScript": "#3178C6",
    "Java": "#007396",
    "C": "#A8B9CC",
    "C++": "#00599C",
    "C#": "#178600",
    "Go": "#00ADD8",
    "Rust": "#D34516",
    "Ruby": "#CC342D",
    "PHP": "#777BB4",
    "Swift": "#FA7343",
    "Kotlin": "#0095D5",
    "R": "#165CAA",
    "Scala": "#DC322F",
    "Haskell": "#5E5086",
    "Elixir": "#6E4A7E",
    "Lua": "#000080",
    "Perl": "#0298C3",
    "Dart": "#0175C2",
    "Jupyter Notebook": "#f44336"
}

  useEffect(() => {
    if (!login) 
      return
    const fetchData = async () => {
      try 
      {
        const {data: u} = await axios.get<User>(`${import.meta.env.VITE_BACK_URL}/users`, {params: {username: login}, headers: {'api-key': import.meta.env.VITE_API_KEY}})
        setUser(u)
        setNotFound(false)
        if (u.languages) 
        {
          const total = Object.values(u.languages).reduce((a, b) => a + b, 0)
          const langs: LangData[] = Object.entries(u.languages)
            .map(([name, val]) => ({name, value: val, percentage: (val / total) * 100}))
            .sort((a, b) => b.value - a.value)
          setLanguages(langs)
        }
        const {data: repos} = await axios.get<Repo[]>(`${import.meta.env.VITE_BACK_URL}/users/${login}/repos`, {headers: {'api-key': import.meta.env.VITE_API_KEY}})
        setTopRepos(repos)
      } 
      catch 
      {
        setNotFound(true)
      } 
      finally 
      {
        setLoading(false)
      }
  }
  fetchData()
}, [login])

  const handleListOpen = async (type: 'followers' | 'following') => {
    if (!login) 
      return
    if (showList === type && listUsers.length > 0) 
      return
    setShowList(type)
    setLoadingList(true)
    
    try 
    {
      const {data} = await axios.get(`${import.meta.env.VITE_BACK_URL}/users/${login}/${type}`, {headers: {'api-key': import.meta.env.VITE_API_KEY}})
      setListUsers(data)
    } 
    catch 
    {
      setListUsers([])
    }
    finally {
      setLoadingList(false)
    }
}
  
  if (loading) 
  {
    return (
      <div className="min-h-screen text-white kadwa-regular">
        <Navbar />
        <div className="flex justify-center mt-20">
          <Loader2 size={40} className="animate-spin text-white/10 mb-4" />
        </div>
      </div>
    )
}
  if (notFound) 
  {
    return (
      <div>
        <NotFound />
      </div>
    )
}
  if (!user) 
    return null
  const maxBars = 8
  const displayedLangs = languages.length > maxBars ? languages.slice(0, maxBars) : languages
  const showSmallBars = languages.length < 3 ? true : false

  return (
    <div className="min-h-screen text-white kadwa-regular">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10 mt-6">
        <div className="bg-linear-to-br from-gray-500/10 to-purple-500/2 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl mb-8 flex flex-col md:flex-row items-center gap-6">
          <img src={user.avatar_url} alt={user.login} className="w-32 h-32 rounded-full border-4 border-white/20 shadow-lg" />
          <div className="flex-1 text-center md:text-left relative w-full">
            <div className="md:absolute md:top-0 md:right-0 mt-4 md:mt-0">
              <a
                href={`https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 inline-block border hover:bg-white/10 transition-colors text-white font-semibold px-4 py-2 rounded-lg text-xs">Visit Account
              </a>
            </div>
            <div className="md:inline-flex inline-block items-center gap-x-3">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{user.login}</h1>
              <span className="inline-flex items-center gap-x-1 px-3 py-1 bg-transparent text-green-700 rounded-full text-sm font-medium border mb-3">
                <span className="w-2 h-2 bg-green-700 rounded-full"></span>
                Est. {user.active_since}
              </span>
            </div>
            {user.bio && <p className="text-gray-300 text-md mb-4">{user.bio}</p>}
            <div className="flex flex-wrap gap-6 justify-center md:justify-start text-gray-300">
              <div
                onClick={() => handleListOpen('followers')}
                className="cursor-pointer hover:text-white transition">
                <span className="text-1xl font-bold text-white">{user.followers}</span> Followers
              </div>
              <div
                onClick={() => handleListOpen('following')}
                className="cursor-pointer hover:text-white transition">
                <span className="text-1xl font-bold text-white">{user.following}</span> Following
              </div>
              <div><span className="text-1xl font-bold text-white">{user.public_repos}</span> Repositories</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Languages</h2>
            {displayedLangs.length 
            ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayedLangs}
                    layout="vertical"
                    margin={{top: 5, right: 30, left: 10, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.6} />
                    <XAxis type="number" hide={showSmallBars} />
                    <YAxis dataKey="name" type="category" width={100} tick={{fill: '#aaa', fontSize: 14}} />
                    <Tooltip
                      contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px'}}
                      itemStyle={{color: '#fff'}}
                      formatter={(value: number) => {
                        const lang = displayedLangs.find(l => l.value === value)
                        return [`${lang?.percentage.toFixed(1)}%`, 'Percentage']
                    }}/>
                    <Bar dataKey="value" radius={[4, 4, 4, 4]} isAnimationActive={false} cursor="default">
                      {displayedLangs.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           ) 
           : <p className="text-gray-400 text-center py-12">No language data available</p>}
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl">
            <div className='flex flex-col md:flex-row text-center justify-between'>
              <h2 className="text-2xl font-bold mb-3 md:mb-6">Top Repositories</h2>
              <span className='kadwa-bold text-sm md:mt-2 mb-3'>Total stars: <span className='text-yellow-400'>{user.all_stars}</span></span>
            </div>
            {topRepos.length 
            ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {topRepos.map(repo => (
                  <a
                    key={repo.name}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/6">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">{repo.name}</h3>
                    {repo.description && <p className="text-gray-300 text-sm mb-3 line-clamp-2">{repo.description}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1"><Star size={16} className="text-yellow-400" /> {repo.stargazers_count}</div>
                      <div className="flex items-center gap-1"><GitFork size={16} className="text-blue-400" /> {repo.forks_count}</div>
                      <div className="flex items-center gap-1"><Eye size={16} className="text-green-400" /> {repo.watchers_count}</div>
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <span className={`w-3 h-3 rounded-full`} style={{backgroundColor: languageColors[repo.language] || "rgba(255, 255, 255, 0.6)"}}></span> {repo.language}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            ) 
            : <p className="text-gray-400 text-center py-12">No repositories found</p>}
          </div>
        </div>
      </div>
      {showList && (
        <UserList
          title={showList === 'followers' ? 'Followers' : 'Following'}
          users={listUsers.map(u => ({
            login: u.login,
            avatar_url: u.avatar_url,
            url: `https://github.com/${u.login}`
        }))}
          onClose={() => setShowList(null)}
          onSelect={(login) => {
            setShowList(null)
            window.scrollTo(0, 0)
            window.location.href = `/user/${login}`
        }}
          loading={loadingList}/>
      )}
    </div>
  )
}

export default UserData