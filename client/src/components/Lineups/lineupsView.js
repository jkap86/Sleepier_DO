import { useSelector, useDispatch } from "react-redux";
import { loadingIcon } from "../../functions/misc";
import TableMain from "../Home/tableMain";
import { setState } from "../../redux/actions/state";
import { filterLeagues } from "../../functions/filterLeagues";
import { includeTaxiIcon, includeLockedIcon } from "../../functions/filterIcons";
import Lineups2Main from "./lineups2Main";
import { useCallback } from "react";


const LineupsView = () => {
    const dispatch = useDispatch();
    const { state, projections, type1, type2, allplayers } = useSelector(state => state.main);
    const { leagues, username } = useSelector(state => state.user);
    const {
        includeTaxi,
        includeLocked,
        week,
        lineupChecks,
        column1,
        column2,
        column3,
        column4,
        column1_prev,
        column2_prev,
        column3_prev,
        column4_prev,
        itemActive,
        page,
        searched,
        recordType,
        playerLineupDict,
        primaryContent,
        sortBy
    } = useSelector(state => state.lineups);


    console.log({ playerLineupDict })
    const hash = `${includeTaxi}-${includeLocked}`

    const columnOptions = week < state.week
        ? [
            'For',
            'Against',
            'Optimal For',
            'Optimal Against',
            'Bench Points',
            'Total Points'
        ]
        : [
            'Suboptimal',
            'Early/Late Flex',
            'Non QB in SF',
            'Open Roster',
            'Open IR',
            'Open Taxi',
            'Out',
            'Doubtful',
            'Ques',
            'IR',
            'Sus',
            'Opt-Act'
        ];

    const lineups_headers = [
        [
            {
                text: 'League',
                colSpan: 6,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: 'W/L',
                className: 'half',
                colSpan: 1,
                rowSpan: 2
            },
            {
                text: week < state.week ? 'Results' : '#Slots',
                colSpan: 8,
                className: 'half'
            }

        ],
        [
            {
                text: <label className="select">
                    <p>{week < state.week ? column1_prev : column1}</p>
                    <select
                        value={week < state.week ? column1_prev : column1}
                        className="hidden_behind click"
                        onChange={(e) => dispatch(setState({ [week < state.week ? 'column1_prev' : 'column1']: e.target.value }, 'LINEUPS'))}
                    >
                        {
                            columnOptions
                                .filter(column => (
                                    week < state.week
                                        ? ![column2_prev, column3_prev, column4_prev].includes(column)
                                        : ![column2, column3, column4].includes(column)))
                                .map(column => {
                                    return <option key={column}>{column}</option>
                                })
                        }
                    </select>
                </label>,
                colSpan: 2,
                className: 'small half'
            },
            {
                text: <label className="select">
                    <p>{week < state.week ? column2_prev : column2}</p>
                    <select
                        value={week < state.week ? column2_prev : column2}
                        className="hidden_behind click"
                        onChange={(e) => dispatch(setState({ [week < state.week ? 'column2_prev' : 'column2']: e.target.value }, 'LINEUPS'))}
                    >
                        {
                            columnOptions
                                .filter(column => (
                                    week < state.week
                                        ? ![column1_prev, column3_prev, column4_prev].includes(column)
                                        : ![column1, column3, column4].includes(column)))
                                .map(column => {
                                    return <option key={column}>{column}</option>
                                })
                        }
                    </select></label>,
                colSpan: 2,
                className: 'small half'
            },
            {
                text: <label className="select">
                    <p>{week < state.week ? column3_prev : column3}</p>
                    <select
                        value={week < state.week ? column3_prev : column3}
                        className="hidden_behind click"
                        onChange={(e) => dispatch(setState({ [week < state.week ? 'column3_prev' : 'column3']: e.target.value }, 'LINEUPS'))}
                    >
                        {
                            columnOptions
                                .filter(column => (
                                    week < state.week
                                        ? ![column1_prev, column2_prev, column4_prev].includes(column)
                                        : ![column1, column2, column4].includes(column)))
                                .map(column => {
                                    return <option key={column}>{column}</option>
                                })
                        }
                    </select></label>,
                colSpan: 2,
                className: 'small half'
            },
            {
                text: <label className="select">
                    <p>{week < state.week ? column4_prev : column4}</p><select
                        value={week < state.week ? column4_prev : column4}
                        className="hidden_behind click"
                        onChange={(e) => dispatch(setState({ [week < state.week ? 'column4_prev' : 'column4']: e.target.value }, 'LINEUPS'))}
                    >
                        {
                            columnOptions
                                .filter(column => (
                                    week < state.week
                                        ? ![column1_prev, column2_prev, column3_prev].includes(column)
                                        : ![column1, column2, column3].includes(column)))
                                .map(column => {
                                    return <option key={column}>{column}</option>
                                })
                        }
                    </select></label>,
                colSpan: 2,
                className: 'small half end'
            }
        ]
    ]

    const players_headers = [
        [
            {
                text: 'Player',
                colSpan: 3,
                rowSpan: 2
            },
            {
                text: username,
                colSpan: 2
            },
            {
                text: 'Opp',
                colSpan: 2
            }
        ],
        [
            {
                text: 'Start',
                colSpan: 1,
                onClick: () => dispatch(setState({ sortBy: 'start' }, 'LINEUPS')),
            },
            {
                text: 'Bench',
                colSpan: 1,
                onClick: () => dispatch(setState({ sortBy: 'bench' }, 'LINEUPS'))
            },
            {
                text: 'Start',
                colSpan: 1,
                onClick: () => dispatch(setState({ sortBy: 'start_opp' }, 'LINEUPS'))
            },
            {
                text: 'Bench',
                colSpan: 1,
                onClick: () => dispatch(setState({ sortBy: 'bench_opp' }, 'LINEUPS'))
            }
        ]
    ]

    const getColumnValue = (header, matchup, lineup_check, league, opt_proj, act_proj) => {
        if (league.settings.status === 'in_season') {
            switch (header) {
                case 'Suboptimal':
                    return {
                        text: !matchup?.matchup_id || !lineup_check ? '-' : lineup_check.filter(x => x.notInOptimal).length > 0 ?
                            lineup_check.filter(x => x.notInOptimal).length :
                            '√',
                        colSpan: 2,
                        className: !matchup?.matchup_id || !lineup_check ? '' : lineup_check.filter(x => x.notInOptimal).length > 0 ?
                            'red' : 'green'
                    }
                case 'Early/Late Flex':
                    return {
                        text: !matchup?.matchup_id || !lineup_check
                            ? '-'
                            : lineup_check.filter(x => x.earlyInFlex).length + lineup_check.filter(x => x.lateNotInFlex).length > 0
                                ? lineup_check.filter(x => x.earlyInFlex).length + lineup_check.filter(x => x.lateNotInFlex).length
                                : '√',
                        colSpan: 2,
                        className: !matchup?.matchup_id || !lineup_check
                            ? ''
                            : lineup_check.filter(x => x.earlyInFlex).length + lineup_check.filter(x => x.lateNotInFlex).length > 0
                                ? 'red'
                                : 'green'
                    }
                case 'Open Taxi':
                    return {
                        text: (league.settings.taxi_slots > 0 && league.settings.best_ball !== 1)
                            ? league.settings.taxi_slots - (league.userRoster.taxi?.length || 0) > 0
                                ? league.settings.taxi_slots - (league.userRoster.taxi?.length || 0)
                                : '√'
                            : '-',
                        colSpan: 2,
                        className: (league.settings.taxi_slots > 0 && league.settings.best_ball !== 1)
                            ? league.settings.taxi_slots - (league.userRoster.taxi?.length || 0) > 0
                                ? 'red'
                                : 'green'
                            : ''
                    }
                case 'Non QB in SF':
                    return {
                        text: !matchup?.matchup_id || !lineup_check
                            ? '-'
                            : lineup_check.filter(x => x.nonQBinSF).length > 0
                                ? lineup_check.filter(x => x.nonQBinSF).length
                                : '√',
                        colSpan: 2,
                        className: !matchup?.matchup_id || !lineup_check
                            ? ''
                            : lineup_check.filter(x => x.nonQBinSF).length > 0
                                ? 'red'
                                : 'green'
                    }
                case 'Open Roster':
                    const user_active_players = league.userRoster.players.filter(p => !league.userRoster.taxi?.includes(p) && !league.userRoster.reserve?.includes(p))
                    return {
                        text: league.roster_positions.length !== user_active_players?.length
                            ? league.roster_positions.length - user_active_players?.length
                            : '√',
                        colSpan: 2,
                        className: league.roster_positions.length !== user_active_players?.length
                            ? 'red'
                            : 'green',
                    }
                case 'Open IR':
                    const total_ir = league.settings.reserve_slots
                    const used_ir = league.userRoster?.reserve?.length || 0
                    const open_ir = total_ir - used_ir;
                    const eligible_ir = league.userRoster.players?.filter(player_id => !league.userRoster.reserve?.includes(player_id)
                        && !league.userRoster.taxi?.includes(player_id)
                        && (
                            (league.settings.reserve_allow_sus === 1 && projections[week][player_id]?.injury_status === 'Sus')
                            || (league.settings.reserve_allow_doubtful === 1 && projections[week][player_id]?.injury_status === 'Doubtful')
                            || (league.settings.reserve_allow_out === 1 && projections[week][player_id]?.injury_status === 'Out')
                            || projections[week][player_id]?.injury_status === 'IR'
                        )
                    ).length
                    return {
                        text: (open_ir > 0 && eligible_ir > 0)
                            ? Math.min(eligible_ir, open_ir)
                            : '√',
                        colSpan: 2,
                        className: (open_ir > 0 && eligible_ir > 0)
                            ? 'red'
                            : 'green',
                    }
                case 'Out':
                    return {
                        text: !matchup?.matchup_id || !lineup_check
                            ? '-'
                            : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Out').length > 0
                                ? lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Out').length
                                : '√',
                        colSpan: 2,
                        className: !matchup?.matchup_id || !lineup_check
                            ? ''
                            : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Out').length > 0
                                ? 'red'
                                : 'green'
                    }
                case 'Doubtful':
                    return {
                        text: !matchup?.matchup_id || !lineup_check
                            ? '-'
                            : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Doubtful').length > 0
                                ? lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Doubtful').length
                                : '√',
                        colSpan: 2,
                        className: !matchup?.matchup_id || !lineup_check
                            ? ''
                            : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Doubtful').length > 0
                                ? 'red'
                                : 'green'
                    }
                case 'Ques':
                    return {
                        text: !matchup?.matchup_id || !lineup_check
                            ? '-'
                            : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Questionable').length > 0
                                ? lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Questionable').length
                                : '√',
                        colSpan: 2,
                        className: !matchup?.matchup_id || !lineup_check
                            ? ''
                            : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Questionable').length > 0
                                ? 'red'
                                : 'green'
                    }
                case 'IR':
                    return {
                        text: !matchup?.matchup_id || !lineup_check
                            ? '-'
                            : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'IR').length > 0
                                ? lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'IR').length
                                : '√',
                        colSpan: 2,
                        className: !matchup?.matchup_id || !lineup_check
                            ? ''
                            : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'IR').length > 0
                                ? 'red'
                                : 'green'
                    }
                case 'Sus':
                    return {
                        text: !matchup?.matchup_id || !lineup_check
                            ? '-'
                            : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Sus').length > 0
                                ? lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Sus').length
                                : '√',
                        colSpan: 2,
                        className: !matchup?.matchup_id || !lineup_check
                            ? ''
                            : lineup_check.filter(x => projections[week][x.current_player]?.injury_status === 'Sus').length > 0
                                ? 'red'
                                : 'green'
                    }
                case 'Opt-Act':
                    return {
                        text: opt_proj === act_proj
                            ? '√'
                            : (act_proj - opt_proj).toFixed(2),
                        colSpan: 2,
                        className: opt_proj === act_proj
                            ? 'green'
                            : 'red'
                    }
                default:
                    return {
                        text: '-',
                        colSpan: 2
                    }
            }
        } else {
            return {
                text: '-',
                colSpan: 2
            }
        }
    }

    const getColumnValuePrev = (column, league_id, matchup_user, matchup_opp) => {
        const proj_score_user_actual = lineupChecks[week]?.[league_id]?.lc_user?.proj_score_actual;
        const proj_score_opp_actual = lineupChecks[week]?.[league_id]?.lc_opp?.proj_score_actual;

        const bench_points = matchup_user?.players
            ?.filter(player_id => !matchup_user.starters.includes(player_id))
            ?.reduce((acc, cur) => acc + matchup_user.players_points[cur], 0)

        const total_points = matchup_user?.players
            ?.reduce((acc, cur) => acc + matchup_user.players_points[cur], 0)

        switch (column) {
            case 'For':
                return {
                    text: matchup_user?.points?.toFixed(1),
                    colSpan: 2
                };
            case 'Against':
                return {
                    text: matchup_opp?.points?.toFixed(1),
                    colSpan: 2
                };
            case 'Optimal For':
                return {
                    text: proj_score_user_actual?.toFixed(1),
                    colSpan: 2
                };
            case 'Optimal Against':
                return {
                    text: proj_score_opp_actual?.toFixed(1),
                    colSpan: 2
                };
            case 'Bench Points':
                return {
                    text: bench_points?.toFixed(1) || '-',
                    colSpan: 2
                }
            case 'Total Points':
                return {
                    text: total_points?.toFixed(1) || '-',
                    colSpan: 2
                }
            default:
                return {
                    text: '-',
                    colSpan: 2
                }
        }
    }


    const lineups_body = filterLeagues(leagues, type1, type2)
        ?.filter(l => !searched.id || searched.id === l.league_id)
        ?.map(league => {
            if (week >= state.week) {
                const lineup_check_user = lineupChecks[week]?.[hash]?.[league.league_id]?.lc_user?.lineup_check;

                const matchup_user = lineupChecks[week]?.[hash]?.[league.league_id]?.lc_user?.matchup;
                const optimal_lineup = lineupChecks[week]?.[hash]?.[league.league_id]?.lc_user?.optimal_lineup

                const proj_score_user_optimal = lineupChecks[week]?.[hash]?.[league.league_id]?.lc_user?.proj_score_optimal;
                const proj_score_user_actual = lineupChecks[week]?.[hash]?.[league.league_id]?.lc_user?.proj_score_actual;

                const lineup_check_opp = lineupChecks[week]?.[hash]?.[league.league_id]?.lc_opp?.lineup_check;

                const matchup_opp = lineupChecks[week]?.[hash]?.[league.league_id]?.lc_opp?.matchup;
                const optimal_lineup_opp = lineupChecks[week]?.[hash]?.[league.league_id]?.lc_opp?.optimal_lineup

                const proj_score_opp_optimal = lineupChecks[week]?.[hash]?.[league.league_id]?.lc_opp?.proj_score_optimal;
                const proj_score_opp_actual = lineupChecks[week]?.[hash]?.[league.league_id]?.lc_opp?.proj_score_actual;

                const players_projections = {
                    ...lineupChecks[week]?.[hash]?.[league.league_id]?.lc_user?.players_projections,
                    ...lineupChecks[week]?.[hash]?.[league.league_id]?.lc_opp?.players_projections
                }

                return {
                    id: league.league_id,
                    search: {
                        text: league.name,
                        image: {
                            src: league.avatar,
                            alt: league.name,
                            type: 'league'
                        }
                    },
                    list: [
                        {
                            text: league.name,
                            colSpan: 6,
                            className: 'left',
                            image: {
                                src: league.avatar,
                                alt: league.name,
                                type: 'league'
                            }
                        },
                        {
                            text: <>
                                {
                                    (lineupChecks[week]?.[hash]?.[league.league_id]?.lc_user && lineupChecks[week]?.[hash]?.[league.league_id]?.lc_opp)
                                        ? proj_score_user_optimal > proj_score_opp_optimal
                                            ? 'W'
                                            : proj_score_user_optimal < proj_score_opp_optimal
                                                ? 'L'
                                                : '-'
                                        : '-'
                                }
                                {
                                    lineupChecks[week]?.[hash]?.[league.league_id]?.median_win > 0
                                    && <i className="fa-solid fa-trophy"></i>
                                }
                            </>,
                            colSpan: 1,
                            className: (lineupChecks[week]?.[hash]?.[league.league_id]?.lc_user && lineupChecks[week]?.[hash]?.[league.league_id]?.lc_opp)
                                ? proj_score_user_optimal > proj_score_opp_optimal
                                    ? 'greenb'
                                    : proj_score_user_optimal < proj_score_opp_optimal
                                        ? 'redb'
                                        : '-'
                                : '-',
                        },
                        {
                            ...getColumnValue(column1, matchup_user, lineup_check_user, league, proj_score_user_optimal, proj_score_user_actual)
                        },
                        {
                            ...getColumnValue(column2, matchup_user, lineup_check_user, league, proj_score_user_optimal, proj_score_user_actual)
                        },
                        {
                            ...getColumnValue(column3, matchup_user, lineup_check_user, league, proj_score_user_optimal, proj_score_user_actual)
                        },
                        {
                            ...getColumnValue(column4, matchup_user, lineup_check_user, league, proj_score_user_optimal, proj_score_user_actual)
                        }
                    ],
                    secondary_table: <Lineups2Main
                        league={league}
                        matchup_user={matchup_user}
                        matchup_opp={matchup_opp}
                        lineup_check={lineup_check_user}
                        lineup_check_opp={lineup_check_opp}
                        optimal_lineup={optimal_lineup}
                        optimal_lineup_opp={optimal_lineup_opp}
                        players_projections={players_projections}
                        proj_score_user_actual={proj_score_user_actual}
                        proj_score_user_optimal={proj_score_user_optimal}
                        proj_score_opp_actual={proj_score_opp_actual}
                        proj_score_opp_optimal={proj_score_opp_optimal}
                    />
                }
            } else {
                const lc_league = week < state.week ? lineupChecks[week]?.[league.league_id] : lineupChecks[week]?.[hash]?.[league.league_id]
                const matchup_user = lc_league?.lc_user?.matchup;
                const matchup_opp = lc_league?.lc_opp?.matchup;

                const players_projections = {
                    ...lineupChecks[week]?.[league.league_id]?.lc_user?.players_projections,
                    ...lineupChecks[week]?.[league.league_id]?.lc_opp?.players_projections
                }

                return {
                    id: league.league_id,
                    search: {
                        text: league.name,
                        image: {
                            src: league.avatar,
                            alt: league.name,
                            type: 'league'
                        }
                    },
                    list: [
                        {
                            text: league.name,
                            colSpan: 6,
                            className: 'left',
                            image: {
                                src: league.avatar,
                                alt: league.name,
                                type: 'league'
                            }
                        },
                        {
                            text: <>

                                {

                                    lc_league?.win
                                        ? 'W'
                                        : lc_league?.loss
                                            ? 'L'
                                            : lc_league?.tie
                                                ? 'T'
                                                : '-'

                                }
                                {
                                    lc_league?.median_win === 1
                                        ? <i className="fa-solid fa-trophy"></i>
                                        : lc_league?.median_loss === 1
                                            ? <i className="fa-solid fa-poop"></i>
                                            : null
                                }
                            </>,
                            colSpan: 1,
                            className: lc_league?.win
                                ? 'greenb'
                                : lc_league?.loss
                                    ? 'redb'
                                    : lc_league?.tie
                                        ? '-'
                                        : '-'
                        },
                        {
                            ...getColumnValuePrev(column1_prev, league.league_id, matchup_user, matchup_opp)
                        },
                        {
                            ...getColumnValuePrev(column2_prev, league.league_id, matchup_user, matchup_opp)
                        },
                        {
                            ...getColumnValuePrev(column3_prev, league.league_id, matchup_user, matchup_opp)
                        },
                        {
                            ...getColumnValuePrev(column4_prev, league.league_id, matchup_user, matchup_opp)
                        }
                    ],
                    secondary_table: <Lineups2Main
                        league={league}
                        matchup_user={matchup_user}
                        matchup_opp={matchup_opp}
                        players_projections={players_projections}
                    />
                }
            }
        })


    const players_body = Object.keys(playerLineupDict)
        .sort((a, b) => filterLeagues(playerLineupDict[b][sortBy], type1, type2).length - filterLeagues(playerLineupDict[a][sortBy], type1, type2).length)
        .map(player_id => {
            const start = filterLeagues(playerLineupDict[player_id]?.start || [], type1, type2)
            const bench = filterLeagues(playerLineupDict[player_id]?.bench || [], type1, type2)
            const start_opp = filterLeagues(playerLineupDict[player_id]?.start_opp || [], type1, type2)
            const bench_opp = filterLeagues(playerLineupDict[player_id]?.bench_opp || [], type1, type2)

            return {
                id: player_id,
                search: {
                    text: allplayers[player_id]?.full_nam,
                    image: {
                        src: player_id,
                        alt: 'player',
                        type: 'player'
                    }
                },
                list: [
                    {
                        text: allplayers[player_id]?.full_name,
                        image: {
                            src: player_id,
                            alt: 'player',
                            type: 'player'
                        },
                        className: 'left',
                        colSpan: 3
                    },
                    {
                        text: start.length.toString(),
                        colSpan: 1
                    },
                    {
                        text: bench.length.toString(),
                        colSpan: 1
                    },
                    {
                        text: start_opp.length.toString(),
                        colSpan: 1
                    },
                    {
                        text: bench_opp.length.toString(),
                        colSpan: 1
                    }
                ]
            }
        })


    const projectedRecord = week >= state.week
        ? filterLeagues((leagues || []), type1, type2)
            .reduce((acc, cur) => {
                const lc_league = lineupChecks[week]?.[hash]?.[cur.league_id]
                const proj_score = parseFloat(lc_league?.lc_user?.[`proj_score_${recordType}`]);
                const proj_score_opp = parseFloat(lc_league?.lc_opp?.[`proj_score_${recordType}`]);


                let wins = (lc_league?.win || 0) + (lc_league?.median_win || 0)
                let losses = (lc_league?.loss || 0) + (lc_league?.median_loss || 0)
                let ties = lc_league?.tie || 0



                return {
                    wins: acc.wins + wins,
                    losses: acc.losses + losses,
                    ties: acc.ties + ties,
                    fpts: acc.fpts + (proj_score || 0),
                    fpts_against: acc.fpts_against + (proj_score_opp || 0),
                }
            }, {
                wins: 0,
                losses: 0,
                ties: 0,
                fpts: 0,
                fpts_against: 0
            })
        : filterLeagues((leagues || []), type1, type2)
            .reduce((acc, cur) => {
                const score = lineupChecks[week]?.[cur.league_id]?.lc_user?.matchup?.points || 0;
                const score_opp = lineupChecks[week]?.[cur.league_id]?.lc_opp?.matchup?.points || 0;

                let wins = (lineupChecks[week]?.[cur.league_id]?.win || 0) + (lineupChecks[week]?.[cur.league_id]?.median_win || 0);
                let losses = (lineupChecks[week]?.[cur.league_id]?.loss || 0) + (lineupChecks[week]?.[cur.league_id]?.median_loss || 0);
                let ties = lineupChecks[week]?.[cur.league_id]?.tie || 0


                return {
                    wins: acc.wins + wins,
                    losses: acc.losses + losses,
                    ties: acc.ties + ties,
                    fpts: acc.fpts + score,
                    fpts_against: acc.fpts_against + score_opp,
                }
            }, {
                wins: 0,
                losses: 0,
                ties: 0,
                fpts: 0,
                fpts_against: 0
            })


    return (week < state.week && !lineupChecks?.[week])
        || (week >= state.week && !lineupChecks?.[week]?.[hash])
        ? loadingIcon
        : <>
            <h1>
                Week <select
                    value={week}
                    onChange={(e) => dispatch(setState({ week: e.target.value }, 'LINEUPS'))}
                >
                    {
                        Array.from(Array(18).keys()).map(key =>
                            <option key={key + 1}>{key + 1}</option>
                        )
                    }
                </select>
            </h1>
            <h2>
                <select
                    value={primaryContent}
                    onChange={(e) => dispatch(setState({ primaryContent: e.target.value }, 'LINEUPS'))}
                >
                    <option>Lineup Check</option>
                    <option>Starters/Bench</option>
                </select>
            </h2>
            <h2>
                <table className="summary">
                    <tbody>
                        <tr>
                            <th>Type</th>
                            <td>
                                <select
                                    className={'record_type'}
                                    value={recordType}
                                    onChange={(e) => dispatch(setState({ recordType: e.target.value }, 'LINEUPS'))}
                                    disabled={week < state.week}
                                >
                                    <option value={'actual'}>Actual Proj</option>
                                    <option value={'optimal'}>Optimal Proj</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>Record</th>
                            <td>{projectedRecord?.wins}-{projectedRecord?.losses}{projectedRecord?.ties > 0 && `-${projectedRecord.ties}`}</td>
                        </tr>
                        <tr>
                            <th>Points For</th>
                            <td>{projectedRecord?.fpts?.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                        </tr>
                        <tr>
                            <th>Points Against</th>
                            <td>{projectedRecord?.fpts_against?.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                        </tr>
                    </tbody>
                </table>


            </h2>
            {
                primaryContent === 'Lineup Check'
                    ? <TableMain
                        id={'Lineups'}
                        type={'primary'}
                        headers={lineups_headers}
                        body={lineups_body}
                        page={page}
                        setPage={(value) => dispatch(setState({ page: value }, 'LINEUPS'))}
                        itemActive={itemActive}
                        setItemActive={(value) => dispatch(setState({ itemActive: value }, 'LINEUPS'))}
                        search={true}
                        searched={searched}
                        setSearched={(value) => dispatch(setState({ searched: value }, 'LINEUPS'))}
                        options2={[includeLockedIcon(includeLocked, (value) => dispatch(setState({ includeLocked: value }, 'LINEUPS')))]}
                        options1={[includeTaxiIcon(includeTaxi, (value) => dispatch(setState({ includeTaxi: value }, 'LINEUPS')))]}
                    />
                    : <TableMain
                        id={'Lineups'}
                        type={'primary'}
                        headers={players_headers}
                        body={players_body}
                    />
            }

        </>
}

export default LineupsView;