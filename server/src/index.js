const express = require('express')
const data = require('./data')

const app = express()

const dotenv = require('dotenv');
dotenv.config();

const PORT = Number.parseInt(process.env.SERVER_PORT);
data.connect(process.env.MONGODB_URL)

app.use(express.json())

require('./controllers/account')(app)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
