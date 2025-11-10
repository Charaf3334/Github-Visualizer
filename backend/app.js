import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
import cors from 'cors'
import pkg from 'pg'
import { rateLimit } from 'express-rate-limit'

dotenv.config()

const app = express()
app.use(cors({origin: process.env.FRONT_URL, credentials: true}))
app.use(express.json())

const port = process.env.PORT

const { Pool } = pkg
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false }
})

pool.connect().then(() => console.log('PostgreSQL connected')).catch(err => console.error('Database connection error:', err.message))

app.use((req, res, next) => {
  const key = req.headers['api-key']
  if (key !== process.env.API_KEY)
    return res.status(403).json({error: 'Forbidden'})
  next()
})

if (process.env.MODE === 'production')
  app.use(rateLimit({windowMs: 60 * 1000, max:100}))


const tokens = [process.env.GITHUB_TOKEN1, process.env.GITHUB_TOKEN2, process.env.GITHUB_TOKEN3]
let currentTokenIndex = 0
const getCurrentToken = () => tokens[currentTokenIndex]
const getHeaders = () => ({Authorization: `token ${getCurrentToken()}`})

const checkRate = async () => {
  try 
  {
    const res = await axios.get('https://api.github.com/rate_limit', {headers: getHeaders()})
    const {remaining, limit, reset} = res.data.rate
    console.log(`Token ${currentTokenIndex + 1}: ${remaining}/${limit} remaining, resets at ${new Date(reset * 1000)}`)
    if (remaining < 500) 
    {
      currentTokenIndex = (currentTokenIndex + 1) % tokens.length
      console.log(`Switching to token ${currentTokenIndex + 1}`)
    }
  } 
  catch (err) 
  {
    console.error('Error checking rate:', err.message)
  }
}

const getAllRepos = async (username) => {
  let page = 1
  const repos = []
  while (true) 
  {
    const {data} = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`, {headers: getHeaders()})
    if (!data.length) 
      break
    repos.push(...data)
    if (data.length < 100) 
      break
    page++
  }
  return repos
}

const languageDbOperations = async (languagePercentages, username) => {
  const client = await pool.connect()
  try
  {
    await client.query(`
      CREATE TABLE IF NOT EXISTS language_occ (
        id SERIAL PRIMARY KEY,
        language TEXT NOT NULL,
        username TEXT NOT NULL
        )`)
    const {rows} = await client.query(`SELECT id FROM language_occ WHERE username = $1`, [username])
    if (rows.length == 0)
    {
      for (const [key, value] of Object.entries(languagePercentages))
        if (value != 0)
          await client.query(`INSERT INTO language_occ (language, username) VALUES ($1, $2)`, [key, username])
    }
  }
  catch (err)
  {
    console.error('Database error language_occ', err.message)
    throw err
  }
  finally
  {
    client.release()
  }
}

const databaseOperations = async (username, user) => {
  const client = await pool.connect()
  try 
  {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`)
    const {rows} = await client.query('SELECT COUNT(*) AS count FROM users')
    const count = parseInt(rows[0].count)
    if (count >= 20) 
    {
      await client.query(`DELETE FROM users WHERE id IN (SELECT id FROM users ORDER BY created_at ASC LIMIT 10)`)
      console.log('Deleted oldest users')
    }
    await client.query('DELETE FROM users WHERE username = $1', [username])
    await client.query('INSERT INTO users (username, avatar) VALUES ($1, $2)', [user.login, user.avatar_url])
  } 
  catch (err) 
  {
    console.error('Database error users:', err.message)
    throw err
  } 
  finally 
  {
    client.release()
  }
}

