import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()
app.use(cors({origin: process.env.FRONT_URL}))
app.use(express.json())

const port = process.env.PORT
const token = process.env.GITHUB_TOKEN

// main route
app.get('/users', async (req, res) => {
  let {username} = req.query
  username = username.trim()
  if (!username)
    return res.status(400).json({error: 'Username is required'})
  try 
  {
    const headers = {Authorization: `token ${token}`}
    const {data: userData} = await axios.get(`https://api.github.com/users/${username}`, {headers})
    const {data: repos} = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, {headers})
    const languages = {}

    await Promise.all(
        repos.map(async (repo) => {
            const {data: langs} = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/languages`, {headers})
            for (const lang in langs)
                languages[lang] = (languages[lang] || 0) + langs[lang]
        })        
    )
    const total = Object.values(languages).reduce((sum, count) => sum + count, 0)
    const languagePercentages = {}
    for (const lang in languages)
        languagePercentages[lang] = Math.round((languages[lang] / total) * 100)    

    res.status(200).json({
        ...userData,
        languages: languagePercentages
    })
  }
  catch (err) 
  {
    res.status(err.response?.status || 500).json({error: 'User not found'})
  }
})

app.listen(port, () => console.log(`Server running on port: ${port}`))