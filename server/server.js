'use strict'

require('dotenv').config();
const throng = require('throng');
const https = require("https");
const WORKERS = process.env.WEB_CONCURRENCY || 1;

setInterval(() => {
    https.get('https://sleepier.herokuapp.com/')
}, 29 * 60 * 1000);

throng({
    worker: start,
    count: WORKERS
});

function start() {
    const express = require('express');
    const cors = require('cors');
    const compression = require('compression');
    const path = require('path');

    const app = express();

    //  app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

    app.use(compression())
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.static(path.resolve(__dirname, '../client/build')));


    const db = require('./app/models');
    db.sequelize.sync({ alter: true })
        .then(() => {
            console.log("Synced db.");
        })
        .catch((err) => {
            console.log("Failed to sync db: " + err.message);
        })

    require('./app/routes/main.routes')(app);
    require('./app/routes/user.routes')(app);
    require('./app/routes/league.routes')(app);
    require('./app/routes/trade.routes')(app);
    require('./app/routes/ringOfFire.routes')(app);

    app.get('*', async (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    })

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);

        require('./app/backgroundTasks/dailyUpdate')(app);
        require('./app/backgroundTasks/findMostLeagus')(app)
        require('./app/backgroundTasks/getProjections')(app)
        require('./app/backgroundTasks/getPlayerValues')(app)
    });

}