module.exports = (app) => {
    const users = require("../controllers/user.controller.js");
    var router = require("express").Router();


    router.get("/create", (req, res) => {
        users.create(req, res, app)
    })

    router.get("/lmplayershares", users.lmplayershares);

    router.get("/findmostleagues", (req, res) => {
        const users = app.get('top_users')
        res.send(users || [])
    })

    app.use('/user', router);
}