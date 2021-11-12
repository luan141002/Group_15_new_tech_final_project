const express = require('express');

const app = express();

const dotenv = require('dotenv');
dotenv.config();

const PORT = Number.parseInt(process.env.SERVER_PORT);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
