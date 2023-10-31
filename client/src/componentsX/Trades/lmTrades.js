import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TableMain from '../Home/tableMain';
import Trade from './trade';
import TradeInfo from './tradeInfo';
import { fetchLmTrades, fetchFilteredLmTrades, fetchPV } from '../../redux/actions/fetchUser';
import { setState } from '../../redux/actions/state';
import Search from '../Home/search';



const LmTrades = ({
    trades_headers,
    players_list,
    tradeCount
}) => {
    const dispatch = useDispatch();
    const trades = useSelector(state => state.trades);
    const { state, type1, type2 } = useSelector(state => state.main);
    const { user_id, leagues } = useSelector(state => state.user);
    const initialLoadRef = useRef();

    const hash = `${type1}-${type2}`

    const tradesDisplay = (!trades.lmTrades.searched_player?.id && !trades.lmTrades.searched_manager?.id)
        ? trades.lmTrades.trades?.[hash]?.trades || []
        : (
            trades.lmTrades.searches
                ?.find(
                    s => s.player === trades.lmTrades.searched_player.id
                        && s.manager === trades.lmTrades.searched_manager.id
                        && s.hash === hash
                )?.trades
            || []
        )
    console.log({ trades })


    useEffect(() => {
        const player_ids = tradesDisplay
            .sort((a, b) => parseInt(b.status_updated) - parseInt(a.status_updated))
            .slice((trades.lmTrades.page - 1) * 25, ((trades.lmTrades.page - 1) * 25) + 25)
            .flatMap(t => Object.keys(t.adds))

        dispatch(fetchPV(player_ids))
    }, [tradesDisplay, trades.lmTrades.page, dispatch])





    const trades_body = tradesDisplay
        ?.sort((a, b) => parseInt(b.status_updated) - parseInt(a.status_updated))
        ?.map(trade => {
            return {
                id: trade.transaction_id,
                list: [

                    {
                        text: <Trade trade={trade} />,
                        colSpan: 10,
                        className: `small `
                    }

                ],
                secondary_table: (
                    <TradeInfo
                        trade={trade}
                    />
                )
            }
        }) || []

    useEffect(() => {
        if (initialLoadRef.current) {
            dispatch(setState({ lmTrades: { ...trades.lmTrades, page: 1 } }, 'TRADES'))
        } else {
            initialLoadRef.current = true
        }
    }, [tradesDisplay, dispatch])



    const loadMore = async () => {
        console.log('LOADING MORE')

        dispatch(setState({ lmTrades: { ...trades.lmTrades, page: Math.floor(tradesDisplay.length / 25) + 1 } }, 'TRADES'))

        if (trades.lmTrades.searched_player === '' && trades.lmTrades.searched_manager === '') {
            dispatch(fetchLmTrades(user_id, leagues, state.league_season, trades.lmTrades.trades.length, 125, hash, trades.trade_date))
        } else {
            dispatch(fetchFilteredLmTrades(trades.lmTrades.searched_player.id, trades.lmTrades.searched_manager.id, state.league_season, tradesDisplay.length, 125, hash, trades.trade_date))
        }

    }



    const managers_list = []

    leagues
        .forEach(league => {
            league.rosters
                .filter(r => parseInt(r.user_id) > 0)
                .forEach(roster => {
                    if (!managers_list.find(m => m.id === roster.user_id)) {
                        managers_list.push({
                            id: roster.user_id,
                            text: roster.username,
                            image: {
                                src: roster.avatar,
                                alt: 'user avatar',
                                type: 'user'
                            }
                        })
                    }
                })
        })

    return <>
        <div className="trade_search_wrapper">
            <Search
                id={'By Player'}
                placeholder={`Player`}
                list={players_list}
                searched={trades.lmTrades.searched_player}
                setSearched={(searched) => dispatch(setState({ lmTrades: { ...trades.lmTrades, searched_player: searched } }, 'TRADES'))}
            />
            <Search
                id={'By Manager'}
                placeholder={`Manager`}
                list={managers_list}
                searched={trades.lmTrades.searched_manager}
                setSearched={(searched) => dispatch(setState({ lmTrades: { ...trades.lmTrades, searched_manager: searched } }, 'TRADES'))}
            />
        </div>
        <TableMain
            id={'trades'}
            type={'primary'}
            headers={trades_headers}
            body={trades_body}
            itemActive={trades.lmTrades.itemActive}
            setItemActive={(item) => dispatch(setState({ lmTrades: { ...trades.lmTrades, itemActive: item } }, 'TRADES'))}
            page={trades.lmTrades.page}
            setPage={(page) => dispatch(setState({ lmTrades: { ...trades.lmTrades, page: page } }, 'TRADES'))}
            partial={tradesDisplay?.length < tradeCount ? true : false}
            loadMore={loadMore}
            isLoading={trades.isLoading}
        />

    </>
}

export default LmTrades;