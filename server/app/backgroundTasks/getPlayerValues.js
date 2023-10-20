'use strict'
const fs = require('fs');
const axios = require('../api/axiosInstance');

module.exports = async (app) => {
    const matchPlayer = (player, stateAllPlayers) => {

        const matchTeam = (team) => {
            const team_abbrev = {
                SFO: 'SF',
                JAC: 'JAX',
                KCC: 'KC',
                TBB: 'TB',
                GBP: 'GB',
                NEP: 'NE',
                LVR: 'LV',
                NOS: 'NO'
            }
            return team_abbrev[team] || team
        }

        if (player.position === 'RDP') {
            return player.playerName.slice(0, -2)
        } else {

            const players_to_search = Object.keys(stateAllPlayers || {})
                .map(player_id => {
                    let match_score = 0

                    if (stateAllPlayers[player_id]?.active === true
                        && stateAllPlayers[player_id]?.position === player.position) {
                        match_score += 1
                    }
                    if (stateAllPlayers[player_id]?.college === player.college) {
                        match_score += 1
                    }
                    if (stateAllPlayers[player_id]?.number === player.number) {
                        match_score += 1
                    }
                    if ((stateAllPlayers[player_id]?.team || 'FA') === matchTeam(player.team)) {
                        match_score += 1
                    }
                    if (stateAllPlayers[player_id]?.years_exp === player.seasonsExperience || 0) {
                        match_score += 1
                    }
                    if (player.playerName?.replace('III', '').replace('II', '').replace('Jr', '').trim().toLowerCase().replace(/[^a-z]/g, "") === stateAllPlayers[player_id]?.search_full_name?.trim()) {
                        match_score += 5
                    }

                    return {
                        player_id: player_id,
                        match_score: match_score
                    }
                })
                .sort((a, b) => b.match_score - a.match_score)

            console.log(players_to_search[0])
            return players_to_search[0].player_id
        }

    }

    const getDailyValues = async () => {

        console.log(`Beginning daily rankings update at ${new Date()}`)

        const stateAllPlayers = fs.readFileSync('./allplayers.json', 'utf-8')

        let ktc;
        try {
            console.log('getting ktc')
            ktc = await axios.post('https://keeptradecut.com/dynasty-rankings/histories')
            console.log('ktc complete')
        } catch (err) {
            console.log(err)
        }


        let fc_sf_dynasty
        try {
            fc_sf_dynasty = await axios.get(`https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=2&numTeams=12&ppr=1`)
            console.log('fc complete')
        } catch (err) {
            console.log(err)
        }

        let fc_sf_redraft
        try {
            fc_sf_redraft = await axios.get(`https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=2&numTeams=12&ppr=1`)
        } catch (err) {
            console.log(err)
        }

        let fc_oneqb_dynasty
        try {
            fc_oneqb_dynasty = await axios.get(`https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=12&ppr=1`)
        } catch (err) {
            console.log(err)
        }

        let fc_oneqb_redraft
        try {
            fc_oneqb_redraft = await axios.get(`https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=12&ppr=1`)
            console.log('fc complete')
        } catch (err) {
            console.log(err)
        }

        const daily_values = {}

        ktc.data.slice(0, 50).forEach(ktc_player => {

            const sleeper_id = matchPlayer(ktc_player, stateAllPlayers)
            console.log({ sleeper_id })
            const oneqb_dynasty_fc = fc_oneqb_dynasty.data
                .find(p => p.player.sleeperId === sleeper_id)
                ?.value

            const sf_dynasty_fc = fc_sf_dynasty.data
                .find(p => p.player.sleeperId === sleeper_id)
                ?.value

            const oneqb_redraft_fc = fc_oneqb_redraft.data
                .find(p => p.player.sleeperId === sleeper_id)
                ?.value

            const sf_redraft_fc = fc_sf_redraft.data
                .find(p => p.player.sleeperId === sleeper_id)
                ?.value

            daily_values[sleeper_id] = {
                oneqb: ktc_player.oneQBValues?.value,
                sf: ktc_player.superflexValues?.value,
                oneqb_dynasty_fc: oneqb_dynasty_fc,
                sf_dynasty_fc: sf_dynasty_fc,
                oneqb_redraft_fc: oneqb_redraft_fc,
                sf_redraft_fc: sf_redraft_fc
            }
        })

        Array.from(
            new Set(
                ...fc_oneqb_dynasty.data.map(p => p.player.sleeperId),
                ...fc_oneqb_redraft.data.map(p => p.player.sleeperId),
                ...fc_sf_dynasty.data.map(p => p.player.sleeperId),
                ...fc_sf_redraft.data.map(p => p.player.sleeperId)
            )
        )
            .filter(player_id =>
                !Object.keys(daily_values).includes(player_id)
            )
            .forEach(player_id => {
                const oneqb_dynasty_fc = fc_oneqb_dynasty.data
                    .find(p => p.player.sleeperId === player_id)
                    ?.value

                const sf_dynasty_fc = fc_sf_dynasty.data
                    .find(p => p.player.sleeperId === player_id)
                    ?.value

                const oneqb_redraft_fc = fc_oneqb_redraft.data
                    .find(p => p.player.sleeperId === player_id)
                    ?.value

                const sf_redraft_fc = fc_sf_redraft.data
                    .find(p => p.player.sleeperId === player_id)
                    ?.value

                daily_values[player_id] = {
                    oneqb_dynasty_fc: oneqb_dynasty_fc,
                    sf_dynasty_fc: sf_dynasty_fc,
                    oneqb_redraft_fc: oneqb_redraft_fc,
                    sf_redraft_fc: sf_redraft_fc
                }
            })


        try {
            fs.writeFileSync('./playervalues.json', JSON.stringify(daily_values))
        } catch (error) {
            console.log(error)
        }

        console.log(`Update Complete`)

    }

    const breakoutByDate = () => {
        const ktcplayers = require('../../ktcplayers.json');


    }
}