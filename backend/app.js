import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()
app.use(cors({origin: process.env.FRONT_URL}))
app.use(express.json())

const port = process.env.PORT || 3000

const tokens = [process.env.GITHUB_TOKEN1, process.env.GITHUB_TOKEN2]
let currentTokenIndex = 0

const getCurrentToken = () => tokens[currentTokenIndex]
const getHeaders = () => ({Authorization: `token ${getCurrentToken()}`})

const checkRate = async () => {
  try {
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

  while (true) {
    const {data} = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`, {headers: getHeaders()})
    if (!data.length) break
    repos.push(...data)
    if (data.length < 100) break
    page++
}

  return repos
}

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

    for (let i = 0; i < repos.length; i += SIZE) 
    {
      const chunk = repos.slice(i, i + SIZE)
      const results = await Promise.allSettled(chunk.map(repo => axios.get(repo.languages_url, {headers: getHeaders()})))
      results.forEach(r => {
        if (r.status === 'fulfilled')
          for (const [lang, bytes] of Object.entries(r.value.data))
            languages[lang] = (languages[lang] || 0) + bytes
    })
  }

    const total = Object.values(languages).reduce((a, b) => a + b, 0)
    const languagePercentages = {}
    for (const [lang, bytes] of Object.entries(languages)) {
      languagePercentages[lang] = Math.round((bytes / total) * 100)
  }

    res.status(200).json({
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      public_repos: user.public_repos,
      languages: languagePercentages,
  })
} 
  catch (err) 
  {
    res.status(err.response?.status || 500).json({error: 'User not found or API error'})
}
})

app.listen(port, () => console.log(`Server running on port: ${port}`))