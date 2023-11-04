import TableMain from "../Home/tableMain";
import Trade from "./trade";
import Search from "../Home/search";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TradeInfo from "./tradeInfo";
import { fetchPriceCheckTrades, fetchPV } from "../../redux/actions/fetchUser";
import { setState } from "../../redux/actions/state";
import { getUTCDate } from "../../functions/getUTCDate";


const PcTrades = ({
    trades_headers,
    players_list,
    tradeCount
}) => {
    const dispatch = useDispatch();
    const trades = useSelector(state => state.trades)

    console.log({ pcplayer: trades.pricecheckTrades })

    const tradesDisplay = trades.pricecheckTrades.searches.find(pcTrade => pcTrade.pricecheck_player === trades.pricecheckTrades.pricecheck_player.id && pcTrade.pricecheck_player2 === trades.pricecheckTrades.pricecheck_player2.id)?.trades || []

    useEffect(() => {
        const player_ids = tradesDisplay
            .sort((a, b) => parseInt(b.status_updated) - parseInt(a.status_updated))
            .slice((trades.pricecheckTrades.page - 1) * 25, ((trades.pricecheckTrades.page - 1) * 25) + 25)
            .flatMap(t => Object.keys(t.adds))

        player_ids.length > 0 && dispatch(fetchPV(player_ids))
    }, [tradesDisplay, trades.pricecheckTrades.page, dispatch])

    const trades_body = tradesDisplay
        ?.sort((a, b) => parseInt(b.status_updated) - parseInt(a.status_updated))
        ?.filter(
            trade => (
                new Date(parseInt(trade.status_updated))
                    ?.toISOString().split('T')[0]
                <= new Date(trades.trade_date)
                    ?.toISOString().split('T')[0]
            ) && (
                    new Date(parseInt(trade.status_updated))
                        ?.toISOString().split('T')[0]
                    >= new Date(new Date(trades.trade_date) - 7 * 24 * 60 * 60 * 1000)
                        ?.toISOString().split('T')[0]
                )
        )
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

    const loadMore = async () => {
        console.log('LOADING MORE')
        dispatch(setState({ pricecheckTrades: { ...trades.pricecheckTrades, page: Math.floor(tradesDisplay.length / 25) + 1 } }, 'TRADES'))
        dispatch(fetchPriceCheckTrades(trades.pricecheckTrades.pricecheck_player.id, trades.pricecheckTrades.pricecheck_player2.id, tradesDisplay.length, 125))
    }

    return <>
        <div className="trade_search_wrapper">
            <Search
                id={'By Player'}
                placeholder={`Player`}
                list={players_list}
                searched={trades.pricecheckTrades.pricecheck_player}
                setSearched={(searched) => dispatch(setState({ pricecheckTrades: { ...trades.pricecheckTrades, pricecheck_player: searched } }, 'TRADES'))}
            />
            {
                trades.pricecheckTrades.pricecheck_player === '' ? null :
                    <>
                        <Search
                            id={'By Player'}
                            placeholder={`Player`}
                            list={players_list}
                            searched={trades.pricecheckTrades.pricecheck_player2}
                            setSearched={(searched) => dispatch(setState({ pricecheckTrades: { ...trades.pricecheckTrades, pricecheck_player2: searched } }, 'TRADES'))}
                        />
                    </>
            }
        </div>
        <TableMain
            id={'trades'}
            type={'primary'}
            headers={trades_headers}
            body={trades_body}
            itemActive={trades.pricecheckTrades.itemActive}
            setItemActive={(item) => dispatch(setState({ pricecheckTrades: { ...trades.pricecheckTrades, itemActive: item } }, 'TRADES'))}
            page={trades.pricecheckTrades.page}
            setPage={(page) => dispatch(setState({ pricecheckTrades: { ...trades.pricecheckTrades, page: page } }, 'TRADES'))}
            partial={tradesDisplay?.length < tradeCount ? true : false}
            loadMore={loadMore}
            isLoading={trades.isLoading}

        />
    </>
}

export default PcTrades;