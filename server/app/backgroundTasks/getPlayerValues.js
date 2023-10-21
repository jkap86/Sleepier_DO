'use strict'
const fs = require('fs');
const axios = require('../api/axiosInstance');

module.exports = async (app) => {
    const matchPlayer = (player, stateAllPlayers) => {
        const ktc_player_ids = require('../../ktc_player_ids.json');

        const sleeper_id = ktc_player_ids.find(x => parseInt(x.ktc_id) === player.playerID)?.sleeper_id

        return sleeper_id
    }

    const getUTCDate = (date) => {
        // Extract year, month, and day
        let yy = date.getUTCFullYear().toString().slice(-2);  // Get last 2 digits of year
        let mm = String(date.getUTCMonth() + 1).padStart(2, '0');  // Month is 0-indexed, so +1
        let dd = String(date.getUTCDate()).padStart(2, '0');

        // Form the "mm-dd-yy" format
        let formattedDate = `${mm}-${dd}-${yy}`;
        return formattedDate;

    }

    const getDailyValues = async () => {

        console.log(`Beginning daily rankings update at ${new Date()}`)

        const stateAllPlayers = fs.readFileSync('./allplayers.json', 'utf-8')

        let ktc;
        try {
            ktc = await axios.post('https://keeptradecut.com/dynasty-rankings/histories')
        } catch (err) {
            console.log(err)
        }

        const values_all = {}

        ktc.data.forEach(ktc_player => {
            const sleeper_id = matchPlayer(ktc_player, stateAllPlayers)

            if (sleeper_id) {
                ktc_player.superflexValueHistory
                    .forEach(date_values => {
                        const date = getUTCDate(new Date(date_values.d))

                        if (!values_all[date]) {
                            values_all[date] = {}
                        }
                        if (!values_all[date].sf) {
                            values_all[date].sf = {}
                        }

                        values_all[date].sf[sleeper_id] = date_values.v
                    })


                ktc_player.oneQBValueHistory
                    .forEach(date_values => {
                        const date = getUTCDate(new Date(date_values.d))

                        if (!values_all[date]) {
                            values_all[date] = {}
                        }
                        if (!values_all[date].oneqb) {
                            values_all[date].oneqb = {}
                        }

                        values_all[date].oneqb[sleeper_id] = date_values.v
                    })

            }
        })

        const data = []

        Object.keys(values_all)
            .forEach(date => {
                Object.keys(values_all[date])
                    .forEach(type => {
                        Object.keys(values_all[date][type])
                            .forEach(player_id => {
                                data.push({
                                    date: date,
                                    type: type,
                                    player_id: player_id,
                                    value: values_all[date][type][player_id]
                                })
                            })
                    })
            })


        try {
            fs.writeFileSync('./playervalues.json', JSON.stringify(data))
        } catch (error) {
            console.log(error)
        }

        console.log(`Update Complete`)
    }

    await getDailyValues()
}