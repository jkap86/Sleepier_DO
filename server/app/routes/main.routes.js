'use strict'

const fs = require('fs');
const path = require('path');


module.exports = (app) => {
    const JSONStream = require('JSONStream');
    var router = require("express").Router();

    router.get('/allplayers', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const allplayers = path.join(__dirname, '../../allplayers.json');

        try {
            const data = fs.readFileSync(allplayers, 'utf8');
            const stream = JSONStream.stringify();
            stream.pipe(res);
            stream.end(JSON.parse(data));
        } catch (err) {
            console.log(err.message)
        }

    })


    router.get('/schedule', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const schedule = path.join(__dirname, '../../schedule.json');

        try {
            const data = fs.readFileSync(schedule, 'utf8');
            const stream = JSONStream.stringify();
            stream.pipe(res);
            stream.end(JSON.parse(data));
        } catch (err) {
            console.log(err.message)
        }


    })

    router.get('/projections', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const projections = path.join(__dirname, '../../projections.json');

        try {
            const data = fs.readFileSync(projections, 'utf8');
            const stream = JSONStream.stringify();
            stream.pipe(res);
            stream.end(JSON.parse(data));
        } catch (err) {
            console.log(err.message)
        }
    })

    router.post('/playervalues', (req, res) => {
        const playervalues = fs.readFileSync('./playervalues.json', 'utf-8')

        const data = JSON.parse(playervalues)
            .filter(pv =>
                req.body.player_ids.includes(pv.player_id)
                || pv.player_id.includes(' ')
            )

        res.send(data)
    })

    router.get('/logs/:date', (req, res) => {
        const route_includes = req.query.route_includes

        let key, value;
        if (req.query.param?.includes('-')) {
            key = req.query.param.split('-')[0]
            value = req.query.param.split('-')[1]
        }


        const logs = fs.readFileSync('./logs.json')

        const logs_to_send = JSON.parse(logs)
            .filter(l => (
                req.params.date.toLowerCase() === 'all'
                || req.params.date === l.timestamp.split(',')[0].replace(/[^0-9]/g, '')
            ) && (
                    !route_includes || l.route.includes(route_includes)
                ) && (
                    l.request?.[key]?.toString() === value
                ))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

        res.send(logs_to_send)
    })

    app.use('/main', router);
}

