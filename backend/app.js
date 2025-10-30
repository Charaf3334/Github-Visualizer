import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

// setup backend server

dotenv.config()

const app = express()
app.use(express.json())

const port = process.env.PORT
const token = process.env.GITHUB_TOKEN

const fetchUser = async () => {
    const url = 'https://api.github.com/user'
    const headers = {Authorization: `token ${token}`}
    const {data} = await axios.get(url, {headers})
    return data
}

app.get('/user', async (req, res) => {
    try
    {
        const data = await fetchUser()
        res.status(200).json(data)
    }
    catch (err)
    {
        res.status(500).json({error: err.message})
    }
})

app.listen(port, () => console.log(`Server running on port: ${port}`))