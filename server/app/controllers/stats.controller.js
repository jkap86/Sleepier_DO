'use strict'
const stats = require('../../stats.json');


exports.range = async (req, res) => {

    const stats_data = stats


    res.send(stats_data)


}