const express = require('express');
const data = require('./data');
const seed = require('./data/seed');
const cors = require('cors');

const dotenv = require('dotenv')
dotenv.config()

const app = express();

const PORT = Number.parseInt(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.error = require('./utility/errorResponse');
    next();
});

async function main(port) {
    await data.connect(process.env.MONGODB_URL);
    await seed.initialize();

    app.use(require('./controllers/SearchController'));
    app.use(require('./controllers/AccountController'));
    app.use(require('./controllers/AuthController'));
    app.use(require('./controllers/ThesisController'));

    app.listen(port, () => {
        console.log(`Now listening on port ${PORT}`);
    });
}

app.start = async (port) => {
    let _port = port;
    if (!port && process.env.PORT) _port = Number.parseInt(process.env.PORT)
    await main(_port);
};

app.close = async (port) => {
    await data.close();
};

module.exports = app;
