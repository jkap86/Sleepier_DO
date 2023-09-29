'use strict'

const fs = require('fs');
const axios = require('axios');

const getAllPlayers = async () => {
    //  get allplayers dict - from .json file in dev; filter for active and position

    let sleeper_players;

    try {
        sleeper_players = await axios.get('https://api.sleeper.app/v1/players/nfl')

        sleeper_players = Object.fromEntries(Object.keys(sleeper_players.data)
            .filter(player_id => sleeper_players.data[player_id].active && !['OL', 'T', 'OT', 'G', 'OG', 'C'].includes(sleeper_players.data[player_id].position))
            .map(key => {
                const { position, college, number, birth_date, age, full_name, active, team, player_id, search_full_name, years_exp } = sleeper_players.data[key];
                return [
                    key,
                    {
                        position,
                        college,
                        number,
                        birth_date,
                        age,
                        full_name,
                        active,
                        team,
                        player_id,
                        search_full_name,
                        years_exp
                    }
                ]
            }
            ))

        fs.writeFileSync('./allplayers.json', JSON.stringify(sleeper_players))

    } catch (error) {
        console.log(error)
    }

}

const getState = async (app) => {
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl')

    app.set('state', state.data, 0)
}

const getSchedule = async () => {
    let schedule;


    const nflschedule = await axios.get(`https://api.myfantasyleague.com/2023/export?TYPE=nflSchedule&W=ALL&JSON=1`)

    schedule = Object.fromEntries(
        nflschedule.data.fullNflSchedule.nflSchedule
            .map(matchups_week => {
                return [matchups_week.week, matchups_week.matchup]
            })
    )

    fs.writeFileSync('./schedule.json', JSON.stringify(schedule))

}

module.exports = {
    getAllPlayers: getAllPlayers,
    getState: getState,
    getSchedule: getSchedule
}