const express = require('express')
const data = require('./data')
const seed = require('./data/seed')
const cors = require('cors')

const dotenv = require('dotenv')
dotenv.config()

const app = express()

const allowedOrigins = process.env.DOMAINS.split(/,/).map(e => RegExp(e))
app.use(cors({
    origin: allowedOrigins
}))

const PORT = Number.parseInt(process.env.PORT)
async function main() {
    await data.connect(process.env.MONGODB_URL)
    await seed.initialize()
    
    app.use(express.json())
    
    require('./controllers/account')(app)
    require('./controllers/group')(app)
    
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`)
    })
}

main()
