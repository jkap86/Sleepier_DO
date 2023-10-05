'use strict'

module.exports = async (app) => {
    const axios = require('../api/axiosInstance');
    const fs = require('fs');

    const getStats = () => {

        const stats = []

        if (stats.find(s => parseInt(s.gameSecondsRemaining) > 0)) {
            setTimeout(getStats, 15 * 60 * 1000)
        } else {
            try {
                const next_kickoff = Math.min(stats.map(s => parseInt(s.kickoff)));

                const delay = new Date(next_kickoff).getTime() - new Date().getTime()

                setTimeout(getStats, delay)
            } catch (err) {
                console.log(err.message);
                setTimeout(getStats, 12 * 60 * 60 * 1000);
            }
        }
    }

    setTimeout(() => {

    })

}