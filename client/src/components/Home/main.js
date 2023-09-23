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
import { getLineupCheck } from '../../functions/getLineupCheck';

const Main = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { user_id, leagues, matchups, isLoadingUser, isLoadingLeagues, isLoadingMatchups } = useSelector(state => state.user);
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

    const hash = `${includeTaxi}-${includeLocked}`;

    useEffect(() => {
        if (!allplayers) {
            dispatch(fetchMain('allplayers'));
        };

        if (!schedule) {
            dispatch(fetchMain('schedule'));
        };

        if (!projections) {
            dispatch(fetchMain('projections'));
        };
    }, [tab, allplayers, schedule, projections, dispatch])

    useEffect(() => {
        dispatch(resetState);
    }, [params.username, dispatch])

    useEffect(() => {
        if (!user_id) {
            dispatch(fetchUser(params.username));
        } else {
            dispatch(fetchLeagues(user_id))
        }
    }, [user_id, params.username, dispatch])

    useEffect(() => {
        if (leagues) {
            dispatch(fetchFilteredData(leagues, tab, state.league_season));
        }

        if (!matchups) {
            dispatch(fetchMatchups())
        }
    }, [leagues, tab, state, matchups, dispatch])

    useEffect(() => {
        if (leagues && allplayers && schedule && projections && matchups) {

            let lineupChecks_week;

            const getLineupChecksPrevWeek = (week, leagues) => {
                lineupChecks_week = {};

                leagues
                    .filter(league => league[`matchups_${week}`])
                    .map(league => {
                        const matchup_user = league[`matchups_${week}`].find(m => m.roster_id === league.userRoster.roster_id);
                        const matchup_opp = league[`matchups_${week}`].find(m => m.matchup_id === matchup_user.matchup_id && m.roster_id !== league.userRoster.roster_id)

                        const lc_user = matchup_user && getLineupCheck(matchup_user, league, allplayers, rankings, projections[week], schedule[week], includeTaxi, includeLocked)
                        const lc_opp = matchup_opp && getLineupCheck(matchup_opp, league, allplayers, rankings, projections[week], schedule[week], includeTaxi, includeLocked)

                        const pts_rank = league[`matchups_${week}`]
                            ?.sort((a, b) => b.points - a.points)
                            ?.findIndex(matchup => {
                                return matchup.matchup_id === league.userRoster.roster_id
                            })

                        const median_win = league.settings.league_average_match === 1
                            && pts_rank + 1 >= (league.rosters.length / 2)
                            ? 1
                            : 0

                        return lineupChecks_week[league.league_id] = {
                            name: league.name,
                            avatar: league.avatar,
                            lc_user: lc_user,
                            lc_opp: lc_opp,
                            median_win: median_win
                        }
                    })

                return lineupChecks_week
            }

            const getLineupChecksWeek = (week, leagues) => {
                lineupChecks_week = {};

                leagues
                    .filter(league => league[`matchups_${week}`])
                    .forEach(league => {
                        const roster_id = league.rosters
                            .find(roster => roster.user_id === user_id)?.roster_id

                        const matchup_user = league[`matchups_${week}`]
                            .find(m => m.roster_id === roster_id)

                        const matchup_opp = league[`matchups_${week}`]
                            .find(m => m.matchup_id === matchup_user.matchup_id && m.roster_id !== roster_id)

                        const lc_user = matchup_user && getLineupCheck(matchup_user, league, allplayers, rankings, projections[week], schedule[week], includeTaxi, includeLocked)
                        const lc_opp = matchup_opp && getLineupCheck(matchup_opp, league, allplayers, rankings, projections[week], schedule[week], includeTaxi, includeLocked)

                        const standings = league[`matchups_${week}`]
                            ?.map(matchup => {
                                return matchup && getLineupCheck(matchup, league, allplayers, rankings, projections[week], schedule[week], includeTaxi, includeLocked)
                            })
                            ?.sort((a, b) => b[`proj_score_${recordType}`] - a[`proj_score_${recordType}`])

                        const pts_rank = standings
                            ?.findIndex(lc => {
                                return lc.matchup.roster_id === roster_id
                            })

                        const median_win = league.settings.league_average_match === 1
                            && pts_rank + 1 <= (league.rosters.length / 2)
                            ? 1
                            : 0

                        const median_loss = league.settings.league_average_match === 1
                            && pts_rank + 1 >= (league.rosters.length / 2)
                            ? 1
                            : 0

                        lineupChecks_week[league.league_id] = {
                            name: league.name,
                            avatar: league.avatar,
                            lc_user: lc_user,
                            lc_opp: lc_opp,
                            median_win: median_win,
                            median_loss: median_loss,
                            standings: Object.fromEntries(
                                standings.map(s => {
                                    const opp = standings.find(s2 => s2.matchup.matchup_id === s.matchup.matchup_id && s2.matchup.roster_id !== s.matchup.roster_id)
                                    return [
                                        s.matchup.roster_id,
                                        {
                                            wins: (s.proj_score_optimal > opp.proj_score_optimal ? 1 : 0)
                                                + median_win,
                                            losses: (s.proj_score_optimal < opp.proj_score_optimal ? 1 : 0)
                                                + median_loss,
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


            if (week < state.display_week && leagues.find(league => !lineupChecks[week]?.[league.league_id])) {
                lineupChecks_week = getLineupChecksPrevWeek(week, leagues.filter(league => !lineupChecks[week]?.[hash]?.[league.league_id]))

                dispatch(
                    setState(
                        {
                            lineupChecks: {
                                ...lineupChecks,
                                [week]: lineupChecks_week
                            }
                        }, 'LINEUPS'
                    )
                )

            } else if (week >= state.display_week && leagues.find(league => !lineupChecks[week]?.[hash]?.[league.league_id])) {


                lineupChecks_week = getLineupChecksWeek(week, leagues.filter(league => !lineupChecks[week]?.[hash]?.[league.league_id]))

                dispatch(
                    setState(
                        {
                            lineupChecks: {
                                ...lineupChecks,
                                [week]: {
                                    ...lineupChecks[week],
                                    [hash]: lineupChecks_week
                                }
                            }
                        }, 'LINEUPS'
                    )
                )
            } else if (!isLoadingProjectionDict) {
                dispatch(setState({ isLoadingProjectionDict: true }, 'LINEUPS'));
                const worker = new Worker('/getRecordDictWeekWorker.js')

                const weeks = Array.from(Array(18).keys()).map(key => key + 1)
                    .filter(key => {
                        if (key < state.display_week) {
                            return !lineupChecks[key]
                        } else {
                            return !lineupChecks[key]?.['true-true']
                        }
                    })

                if (weeks.length > 0) {

                    worker.postMessage({ weeks, state, leagues, allplayers, schedule, projections, includeLocked, includeTaxi, rankings, user_id, recordType })

                    const result_dict = {};
                    worker.onmessage = (e) => {
                        const result = e.data;

                        if (result.week < state.display_week) {
                            result_dict[result.week] = result.projectedRecordWeek;

                            dispatch(setState({ lineupChecks: { ...lineupChecks, ...result_dict } }, 'LINEUPS'));
                        } else {
                            result_dict[result.week] = {
                                ...lineupChecks[week],
                                ['true-true']: result.projectedRecordWeek
                            };

                            dispatch(setState({ lineupChecks: { ...lineupChecks, ...result_dict } }, 'LINEUPS'));
                        }
                        if (result.week === 18) {
                            dispatch(setState({ isLoadingProjectionDict: false }, 'LINEUPS'));

                            return () => worker.terminate();
                        }
                    }
                }
            }
        }
    }, [leagues, week, state, allplayers, schedule, projections, hash, dispatch, includeLocked, includeTaxi, lineupChecks, rankings, user_id, recordType, isLoadingProjectionDict, matchups])


    useEffect(() => {
        const lc_weeks = Object.keys(lineupChecks)

        if (lc_weeks.length === 18 && !lc_weeks.includes('totals')) {
            const season_totals_all = {};

            leagues
                .filter(league => league.settings.status === 'in_season')
                .forEach(league => {
                    const league_season_totals = {};

                    league.rosters
                        .forEach(roster => {

                            const roster_season_totals = Object.keys(lineupChecks)
                                .filter(key => parseInt(key) >= 1 && parseInt(key) <= 18)
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
                                    wins: 0,
                                    losses: 0,
                                    ties: 0,
                                    fp: 0,
                                    fpa: 0
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