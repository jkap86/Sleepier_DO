import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMatchups } from "../../redux/actions/fetchMatchups";
import { fetchMain } from "../../redux/actions/fetchMain";

const LeaguesData = () => {
    const dispatch = useDispatch();
    const { schedule } = useSelector(state => state.main);
    const { leagues, matchups, isLoadingMatchups } = useSelector(state => state.user);

    useEffect(() => {
        if (!schedule) {
            dispatch(fetchMain('schedule'));
        } else if (leagues && !matchups && !isLoadingMatchups) {

            dispatch(fetchMatchups())
        }

    }, [leagues, matchups, isLoadingMatchups, schedule, dispatch])

    return <> </>
}

export default LeaguesData;