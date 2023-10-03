import Lineups2View from "./lineups2View";
import { useSelector, useDispatch } from "react-redux";
import { syncLeague } from "../../redux/actions/fetchUser";
import { setState } from "../../redux/actions/state";
import { useEffect } from "react";


const Lineups2Main = ({
    league,
    matchup_user,
    lineup_check,
    optimal_lineup,
    optimal_lineup_opp,
    matchup_opp,
    lineup_check_opp,
    players_points,
    players_projections,
    proj_score_user_actual,
    proj_score_user_optimal,
    proj_score_opp_actual,
    proj_score_opp_optimal
}) => {
    const dispatch = useDispatch();
    const { user_id, username } = useSelector(state => state.user);
    const { week, itemActive2 } = useSelector(state => state.lineups);

    const handleSync = (league_id) => {
        dispatch(setState({ syncing: { league_id: league_id, week: week } }, 'USER'))

        dispatch(syncLeague(league_id, user_id, username, week))
    }

    useEffect(() => {
        if (itemActive2) {
            dispatch(setState({ secondaryContent: 'Options' }, 'LINEUPS'));
        } else {
            dispatch(setState({ secondaryContent: 'Optimal' }, 'LINEUPS'));
        }
    }, [itemActive2, dispatch])

    return <Lineups2View
        league={league}
        matchup_user={matchup_user}
        matchup_opp={matchup_opp}
        handleSync={handleSync}
        lineup_check={lineup_check}
        lineup_check_opp={lineup_check_opp}
        optimal_lineup={optimal_lineup}
        optimal_lineup_opp={optimal_lineup_opp}
        players_projections={players_projections}
        players_points={players_points}
        proj_score_user_actual={proj_score_user_actual}
        proj_score_user_optimal={proj_score_user_optimal}
        proj_score_opp_actual={proj_score_opp_actual}
        proj_score_opp_optimal={proj_score_opp_optimal}
    />
}

export default Lineups2Main;