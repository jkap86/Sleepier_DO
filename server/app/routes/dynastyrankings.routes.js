'use strict'

module.exports = app => {
    const dynastyrankings = require("../controllers/dynastyrankings.controller.js");

    var router = require("express").Router();

    router.get("/stats", dynastyrankings.stats)

    router.get("/find", dynastyrankings.find)

    router.get("/findrange", dynastyrankings.findrange)

    app.use('/dynastyrankings', router);
}