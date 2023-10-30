import { useSelector, useDispatch } from 'react-redux';
import { setState } from '../../redux/actions/state';
import { syncLeague } from '../../redux/actions/fetchUser';
import TableMain from '../Home/tableMain';
import { matchTeam } from '../../functions/misc';
import { useEffect } from 'react';
import Roster from '../Home/roster';

const LineupPrev = ({
    league,
    matchup_user,
    matchup_opp,
    players_projections
}) => {
    const dispatch = useDispatch()
    const { allplayers, projections, schedule, state } = useSelector(state => state.main);
    const { user_id, username, syncing } = useSelector(state => state.user);
    const { week } = useSelector(state => state.lineups);




    const handleSync = (league_id) => {
        dispatch(setState({ syncing: { league_id: league_id, week: week } }, 'USER'))

        dispatch(syncLeague(league_id, user_id, username, week))
    }

    const getInjuryAbbrev = (injury_status) => {
        switch (injury_status) {
            case 'Questionable':
                return 'Q'
            case 'Sus':
                return 'S'
            case 'Doubtful':
                return 'D'
            case 'Out':
                return 'O'
            case 'IR':
                return 'IR'
            default:
                return ''
        }
    }

    const lineup_headers = []

    const lineup_body = []

    const oppRoster = league.rosters.find(r => r.roster_id === matchup_opp?.roster_id);



    return <>
        <div className="secondary nav">

            <button
                className={`sync ${syncing ? 'rotate' : 'click'}`}
                onClick={syncing ? null : () => handleSync(league.league_id)}
            >
                <i className={`fa-solid fa-arrows-rotate ${syncing ? 'rotate' : ''}`}></i>
            </button>

        </div>
        {
            lineup_body?.length >= 0 ?
                <>
                    <Roster
                        league={league}
                        roster={{
                            ...league.userRoster,
                            players: matchup_user?.players,
                            starters: matchup_user?.starters,
                        }}
                        type={'tertiary subs'}
                        previous={true}
                        players_projections={players_projections}
                        players_points={matchup_user?.players_points}
                    />
                    <Roster
                        league={league}
                        roster={{
                            ...oppRoster,
                            players: matchup_opp?.players,
                            starters: matchup_opp?.starters
                        }}
                        type={'tertiary subs'}
                        previous={true}
                        players_projections={players_projections}
                        players_points={matchup_opp?.players_points}
                    />
                </>
                :
                <div>
                    <h1>No Matchups</h1>
                </div>
        }
    </>
}

export default LineupPrev;