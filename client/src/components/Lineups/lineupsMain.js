import { useDispatch, useSelector } from 'react-redux';
import { setState } from '../../redux/actions/state';
import { useEffect } from 'react';
import '../../css/css/lineups.css';
import LineupsView from './lineupsView';


const LineupsMain = () => {
    const dispatch = useDispatch();
    const { state } = useSelector(state => state.main);
    const { week } = useSelector(state => state.lineups);


    useEffect(() => {
        if (week < state.week) {
            dispatch(setState({ recordType: 'actual' }, 'LINEUPS'));
        }
    }, [week, state.week, dispatch])



    return <LineupsView />
}

export default LineupsMain;