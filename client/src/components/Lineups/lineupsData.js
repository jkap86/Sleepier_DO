import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setState } from "../../redux/actions/state";
import { getRecordDict } from "../../functions/getRecordDict";
import { fetchMain } from "../../redux/actions/fetchMain";
import { fetchMatchups } from "../../redux/actions/fetchMatchups";

const LineupsData = () => {
    const dispatch = useDispatch();
    const { state, tab, allplayers, schedule, projections } = useSelector(state => state.main)
    const { user_id, leagues, matchups, syncing, isLoadingMatchups } = useSelector(state => state.user);
    const {
        includeTaxi,
        includeLocked,
        week,
        lineupChecks,
        rankings,
        recordType,
        isLoadingProjectionDict,
        itemActive2
    } = useSelector(state => state.lineups);


    console.log({ schedule })
    useEffect(() => {
        if (!schedule || !projections || (!matchups && !isLoadingMatchups)) {
            if (!schedule) {
                dispatch(fetchMain('schedule'));
            } else if (!matchups && !isLoadingMatchups) {
                dispatch(fetchMatchups())
            } else if (!projections) {
                dispatch(fetchMain('projections'))
            }

        } else {
            const player_lineup_dict = {};

            leagues
                .forEach(league => {
                    const matchup_user = league[`matchups_${week}`]?.find(m => m.roster_id === league.userRoster.roster_id);
                    const matchup_opp = league[`matchups_${week}`]?.find(m => m.matchup_id === matchup_user.matchup_id && m.roster_id !== matchup_user.roster_id);

                    matchup_user?.players
                        ?.forEach(player_id => {
                            if (!player_lineup_dict[player_id]) {
                                player_lineup_dict[player_id] = {
                                    start: [],
                                    bench: [],
                                    start_opp: [],
                                    bench_opp: []
                                }
                            }

                            if (matchup_user.starters?.includes(player_id)) {
                                player_lineup_dict[player_id].start.push(league)
                            } else {
                                player_lineup_dict[player_id].bench.push(league)
                            }
                        })

                    matchup_opp?.players
                        ?.forEach(player_id => {
                            if (!player_lineup_dict[player_id]) {
                                player_lineup_dict[player_id] = {
                                    start: [],
                                    bench: [],
                                    start_opp: [],
                                    bench_opp: []
                                }
                            }

                            if (matchup_opp.starters?.includes(player_id)) {
                                player_lineup_dict[player_id].start_opp.push(league)
                            } else {
                                player_lineup_dict[player_id].bench_opp.push(league)
                            }
                        })
                })

            dispatch(setState({ playerLineupDict: player_lineup_dict }, 'LINEUPS'));
        }

    }, [leagues, matchups, week, isLoadingMatchups, schedule, projections, dispatch])



    const weeks = Array.from(Array(18).keys()).map(key => key + 1)
        .filter(key => {
            if (key < state.week) {
                return !lineupChecks[key]
            } else {
                return !lineupChecks[key]?.['true-true']
            }
        })

    useEffect(() => {
        const getProjectedRecords = (week_to_fetch, includeTaxi, includeLocked, league_ids) => {


            dispatch(setState({ isLoadingProjectionDict: true }, 'LINEUPS'));

            const worker = new Worker('/getRecordDictWeekWorker.js')



            const result = getRecordDict({ week_to_fetch, state, leagues, allplayers, schedule, projections, includeTaxi, includeLocked, rankings, user_id, recordType, league_ids })




            if (result.week < state.week) {

                dispatch(setState({
                    lineupChecks: {
                        ...lineupChecks,
                        [result.week]: {
                            ...lineupChecks[result.week],
                            ...result.projectedRecordWeek
                        }
                    }
                }, 'LINEUPS'))



            } else {
                console.log({ result })
                dispatch(setState({
                    lineupChecks: {
                        ...lineupChecks,
                        [result.week]: {
                            ...lineupChecks[result.week],
                            [`${includeTaxi}-${includeLocked}`]: {
                                ...lineupChecks[result.week]?.[`${includeTaxi}-${includeLocked}`],
                                ...result.projectedRecordWeek
                            }
                        }
                    }
                }, 'LINEUPS'));
            }
        }


        if (leagues && allplayers && schedule && projections && matchups) {

            if (
                (
                    (week < state.week && (!lineupChecks[week] || (lineupChecks[week] && Object.keys(lineupChecks[week]).find(key => lineupChecks[week][key]?.edited === true))))
                    || (week >= state.week && (!lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`] || Object.keys(lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`]).find(key => lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`]?.[key]?.edited === true)))
                )
                && !isLoadingProjectionDict
            ) {
                const league_ids = syncing
                    ? [syncing.league_id]
                    : (week < state.week && lineupChecks[week])
                        ? Object.keys(lineupChecks[week]).filter(key => lineupChecks[week][key]?.edited === true)
                        : (week >= state.week && lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`])
                            ? Object.keys(lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`]).find(key => lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`]?.[key]?.edited === true)
                            : false

                console.log(`Syncing ${league_ids}`)
                getProjectedRecords(week, includeTaxi, includeLocked, league_ids)
            }


        }
    }, [leagues, week, weeks, state, allplayers, schedule, projections, dispatch, includeLocked, includeTaxi, lineupChecks, rankings, user_id, recordType, isLoadingProjectionDict, matchups, lineupChecks])

    useEffect(() => {
        if (isLoadingProjectionDict) {
            if (
                (
                    (week < state.week && (lineupChecks[week] && !(lineupChecks[week] && Object.keys(lineupChecks[week]).find(key => lineupChecks[week][key]?.edited === true))))
                    || (week >= state.week && (lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`] && !Object.keys(lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`]).find(key => lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`]?.[key]?.edited === true)))
                )
            ) {
                dispatch(setState({ isLoadingProjectionDict: false }, 'LINEUPS'));
                syncing && dispatch(setState({ syncing: false }, 'USER'));
            }
        }
    }, [dispatch, isLoadingProjectionDict, week, state, lineupChecks, includeTaxi, includeLocked, syncing, weeks])

    useEffect(() => {
        const lc_weeks = Object.keys(lineupChecks)

        if (lc_weeks.length === 18 && !lc_weeks.includes('totals')) {
            console.log('Getting Totals...')
            const season_totals_all = {};

            leagues
                .filter(league => league.settings.status === 'in_season')
                .forEach(league => {
                    const league_season_totals = {};

                    league.rosters
                        .forEach(roster => {

                            const roster_season_totals = Object.keys(lineupChecks)
                                .filter(key => parseInt(key) >= league.settings.start_week && parseInt(key) < league.settings.playoff_week_start)
                                .reduce((acc, cur) => {
                                    const cur_roster = lineupChecks[cur]?.['true-true']?.[league.league_id]?.standings?.[roster.roster_id]
                                    return {
                                        wins: acc.wins + (cur_roster?.wins || 0),
                                        losses: acc.losses + (cur_roster?.losses || 0),
                                        ties: acc.ties + (cur_roster?.ties || 0),
                                        fp: acc.fp + (cur_roster?.fp || 0),
                                        fpa: acc.fpa + (cur_roster?.fpa || 0)
                                    }
                                }, {
                                    wins: roster.settings.wins,
                                    losses: roster.settings.losses,
                                    ties: roster.settings.ties,
                                    fp: parseFloat(roster.settings.fpts + '.' + (roster.settings.fpts_decimal || 0)),
                                    fpa: parseFloat(roster.settings.fpts_against + '.' + (roster.settings.fpts_against_decimal || 0))
                                })

                            league_season_totals[roster.roster_id] = {
                                ...roster_season_totals,
                                user_id: roster.user_id,
                                username: roster.username,
                                avatar: roster.avatar
                            }

                        })

                    season_totals_all[league.league_id] = league_season_totals
                })

            dispatch(
                setState({
                    lineupChecks: {
                        ...lineupChecks,
                        totals: season_totals_all
                    }
                }, 'LINEUPS')
            )
        }
    }, [dispatch, lineupChecks])

    useEffect(() => {
        if (itemActive2) {
            dispatch(setState({ secondaryContent: 'Options' }, 'LINEUPS'));
        } else {
            dispatch(setState({ secondaryContent: 'Optimal' }, 'LINEUPS'));
        }
    }, [itemActive2, dispatch])

    return <></>
}

export default LineupsData;