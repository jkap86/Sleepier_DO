'use strict'

const schedule = require('../../schedule.json');
const allplayers = require('../../allplayers.json');
const projections = require('../../projections.json');

module.exports = (app) => {
    const JSONStream = require('JSONStream');
    var router = require("express").Router();

    router.get('/allplayers', (req, res) => {


        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const stream = JSONStream.stringify();

        stream.pipe(res);


        stream.end(allplayers)
    })


    router.get('/schedule', (req, res) => {


        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const stream = JSONStream.stringify();

        stream.pipe(res);

        stream.end(schedule)
    })

    router.get('/projections', (req, res) => {


        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const stream = JSONStream.stringify();

        stream.pipe(res);

        stream.end(projections)
    })

    app.use('/main', router);
}

