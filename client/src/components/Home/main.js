import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetState, setState } from '../../redux/actions/state';
import { fetchUser, fetchLeagues, fetchFilteredData } from "../../redux/actions/fetchUser";
import { loadingIcon } from '../../functions/misc';
import Heading from "./heading";
import { fetchMain } from "../../redux/actions/fetchMain";
import Players from "../Players/players";
import Leagues from "../Leagues/leagues";
import Lineups from "../Lineups/lineups";
import Leaguemates from "../Leaguemates/leaguemates";
import { fetchMatchups } from "../../redux/actions/fetchMatchups";

const Main = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { user_id, username, leagues, matchups, isLoadingUser, isLoadingLeagues, isLoadingMatchups, syncing } = useSelector(state => state.user);
    const { state, tab, allplayers, schedule, projections } = useSelector(state => state.main);
    const { filteredData } = useSelector(state => state.filteredData);
    const {
        includeTaxi,
        includeLocked,
        week,
        lineupChecks,
        rankings,
        recordType,
        isLoadingProjectionDict
    } = useSelector(state => state.lineups);
    const { recordType: recordTypeLeagues } = useSelector(state => state.leagues);

    if (leagues) {
        console.log({ leagues })
    }
    console.log({ syncing, isLoadingProjectionDict })
    useEffect(() => {
        // Fetch allplayers, schedule, projections only on load if they don't exist

        if (!allplayers) {
            dispatch(fetchMain('allplayers'));
        };

        if (!schedule) {
            dispatch(fetchMain('schedule'));
        };

        if (!projections) {
            dispatch(fetchMain('projections'));
        };
    }, [])
    useEffect(() => {
        const minute = new Date().getMinutes()
        const delay = (15 - (minute % 15)) * 60 * 1000;

        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                dispatch(fetchMain('projections'));
            }, 15 * 60 * 1000)

            return () => {
                clearInterval(interval);
            };
        }, delay)

        return () => {
            clearTimeout(timeout);
        }
    }, [])

    useEffect(() => {
        // Reset state everytime searched user changes

        dispatch(resetState);
    }, [params.username, dispatch])

    useEffect(() => {
        if (username?.toLowerCase() !== params.username?.toLowerCase()) {
            dispatch(fetchUser(params.username));
        }
    }, [username, params.username, dispatch])

    useEffect(() => {
        if (user_id && !leagues) {
            dispatch(fetchLeagues(user_id))
        }
    }, [dispatch, user_id, leagues])

    useEffect(() => {
        if (leagues) {
            dispatch(fetchFilteredData(leagues, tab, state.league_season));

            if (!matchups) {
                dispatch(fetchMatchups())
            }
        }


    }, [leagues, tab, state, matchups, dispatch])

    const weeks = Array.from(Array(18).keys()).map(key => key + 1)
        .filter(key => {
            if (key < state.week) {
                return !lineupChecks[key]
            } else {
                return !lineupChecks[key]?.['true-true']
            }
        })





    useEffect(() => {
        const getProjectedRecords = (weeks_to_fetch, includeTaxi, includeLocked, league_ids) => {

            if (!isLoadingProjectionDict) {
                dispatch(setState({ isLoadingProjectionDict: true }, 'LINEUPS'));
                const worker = new Worker('/getRecordDictWeekWorker.js')

                console.log({ weeks_to_fetch })

                worker.postMessage({ weeks_to_fetch, state, leagues, allplayers, schedule, projections, includeTaxi, includeLocked, rankings, user_id, recordType, league_ids })

                const result_dict = {};
                worker.onmessage = (e) => {
                    const result = e.data;

                    if (result.week < state.week) {
                        console.log({ result_dict })
                        result_dict[result.week] = {
                            ...lineupChecks[result.week],
                            ...result.projectedRecordWeek
                        };

                        dispatch(setState({ lineupChecks: { ...lineupChecks, ...result_dict } }, 'LINEUPS'));
                    } else {
                        result_dict[result.week] = {
                            ...lineupChecks[result.week],
                            [`${includeTaxi}-${includeLocked}`]: {
                                ...lineupChecks[result.week]?.[`${includeTaxi}-${includeLocked}`],
                                ...result.projectedRecordWeek
                            }
                        };

                        dispatch(setState({ lineupChecks: { ...lineupChecks, ...result_dict } }, 'LINEUPS'));
                    }
                    const lc_keys = Object.keys(lineupChecks).filter(key => lineupChecks[key][`${includeTaxi}-${includeLocked}`])

                    const weeks_remaining = weeks_to_fetch
                        .find(w => w !== result.week && !lc_keys.includes(w));

                    console.log({ weeks_remaining })


                    dispatch(setState({ isLoadingProjectionDict: false }, 'LINEUPS'));
                    syncing && dispatch(setState({ syncing: false }, 'USER'));
                    return () => worker.terminate();

                }
            }

        }
        if (leagues && allplayers && schedule && projections && matchups) {

            if (
                tab === 'lineups'
                && (
                    (week < state.week && (!lineupChecks[week] || (lineupChecks[week] && Object.keys(lineupChecks[week]).find(key => lineupChecks[week][key]?.edited === true))))
                    || (week >= state.week && (!lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`] || Object.keys(lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`]).find(key => lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`]?.[key]?.edited === true)))
                )
            ) {
                const league_ids = (week < state.week && lineupChecks[week])
                    ? Object.keys(lineupChecks[week]).filter(key => lineupChecks[week][key]?.edited === true)
                    : (week >= state.week && lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`])
                        ? Object.keys(lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`]).find(key => lineupChecks[week]?.[`${includeTaxi}-${includeLocked}`]?.[key]?.edited === true)
                        : false

                console.log(`Syncing ${league_ids}`)
                getProjectedRecords([week], includeTaxi, includeLocked, league_ids)
            } else if (tab === 'leagues' && recordTypeLeagues === 'Projected Record' && weeks.length > 0 && !isLoadingProjectionDict) {
                console.log('Getting proj record ALL..')
                getProjectedRecords([weeks[0]], true, true)
            }


        }
    }, [leagues, week, state, allplayers, schedule, projections, dispatch, includeLocked, includeTaxi, lineupChecks, rankings, user_id, recordType, isLoadingProjectionDict, matchups, tab, recordTypeLeagues])


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



    let display;

    switch (tab) {
        case 'players':
            display = <Players />
            break;
        case 'leagues':
            display = <Leagues />
            break;
        case 'leaguemates':
            display = <Leaguemates />
            break;
        case 'lineups':
            display = (isLoadingMatchups || !(allplayers && schedule && projections)) ? loadingIcon : <Lineups />
            break;
        default:
            break;
    }

    return <>
        {
            isLoadingUser
                ? loadingIcon
                : <>
                    <Heading />
                    {
                        (isLoadingLeagues || !filteredData[tab])
                            ? loadingIcon
                            : display
                    }
                </>
        }
    </>
}

export default Main;