import { useEffect } from 'react';
import { loadingIcon } from '../../functions/misc';
import { useSelector, useDispatch } from 'react-redux';
import { setState } from '../../redux/actions/state';
import '../../css/css/trades.css';
import LmTrades from "./lmTrades";
import PcTrades from "./pcTrades";
import { fetchLmTrades, fetchFilteredLmTrades } from '../../redux/actions/fetchUser';

const Trades = () => {
    const dispatch = useDispatch();
    const trades = useSelector(state => state.trades);
    const { state, allplayers, tab } = useSelector(state => state.main);
    const { leagues, user_id } = useSelector(state => state.user);


    useEffect(() => {
        if (trades.lmTrades.count === '') {
            dispatch(fetchLmTrades(user_id, leagues, state.league_season, 0, 125))

        }
    }, [user_id, leagues, trades.lmTrades.count, state.league_season, dispatch])


    useEffect(() => {
        if ((trades.lmTrades.searched_player.id || trades.lmTrades.searched_manager.id) && !trades.lmTrades.searches.find(s => s.player === trades.lmTrades.searched_player.id && s.manager === trades.lmTrades.searched_manager.id)) {
            console.log('fetching filtered lm trades')
            dispatch(fetchFilteredLmTrades(trades.lmTrades.searched_player.id, trades.lmTrades.searched_manager.id, state.league_season, 0, 125))
        }
    }, [trades.lmTrades.searched_player, trades.lmTrades.searched_manager, trades.lmTrades.searches, dispatch])

    const picks_list = []

    Array.from(Array(4).keys()).map(season => {
        return Array.from(Array(5).keys()).map(round => {
            if (season !== 0) {
                return picks_list.push({
                    id: `${season + parseInt(state.league_season)} ${round + 1}.${null}`,
                    text: `${season + parseInt(state.league_season)}  Round ${round + 1}`,
                    image: {
                        src: null,
                        alt: 'pick headshot',
                        type: 'player'
                    }
                })
            } else {
                return Array.from(Array(12).keys()).map(order => {
                    return picks_list.push({
                        id: `${season + parseInt(state.league_season)} ${round + 1}.${season === 0 ? (order + 1).toLocaleString("en-US", { minimumIntegerDigits: 2 }) : null}`,
                        text: `${season + parseInt(state.league_season)} ${season === 0 ? `${round + 1}.${(order + 1).toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : ` Round ${round + 1}`}`,
                        image: {
                            src: null,
                            alt: 'pick headshot',
                            type: 'player'
                        }
                    })
                })
            }
        })
    })

    const players_list = [
        ...Array.from(
            new Set(
                leagues.map(league => league.rosters?.map(roster => roster.players)).flat(3)
            )
        ).map(player_id => {
            return {
                id: player_id,
                text: allplayers[player_id]?.full_name,
                image: {
                    src: player_id,
                    alt: 'player headshot',
                    type: 'player'
                }
            }
        }),
        ...picks_list
    ]

    const trades_headers = [
        [
            {
                text: 'Date',
                colSpan: 3
            },
            {
                text: 'League',
                colSpan: 7
            }
        ]
    ]

    let display;
    let tradeCount;

    switch (trades.tab.primary) {
        case 'Leaguemate Trades':
            tradeCount = (!trades.lmTrades.searched_player?.id && !trades.lmTrades.searched_manager?.id)
                ? trades.lmTrades.count
                : trades.lmTrades.searches
                    ?.find(
                        s => s.player === trades.lmTrades.searched_player.id
                            && s.manager === trades.lmTrades.searched_manager.id
                    )
                    ?.count

            display = <LmTrades
                trades_headers={trades_headers}
                players_list={players_list}
                tradeCount={tradeCount}
            />

            break;
        case 'Price Check':
            tradeCount = trades.pricecheckTrades.searches.find(pcTrade => pcTrade.pricecheck_player === trades.pricecheckTrades.pricecheck_player.id && pcTrade.pricecheck_player2 === trades.pricecheckTrades.pricecheck_player2.id)?.count || 0

            display = <PcTrades
                trades_headers={trades_headers}
                players_list={players_list}
                tradeCount={tradeCount}
            />;

            break;
        default:
            break;
    }



    return <>
        <h2>
            {tradeCount?.toLocaleString("en-US")}
            {` ${state.league_season} Trades`}

        </h2>
        <div className='navbar'>
            <p className='select'>
                {trades.tab.primary}&nbsp;<i class="fa-solid fa-caret-down"></i>
            </p>

            <select
                className='trades'
                onChange={(e) => dispatch(setState({ tab: { ...trades.tab, primary: e.target.value } }, 'TRADES'))}
                value={trades.tab.primary}

            >
                <option>Price Check</option>
                <option>Leaguemate Trades</option>
            </select>
        </div>
        {
            trades.isLoading
                ? <div className='loading_wrapper'>
                    {loadingIcon}
                </div>
                : display
        }
    </>
}

export default Trades;