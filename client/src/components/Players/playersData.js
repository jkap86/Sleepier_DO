import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMain } from "../../redux/actions/fetchMain";
import { fetchLmPlayerShares } from "../../redux/actions/fetchUser";

const PlayersData = () => {
    const dispatch = useDispatch();
    const { allplayers } = useSelector(state => state.main);
    const { user_id, lmplayershares } = useSelector(state => state.user);

    useEffect(() => {
        if (!allplayers) {
            dispatch(fetchMain('allplayers'));
        };
    }, [allplayers, dispatch])

    useEffect(() => {
        if (user_id && !lmplayershares) {
            dispatch(fetchLmPlayerShares(user_id))
        }
    }, [user_id, lmplayershares, dispatch])

    return <></>
}

export default PlayersData;