'use strict'

module.exports = (app) => {
    const leagues = require("../controllers/league.controller.js");

    const router = require("express").Router();

    router.get('/find', (req, res) => {
        leagues.find(req, res, app)
    });

    router.post('/matchups', (req, res) => {
        leagues.matchups(req, res, app)
    });

    router.post('/sync', (req, res) => {
        leagues.sync(req, res, app)
    })

    router.post("/draft", async (req, res) => {
        leagues.picktracker(req, res, app)
    })

    app.use('/league', router);
}