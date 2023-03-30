const express = require('express');
const data = require('./data');
const seed = require('./data/seed');
const cors = require('cors');
const path = require('path');

const dotenv = require('dotenv')
dotenv.config()

const app = express();

const DEFAULT_PORT = 8550;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.error = require('./utility/errorResponse');
    next();
});

async function main(port) {
    await data.connect(process.env.MONGODB_URL);
    await seed.initialize();

    app.use(express.static(path.join(__dirname, '..', 'build')));

    const router = express.Router();
    router.use(require('./controllers/SearchController'));
    router.use(require('./controllers/AccountController'));
    router.use(require('./controllers/AuthController'));
    router.use(require('./controllers/ThesisController'));
    router.use(require('./controllers/DefenseController'));
    router.use(require('./controllers/AnnouncementController'));
    router.get('/healthcheck', (req, res) => {
        return res.sendStatus(200);
    });
    app.use('/api', router);

    app.get('/*', (req, res) => {
        return res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
    });

    app.listen(port, () => {
        console.log(`Now listening on port ${port}`);
    });
}

app.start = async (port) => {
    let _port = DEFAULT_PORT;
    if (port) _port = port;
    else if (process.env.PORT) _port = Number.parseInt(process.env.PORT);
    await main(_port);
};

app.close = async (port) => {
    await data.close();
};

module.exports = app;
