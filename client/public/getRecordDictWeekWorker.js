
self.onmessage = (e) => {

    const { weeks_to_fetch, state, leagues, allplayers, schedule, projections, includeTaxi, includeLocked, rankings, user_id, recordType, league_ids } = e.data;

    console.log({ weeks_to_fetch, state, leagues, allplayers, schedule, projections, includeTaxi, includeLocked, rankings, user_id, recordType })

    const getPlayerScore = (stats_array, scoring_settings, total = false) => {

        let total_breakdown = {};

        stats_array?.map(stats_game => {
            Object.keys(stats_game?.stats || {})
                .filter(x => Object.keys(scoring_settings).includes(x))
                .map(key => {
                    if (!total_breakdown[key]) {
                        total_breakdown[key] = {
                            stats: 0,
                            points: 0
                        }
                    }
                    total_breakdown[key] = {
                        stats: total_breakdown[key].stats + stats_game.stats[key],
                        points: total_breakdown[key].points + (stats_game.stats[key] * scoring_settings[key])
                    }
                })
        })

        return total
            ? Object.keys(total_breakdown).reduce((acc, cur) => acc + total_breakdown[cur].points, 0)
            : total_breakdown;
    }

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

    const getLineupCheck = (matchup, league, stateAllPlayers, weeklyRankings, projections, schedule, includeTaxi, includeLocked, returnSuboptimal = false) => {

        const position_map = {
            'QB': ['QB'],
            'RB': ['RB', 'FB'],
            'WR': ['WR'],
            'TE': ['TE'],
            'FLEX': ['RB', 'FB', 'WR', 'TE'],
            'SUPER_FLEX': ['QB', 'RB', 'FB', 'WR', 'TE'],
            'WRRB_FLEX': ['RB', 'FB', 'WR'],
            'REC_FLEX': ['WR', 'TE']
        }
        const position_abbrev = {
            'QB': 'QB',
            'RB': 'RB',
            'WR': 'WR',
            'TE': 'TE',
            'SUPER_FLEX': 'SF',
            'FLEX': 'WRT',
            'WRRB_FLEX': 'W R',
            'WRRB_WRT': 'W R',
            'REC_FLEX': 'W T'
        }
        const starting_slots = league.roster_positions.filter(x => Object.keys(position_map).includes(x))

        const roster = league.rosters.find(r => r.roster_id === matchup.roster_id)

        let players = []

        matchup?.players
            ?.filter(player_id => includeTaxi ? true : !(roster?.taxi || []).includes(player_id))
            ?.map(player_id => {
                const playing = schedule
                    ?.find(m => m.team.find(t => matchTeam(t.id) === stateAllPlayers[player_id]?.team) || !stateAllPlayers[player_id]?.team)

                let kickoff = new Date(parseInt(schedule
                    ?.find(m => m.team.find(t => matchTeam(t.id) === (stateAllPlayers[player_id]?.team)))
                    ?.kickoff * 1000)).getTime()

                players.push({
                    id: player_id,
                    kickoff: kickoff,
                    rank: weeklyRankings
                        ? !playing
                            ? 1001
                            : weeklyRankings[player_id]?.prevRank
                                ? matchup.starters?.includes(player_id)
                                    ? weeklyRankings[player_id]?.prevRank
                                    : weeklyRankings[player_id]?.prevRank + 1
                                : matchup.starters?.includes(player_id)
                                    ? 999
                                    : 1000
                        : getPlayerScore([projections[player_id]], league.scoring_settings, true) || 0
                })
            })

        const getOptimalLineup = () => {
            let optimal_lineup = []
            let player_ranks_filtered = players
            starting_slots.map((slot, index) => {

                const kickoff = players.find(p => p.id === matchup.starters?.[index])?.kickoff

                const slot_options = player_ranks_filtered
                    .filter(x =>
                        position_map[slot].includes(stateAllPlayers[x.id]?.position)
                        && (
                            !includeLocked || x.kickoff > new Date().getTime()
                        )
                    )
                    .sort(
                        (a, b) => weeklyRankings ? a.rank - b.rank : b.rank - a.rank
                    )

                let optimal_player;

                if (includeLocked && kickoff < new Date().getTime()) {

                    optimal_player = matchup.starters?.[index] || slot_options[0]?.id
                } else {
                    optimal_player = slot_options[0]?.id
                }

                player_ranks_filtered = player_ranks_filtered.filter(x => x.id !== optimal_player)

                optimal_lineup.push({
                    slot: position_abbrev[slot],
                    player: optimal_player
                })
            })

            return optimal_lineup
        }

        let optimal_lineup = matchup ? getOptimalLineup() : []

        const findSuboptimal = () => {
            let lineup_check = []
            starting_slots.map((slot, index) => {
                const cur_id = (matchup?.starters || [])[index]
                const isInOptimal = optimal_lineup.find(x => x.player === cur_id)
                const kickoff = new Date(parseInt(schedule
                    ?.find(m => m.team.find(t => matchTeam(t.id) === stateAllPlayers[cur_id]?.team))
                    ?.kickoff * 1000))
                const gametime = new Date(kickoff)
                const day = gametime.getDay() <= 2 ? gametime.getDay() + 7 : gametime.getDay()
                const hour = gametime.getHours()
                const timeslot = parseFloat(day + '.' + hour)
                const slot_options = matchup?.players
                    ?.filter(x =>
                        !(matchup.starters || []).includes(x) &&
                        position_map[slot].includes(stateAllPlayers[x]?.position)
                    )
                    || []
                const earlyInFlex = matchup.starters?.find((x, starter_index) => {
                    const alt_kickoff = new Date(parseInt(schedule
                        ?.find(m => m.team.find(t => matchTeam(t.id) === stateAllPlayers[x]?.team))
                        ?.kickoff * 1000))
                    const alt_gametime = new Date(alt_kickoff)
                    const alt_day = alt_gametime.getDay() <= 2 ? alt_gametime.getDay() + 7 : alt_gametime.getDay()
                    const alt_hour = alt_gametime.getHours()
                    const alt_timeslot = parseFloat(alt_day + '.' + alt_hour)

                    return alt_kickoff > (kickoff + 30 * 60 * 1000)
                        && position_map[slot].includes(stateAllPlayers[x]?.position)
                        && position_map[starting_slots[starter_index]].includes(stateAllPlayers[cur_id]?.position)
                        && position_map[league.roster_positions[starter_index]].length < position_map[slot].length


                })

                const lateNotInFlex = matchup.starters?.find((x, starter_index) => {
                    const alt_kickoff = new Date(parseInt(schedule
                        ?.find(m => m.team.find(t => matchTeam(t.id) === stateAllPlayers[x]?.team))
                        ?.kickoff * 1000))
                    const alt_gametime = new Date(alt_kickoff)
                    const alt_day = alt_gametime.getDay() <= 2 ? alt_gametime.getDay() + 7 : alt_gametime.getDay()
                    const alt_hour = alt_gametime.getHours()
                    const alt_timeslot = parseFloat(alt_day + '.' + alt_hour)

                    return (alt_kickoff + 30 * 60 * 1000) < kickoff
                        && position_map[slot].includes(stateAllPlayers[x]?.position)
                        && position_map[starting_slots[starter_index]].includes(stateAllPlayers[cur_id]?.position)
                        && position_map[league.roster_positions[starter_index]].length > position_map[slot].length
                })

                return lineup_check.push({
                    index: index,
                    slot: position_abbrev[slot] || 'IDP',
                    slot_index: `${position_abbrev[slot]}_${index}`,
                    current_player: (matchup?.starters || [])[index] || '0',
                    notInOptimal: !isInOptimal,
                    earlyInFlex: earlyInFlex,
                    lateNotInFlex: lateNotInFlex,
                    nonQBinSF: position_map[slot].includes('QB') && stateAllPlayers[(matchup?.starters || [])[index]]?.position !== 'QB',
                    slot_options: slot_options,
                    player: matchup?.starters && stateAllPlayers[matchup?.starters[index]]?.full_name || "0",
                    timeslot: timeslot

                })
            })
            return lineup_check
        }

        const lineup_check = matchup && returnSuboptimal ? findSuboptimal() : [];

        const players_projections = Object.fromEntries(players.map(player => [player.id, parseFloat(player.rank)]));

        const optimalPlayers = optimal_lineup?.map(x => x.player);

        return {
            players_projections: players_projections,
            starting_slots: starting_slots,
            optimal_lineup: optimal_lineup,
            lineup_check: lineup_check,
            matchup: matchup,
            proj_score_actual: Object.keys(players_projections || {})
                .filter(player_id => matchup.starters?.includes(player_id))
                .reduce((acc, cur) => acc + (players_projections || {})[cur], 0),
            proj_score_optimal: Object.keys(players_projections || {})
                .filter(player_id => optimalPlayers?.includes(player_id))
                .reduce((acc, cur) => acc + (players_projections || {})[cur], 0)

        }
    }

    const getLineupChecksPrevWeek = (week) => {
        let lineupChecks_week = {};

        leagues
            .filter(league => (!league_ids || league_ids?.includes(league.league_id)) && league[`matchups_${week}`])
            .map(league => {
                const matchup_user = league[`matchups_${week}`].find(m => m.roster_id === league.userRoster.roster_id);
                const matchup_opp = league[`matchups_${week}`].find(m => m.matchup_id === matchup_user.matchup_id && m.roster_id !== league.userRoster.roster_id)

                const lc_user = matchup_user && getLineupCheck(matchup_user, league, allplayers, rankings, projections[week], schedule[week], includeTaxi, includeLocked)
                const lc_opp = matchup_opp && getLineupCheck(matchup_opp, league, allplayers, rankings, projections[week], schedule[week], includeTaxi, includeLocked)

                let win, loss, tie;

                if (week >= league.settings.start_week && matchup_user && matchup_opp) {
                    if (lc_user?.matchup?.points > lc_opp?.matchup?.points) {
                        win = 1;
                        loss = 0;
                        tie = 0;
                    } else if (lc_user?.matchup?.points < lc_opp?.matchup?.points) {
                        win = 0;
                        loss = 1;
                        tie = 0;
                    } else {
                        win = 0;
                        loss = 0;
                        tie = 1;
                    }
                } else {
                    win = 0;
                    loss = 0;
                    tie = 0;
                }


                let median_win = 0;
                let median_loss = 0;

                if (
                    league.settings.league_average_match === 1
                    && week >= league.settings.start_week
                ) {
                    const pts_rank = league[`matchups_${week}`]
                        ?.sort((a, b) => b.points - a.points)
                        ?.findIndex(m => {
                            return m.roster_id === league.userRoster.roster_id
                        })

                    if (pts_rank + 1 <= (league.rosters.length / 2)) {
                        median_win++
                    } else {
                        median_loss++
                    }
                }


                return lineupChecks_week[league.league_id] = {
                    name: league.name,
                    avatar: league.avatar,
                    lc_user: lc_user,
                    lc_opp: lc_opp,
                    win: win,
                    loss: loss,
                    tie: tie,
                    median_win: median_win,
                    median_loss: median_loss
                }
            })

        return lineupChecks_week
    }

    const getLineupChecksWeek = (week) => {
        let lineupChecks_week = {};

        leagues
            .filter(league => (!league_ids || league_ids?.includes(league.league_id)) && league[`matchups_${week}`])
            .map(league => {
                const roster_id = league.rosters
                    .find(roster => roster.user_id === user_id)?.roster_id

                const matchup_user = league[`matchups_${week}`]
                    .find(m => m.roster_id === roster_id)

                const matchup_opp = league[`matchups_${week}`]
                    .find(m => m.matchup_id === matchup_user.matchup_id && m.roster_id !== roster_id)

                const lc_user = matchup_user && getLineupCheck(matchup_user, league, allplayers, rankings, projections[week], schedule[week], includeTaxi, includeLocked, true)
                const lc_opp = matchup_opp && getLineupCheck(matchup_opp, league, allplayers, rankings, projections[week], schedule[week], includeTaxi, includeLocked, true)

                const standings = league[`matchups_${week}`]
                    ?.map(m => {
                        return m && getLineupCheck(m, league, allplayers, rankings, projections[week], schedule[week], includeTaxi, includeLocked)
                    })
                    ?.sort((a, b) => b[`proj_score_${recordType}`] - a[`proj_score_${recordType}`])

                const pts_rank = standings
                    ?.findIndex(lc => {
                        return lc.matchup.roster_id === roster_id
                    })

                let win, loss, tie;

                if (week >= league.settings.start_week && matchup_user && matchup_opp) {
                    if (lc_user[`proj_score_${recordType}`] > lc_opp[`proj_score_${recordType}`]) {
                        win = 1;
                        loss = 0;
                        tie = 0;
                    } else if (lc_user[`proj_score_${recordType}`] < lc_opp[`proj_score_${recordType}`]) {
                        win = 0;
                        loss = 1;
                        tie = 0;
                    } else {
                        win = 0;
                        loss = 0;
                        tie = 1;
                    }
                } else {
                    win = 0;
                    loss = 0;
                    tie = 0;
                }



                const median_win = (league.settings.league_average_match === 1
                    && pts_rank + 1 <= (league.rosters.length / 2))
                    ? 1
                    : 0

                const median_loss = (league.settings.league_average_match === 1
                    && pts_rank + 1 >= (league.rosters.length / 2))
                    ? 1
                    : 0

                return lineupChecks_week[league.league_id] = {
                    name: league.name,
                    avatar: league.avatar,
                    lc_user: lc_user,
                    lc_opp: lc_opp,
                    win: win,
                    loss: loss,
                    tie: tie,
                    median_win: median_win,
                    median_loss: median_loss,
                    standings: Object.fromEntries(
                        standings.map(s => {
                            const opp = standings.find(s2 => s2.matchup.matchup_id === s.matchup.matchup_id && s2.matchup.roster_id !== s.matchup.roster_id)

                            const pts_rank_lm = standings
                                ?.findIndex(lc => {
                                    return lc.matchup.roster_id === s.matchup.roster_id
                                })

                            const median_win_lm = (league.settings.league_average_match === 1
                                && pts_rank_lm + 1 <= (league.rosters.length / 2))
                                ? 1
                                : 0

                            const median_loss_lm = (league.settings.league_average_match === 1
                                && pts_rank_lm + 1 >= (league.rosters.length / 2))
                                ? 1
                                : 0
                            return [
                                s.matchup.roster_id,
                                {
                                    wins: (s.proj_score_optimal > opp.proj_score_optimal ? 1 : 0)
                                        + median_win_lm,
                                    losses: (s.proj_score_optimal < opp.proj_score_optimal ? 1 : 0)
                                        + median_loss_lm,
                                    ties: (s.proj_score_optimal + opp.proj_score_optimal > 0 && s.proj_score_optimal === opp.proj_score_optimal)
                                        ? 1
                                        : 0,
                                    fp: s.proj_score_optimal,
                                    fpa: opp.proj_score_optimal
                                }
                            ]
                        })
                    )
                }
            })

        return lineupChecks_week
    }

    weeks_to_fetch
        .forEach(week => {
            console.log(`getting projections for week ${week}`)
            let projectedRecordWeek;

            if (week < state.week) {
                projectedRecordWeek = getLineupChecksPrevWeek(week);

            } else {
                projectedRecordWeek = getLineupChecksWeek(week);
            }

            postMessage({
                week: week,
                projectedRecordWeek: projectedRecordWeek
            })

        })


};
