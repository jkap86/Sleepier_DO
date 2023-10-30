import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { resetState } from "../../redux/actions/state";
import { fetchUser, fetchLeagues, fetchFilteredData } from "../../redux/actions/fetchUser";
import { fetchMain } from "../../redux/actions/fetchMain";
import Heading from "./heading";
import Leagues1 from "../Leagues/leagues1";
import { loadingIcon } from "../../functions/misc";
import Players1 from "../Players/players1";
import Lineups1 from "../Lineups/lineups1";
import Leaguemates from '../../componentsX/Leaguemates/leaguemates';
import Trades from '../../componentsX/Trades/trades';


const Index = () => {
    const dispatch = useDispatch();
    const params = useParams();
    const { tab, state, allplayers } = useSelector(state => state.main);
    const { user_id, username, leagues, isLoadingUser, isLoadingLeagues } = useSelector(state => state.user);
    const { filteredData } = useSelector(state => state.filteredData);

    // Reset state everytime searched user changes

    useEffect(() => {
        dispatch(resetState);
    }, [params.username, dispatch]);


    // Fetch user if state username does not match params username

    useEffect(() => {
        if (username?.toLowerCase() !== params.username?.toLowerCase()) {
            dispatch(fetchUser(params.username));
        }
    }, [username, params.username, dispatch]);


    // Once there is user_id and leagues is still false, fetch leagues

    useEffect(() => {
        if (user_id && !leagues) {
            dispatch(fetchLeagues(user_id));
        }
    }, [dispatch, user_id, leagues]);


    // Fetch filtereddata for current tab once leagues is set

    useEffect(() => {
        if (leagues) {
            dispatch(fetchFilteredData(leagues, tab, state.league_season));
        }
    }, [leagues, tab, state, dispatch]);

    // Fetch allplayers once filteredData is set

    useEffect(() => {
        if (filteredData && !allplayers) {
            dispatch(fetchMain('allplayers'));
        };
    }, [filteredData, allplayers, dispatch])


    let display;

    switch (tab) {
        case 'players':
            display = <Players1 />
            break;
        case 'trades':
            display = <Trades />;
            break;
        case 'leagues':
            display = <Leagues1 />
            break;
        case 'leaguemates':
            display = <Leaguemates />
            break;
        case 'lineups':
            display = <Lineups1 />
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

export default Index;