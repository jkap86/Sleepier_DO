'use strict'

module.exports = app => {
    const stats = require("../controllers/stats.controller");

    var router = require("express").Router();

    router.get("/range", stats.range);

    app.use('/stats', router);
}