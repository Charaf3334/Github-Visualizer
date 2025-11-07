import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
import cors from 'cors'
import sqlite3 from 'sqlite3'

dotenv.config()

const app = express()
app.use(cors({origin: process.env.FRONT_URL}))
app.use(express.json())

const port = process.env.PORT

sqlite3.verbose();
const database = new sqlite3.Database('./history.sqlite', (err) => {
  if (err)
    console.log(err.message)
  else
    console.log('Database connected')
})

const tokens = [process.env.GITHUB_TOKEN1, process.env.GITHUB_TOKEN2]
let currentTokenIndex = 0

const getCurrentToken = () => tokens[currentTokenIndex]
const getHeaders = () => ({Authorization: `token ${getCurrentToken()}`})

const checkRate = async () => {
  try 
  {
    const res = await axios.get('https://api.github.com/rate_limit', {headers: getHeaders()})
    const {remaining, limit, reset} = res.data.rate
    console.log(`Token ${currentTokenIndex + 1}: ${remaining}/${limit} remaining, resets at ${new Date(reset * 1000)}`)

    if (remaining < 10) 
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

const databaseOperations = async (username, user) => {
  database.get(`SELECT COUNT(*) AS count FROM "users"`, (err, row) => {
    if (err)
    {
      console.log('Error in counting rows')
      return res.status(500).json({error: 'Database error'})
    }
    if (row.count >= 20)
    {
      database.run(`DELETE FROM "users" WHERE id IN (
        SELECT id FROM "users"
        ORDER BY datetime(created_at) ASC
        LIMIT 10
        )`, function (err) {
          if (err)
          {
            console.log('Error in deleting rows')
            return res.status(500).json({error: 'Database error'})
          }
          console.log(`Deleted ${this.changes} oldest users`);
        })
    }
  })
  database.run(`DELETE FROM "users" WHERE username = ?`, 
    [username], function (err) {
      if (err)
      {
        console.log('Error in deleting user')
        return res.status(500).json({error: 'Database error'})
      }
      if (this.changes === 0)
        console.log(`User not found (new user)`)
    })
  database.run(`INSERT INTO "users" (username, avatar) VALUES (?, ?)`, [user.login, user.avatar_url], (err) => {
    if (err)
      console.log(`database err: ${err.message}`)
  })
}

app.get('/history', async (req, res) => {

  database.all(`SELECT username, avatar FROM "users" ORDER BY datetime(created_at) DESC LIMIT 5`, [], (err, rows) => {
    if (err)
    {
      console.log('Error in fetching recent search history')
      return res.status(500).json({error: 'Database error'})
    }
    res.status(200).json(rows)
  })
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
    chunk.forEach(repo => {
      allStars += repo.stargazers_count || 0;
    })
    }

    const total = Object.values(languages).reduce((a, b) => a + b, 0)
    const languagePercentages = {}
    for (const [lang, bytes] of Object.entries(languages)) {
      languagePercentages[lang] = Math.round((bytes / total) * 100)
    }

    const createdDate = new Date(user.created_at)
    const activeSince = createdDate.toLocaleDateString('en-US', {year: 'numeric', month: 'long'})
    
    databaseOperations(username, user)

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
    const top5 = sorted.slice(0, 5)
    res.status(200).json(top5)
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
  const perPage = 100
  try 
  {
    await checkRate()
    const res1 = await axios.get(`https://api.github.com/users/${username}/${type}`, {headers: getHeaders(), params: {per_page: perPage, page: 1}})
    const data1 = res1.data
    let data2 = []
    if (data1.length === perPage)
    {
      const res2 = await axios.get(`https://api.github.com/users/${username}/${type}`, {headers: getHeaders(), params: {per_page: perPage, page: 2}})
      data2 = res2.data
    }
    res.status(200).json(data1.concat(data2))
  } 
  catch (err) 
  {
    res.status(err.response?.status || 500).json({error: `Failed to fetch ${type}`})
  }
})

app.listen(port, () => console.log(`Server running on port: ${port}`))