'use strict'

const fs = require('fs');
const path = require('path');


module.exports = (app) => {
    const JSONStream = require('JSONStream');
    var router = require("express").Router();

    router.get('/allplayers', (req, res) => {
        const allplayers = path.join(__dirname, '../../allplayers.json');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        fs.readFile(allplayers, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading allplayers file');
                return;
            }
        })


        const stream = JSONStream.stringify();

        stream.pipe(res);


        stream.end(allplayers)
    })


    router.get('/schedule', (req, res) => {
        const schedule = path.join(__dirname, '../../schedule.json');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        fs.readFile(schedule, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading schedule file');
                return;
            }
        })

        const stream = JSONStream.stringify();

        stream.pipe(res);

        stream.end(schedule)
    })

    router.get('/projections', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const projections = path.join(__dirname, '../../projections.json');

        fs.readFile(projections, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading projections file');
                return;
            }
        })

        const stream = JSONStream.stringify();

        stream.pipe(res);

        stream.end(projections)
    })

    app.use('/main', router);
}

