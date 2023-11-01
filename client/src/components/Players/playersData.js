import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMain } from "../../redux/actions/fetchMain";
import { fetchLmPlayerShares } from "../../redux/actions/fetchUser";

const PlayersData = () => {
    const dispatch = useDispatch();
    const { allplayers } = useSelector(state => state.main);
    const { user_id, lmplayershares } = useSelector(state => state.user);;
    const { tab } = useSelector(state => state.players);



    useEffect(() => {
        if (user_id && !lmplayershares && tab.secondary === 'Leaguemate Shares') {
            dispatch(fetchLmPlayerShares(user_id))
        }
    }, [user_id, lmplayershares, tab.secondary, dispatch])

    return <></>
}

export default PlayersData;