app.get('/occurences', async (req, res) => {
  try
  {
    const {rows} = await pool.query(`
      SELECT language, COUNT(*) * 100.0 / (SELECT COUNT(*) FROM language_occ) AS global_percentage
      FROM language_occ GROUP BY language ORDER BY global_percentage DESC;`)
    const top5 = rows.sort((a, b) => parseFloat(b.global_percentage) - parseFloat(a.global_percentage)).slice(0, 5)
    const totalTop5 = top5.reduce((sum, item) => sum + parseFloat(item.global_percentage), 0)
    const OCCURENCES = top5.map((item) => (
      {
        lang: item.language,
        percentage: ((parseFloat(item.global_percentage) / totalTop5) * 100).toFixed(2)
      }
    ))
    res.status(200).json(OCCURENCES)
  }
  catch (err)
  {
    console.error('Error fetching occurences:', err.message)
    res.status(500).json({error: 'Database error'})
  }
})

app.get('/history', async (req, res) => {
  try 
  {
    const {rows} = await pool.query('SELECT username, avatar FROM users ORDER BY created_at DESC LIMIT 5')
    res.status(200).json(rows)
  } 
  catch (err) 
  {
    console.error('Error fetching history:', err.message)
    res.status(500).json({error: 'Database error'})
  }
})

app.get('/users', async (req, res) => {
  let {username} = req.query
  username = username?.trim()
  if (!username)
    return res.status(400).json({error: 'Username is required'})
  try 
  {
    await checkRate()
    const {data: user} = await axios.get(`https://api.github.com/users/${username}`, {headers: getHeaders()})
    const repos = await getAllRepos(username)
    const languages = {}
    const SIZE = 5
    let allStars = 0
    for (let i = 0; i < repos.length; i += SIZE) 
    {
      const chunk = repos.slice(i, i + SIZE)
      const results = await Promise.allSettled(chunk.map(repo => axios.get(repo.languages_url, {headers: getHeaders()})))
      results.forEach(r => {
        if (r.status === 'fulfilled')
          for (const [lang, bytes] of Object.entries(r.value.data))
            languages[lang] = (languages[lang] || 0) + bytes
      })
      chunk.forEach(repo => {allStars += repo.stargazers_count || 0})
    }
    const total = Object.values(languages).reduce((a, b) => a + b, 0)
    const languagePercentages = {}
    for (const [lang, bytes] of Object.entries(languages))
      languagePercentages[lang] = Math.round((bytes / total) * 100)
    const createdDate = new Date(user.created_at)
    const activeSince = createdDate.toLocaleDateString('en-US', {year: 'numeric', month: 'long'})

    await databaseOperations(username, user)
    await languageDbOperations(languagePercentages, username)

    res.status(200).json({
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      public_repos: user.public_repos,
      languages: languagePercentages,
      all_stars: allStars,
      active_since: activeSince
    })
  } 
  catch (err) 
  {
    res.status(err.response?.status || 500).json({error: 'User not found or API error'})
  }
})

app.get('/users/:username/repos', async (req, res) => {
  const {username} = req.params
  if (!username)
    return res.status(400).json({error: 'Username is required'})
  try 
  {
    await checkRate()
    const {data: repos} = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, {headers: getHeaders()})
    const sorted = repos.sort((a, b) => b.stargazers_count - a.stargazers_count)
    res.status(200).json(sorted.slice(0, 5))
  } 
  catch (err) 
  {
    res.status(err.response?.status || 500).json({error: 'Failed to fetch repositories'})
  }
})

app.get('/users/:username/:type', async (req, res) => {
  const {username, type} = req.params
  if (!username || !type)
    return res.status(400).json({error: 'Username and type are required'})
  if (type !== 'followers' && type !== 'following')
    return res.status(400).json({error: 'Type must be followers or following'})
  try 
  {
    await checkRate()
    const {data} = await axios.get(`https://api.github.com/users/${username}/${type}?per_page=200`, {headers: getHeaders()})
    res.status(200).json(data)
  } 
  catch (err) 
  {
    res.status(err.response?.status || 500).json({error: `Failed to fetch ${type}`})
  }
})

app.listen(port, () => console.log(`Server running on port: ${port}`))