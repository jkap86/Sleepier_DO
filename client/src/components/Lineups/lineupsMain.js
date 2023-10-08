import { useDispatch, useSelector } from 'react-redux';
import { setState } from '../../redux/actions/state';
import { useEffect } from 'react';
import '../../css/css/lineups.css';
import LineupsView from './lineupsView';


const LineupsMain = () => {
    const dispatch = useDispatch();
    const { state } = useSelector(state => state.main);
    const { leagues, matchups } = useSelector(state => state.user);
    const { week } = useSelector(state => state.lineups);


    useEffect(() => {
        if (week < state.week) {
            dispatch(setState({ recordType: 'actual' }, 'LINEUPS'));
        }
    }, [week, state.week, dispatch])

    useEffect(() => {
        if (leagues && matchups) {
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
    }, [leagues, matchups, week, dispatch])




    return <LineupsView />
}

export default LineupsMain;