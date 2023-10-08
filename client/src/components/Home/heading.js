import { Link } from 'react-router-dom';
import { avatar } from '../../functions/misc';
import { useSelector, useDispatch } from 'react-redux';
import { filterLeagues } from '../../functions/filterLeagues';
import { setState } from '../../redux/actions/state';
import '../../css/css/heading.css';

const Heading = () => {
    const dispatch = useDispatch();
    const { user_id, username, avatar: user_avatar, leagues, isLoadingLeagues, progress } = useSelector(state => state.user);
    const { state, type1, type2, tab } = useSelector(state => state.main);



    const filteredLeagueCount = isLoadingLeagues
        ? progress
        : filterLeagues((leagues || []), type1, type2)?.length


    return !user_id ? '' : <>
        <Link to="/" className="home">
            Home
        </Link>
        <a target='_blank' className='link' href={`http://18.206.180.1:5000/`}>
            Sleepier Splits BETA
        </a>
        <div className="heading">

            <h1>
                {state.league_season}
            </h1>
            <h1>
                <p className="image">
                    {
                        user_avatar && avatar(user_avatar, username, 'user')
                    }
                    <strong>
                        {username}
                    </strong>
                </p>
            </h1>
            <div className="navbar">
                <p className='select'>
                    {tab}&nbsp;<i className="fa-solid fa-caret-down"></i>
                </p>
                <select
                    className="nav active click"
                    value={tab}
                    onChange={(e) => dispatch(setState({ tab: e.target.value }, 'MAIN'))}
                >
                    <option>players</option>
                    <option>trades</option>
                    <option>leagues</option>
                    <option>leaguemates</option>
                    <option>lineups</option>
                </select>

            </div>
            {
                <div className="switch_wrapper">
                    <div className="switch">
                        <button className={type1 === 'Redraft' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type1: 'Redraft' }, 'MAIN'))}>Redraft</button>
                        <button className={type1 === 'All' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type1: 'All' }, 'MAIN'))}>All</button>
                        <button className={type1 === 'Dynasty' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type1: 'Dynasty' }, 'MAIN'))}>Dynasty</button>
                    </div>
                    <div className="switch">
                        <button className={type2 === 'Bestball' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type2: 'Bestball' }, 'MAIN'))}>Bestball</button>
                        <button className={type2 === 'All' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type2: 'All' }, 'MAIN'))}>All</button>
                        <button className={type2 === 'Standard' ? 'sw active click' : 'sw click'} onClick={() => dispatch(setState({ type2: 'Standard' }, 'MAIN'))}>Standard</button>
                    </div>
                </div>
            }
            <h2>
                {`${filteredLeagueCount} Leagues`}
            </h2>
            {
                (tab === 'trades' | tab === 'leaguemates')
                    ? <h2> {
                        (Array.from(
                            new Set(
                                filterLeagues((leagues || []), type1, type2)
                                    .flatMap(league => {
                                        return league.rosters
                                            .filter(roster => parseInt(roster.user_id) > 0)
                                            .map(roster => roster.user_id)
                                    })
                            )
                        ).length).toLocaleString("en-US")
                    } Leaguemates
                    </h2>
                    : tab === 'players'
                        ? <h2>

                        </h2>
                        : null

            }
        </div>
    </>
}

export default Heading;