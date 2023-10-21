import TableMain from "../Home/tableMain";
import { useSelector } from "react-redux";
import { avatar, getTrendColor } from '../../functions/misc';
import { getUTCDate } from '../../functions/getUTCDate';

const Trade = ({
    trade
}) => {
    const { state: stateState, allplayers, values } = useSelector(state => state.main)

    const date = getUTCDate(new Date())

    const trade_date = getUTCDate(new Date(parseInt(trade.status_updated)))

    const type = trade['league.roster_positions']
        .filter(p => p === 'QB' || p === 'SUPER_FLEX')
        .length > 1
        ? 'sf'
        : 'oneqb'

    console.log({ type })

    const getTradeValue = (player_id, date, type) => {
        return values.find(value => (value.player_id === player_id || value.player_id.includes(player_id)) && value.date === date && type === 'sf')?.value
    }

    const getKtcPickName = (pick) => {
        return `${pick.season} ${pick.order <= 4 ? 'Early' : pick.order >= 9 ? 'Late' : 'Mid'} ${pick.round}`
    }

    return <TableMain
        type={'trade_summary'}
        headers={[]}
        body={
            [
                {
                    id: 'title',
                    list: [
                        {
                            text: new Date(parseInt(trade.status_updated)).toLocaleDateString('en-US') + ' ' + new Date(parseInt(trade.status_updated)).toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" }),
                            colSpan: 4,
                            className: 'small'
                        },
                        {
                            text: trade['league.name'],
                            colSpan: 9,

                            image: {
                                src: trade?.['league.avatar'],
                                alt: 'league avatar',
                                type: 'league'
                            }
                        },
                    ]
                },
                ...trade.managers.map(rid => {
                    const roster = trade.rosters?.find(r => r.user_id === rid)

                    const trade_value_players = Object.keys(trade.adds || {})
                        .filter(a => trade.adds[a] === roster?.user_id)
                        .reduce((acc, cur) => acc + getTradeValue(cur, trade_date, type), 0)

                    const trade_value_picks = trade.draft_picks
                        .filter(p => p.owner_id === roster?.roster_id)
                        .reduce((acc, cur) => acc + getTradeValue(getKtcPickName(cur), trade_date, type), 0)

                    const trade_value_total = trade_value_players + trade_value_picks

                    const current_value_players = Object.keys(trade.adds || {})
                        .filter(a => trade.adds[a] === roster?.user_id)
                        .reduce((acc, cur) => acc + getTradeValue(cur, date, type), 0)

                    const current_value_picks = trade.draft_picks
                        .filter(p => p.owner_id === roster?.roster_id)
                        .reduce((acc, cur) => acc + getTradeValue(getKtcPickName(cur), date, type), 0)

                    const current_value_total = current_value_players + current_value_picks

                    const trend_total = current_value_total - trade_value_total

                    return {
                        id: trade.transaction_id,
                        list: [

                            {
                                text: <div className='trade_manager'>
                                    <div>
                                        <p className='value'>
                                            KTC -&nbsp;
                                            {
                                                trade_value_total
                                            }
                                        </p>
                                        <p
                                            className={(trend_total > 0 ? 'green trend' : trend_total < 0 ? 'red trend' : 'trend')}
                                            style={getTrendColor(trend_total, 1.5)}
                                        >
                                            {
                                                trend_total > 0 ? '+' : ''
                                            }
                                            {
                                                trend_total.toString()
                                            }

                                        </p>
                                    </div>
                                    <div>
                                        <p className='left'>
                                            {
                                                avatar(
                                                    roster?.avatar, 'user avatar', 'user'
                                                )
                                            }
                                            <span>{roster?.username || 'Orphan'}</span>
                                        </p>
                                    </div>
                                </div>,
                                colSpan: 4,
                                className: 'left trade_manager'
                            },
                            {
                                text: <table className='trade_info'>
                                    <tbody>
                                        {
                                            Object.keys(trade.adds || {}).filter(a => trade.adds[a] === roster?.user_id).map(player_id => {

                                                const value = getTradeValue(player_id, date, type)





                                                const trade_value = getTradeValue(player_id, trade_date, type)

                                                const trend = (value || 0) - (trade_value || 0)
                                                return <tr>
                                                    <td colSpan={11} className={
                                                        `${trade.tips?.trade_away && trade.tips?.trade_away?.find(p => p.player_id === player_id)?.manager.user_id === rid

                                                            ? 'red left'
                                                            : 'left'
                                                        }`
                                                    } ><p><span >+ {allplayers[player_id]?.full_name}</span></p></td>
                                                    <td className='value'
                                                        colSpan={4}>
                                                        {trade_value}
                                                    </td>
                                                    <td
                                                        className={trend > 0 ? 'green stat value' : trend < 0 ? 'red stat value' : 'stat value'}
                                                        style={getTrendColor(trend, 1)}
                                                        colSpan={3}
                                                    >
                                                        {
                                                            trend > 0 ? '+' : ''
                                                        }
                                                        {trend}
                                                    </td>
                                                </tr>
                                            })
                                        }
                                        {
                                            trade.draft_picks
                                                .filter(p => p.owner_id === roster?.roster_id)
                                                .sort((a, b) => (a.season) - b.season || a.round - b.round)
                                                .map(pick => {
                                                    const ktc_name = getKtcPickName(pick)

                                                    const value = values.find(value => value.player_id.includes(ktc_name) && value.date === date && value.type === type)?.value

                                                    const trade_value = values.find(value => value.player_id.includes(ktc_name) && value.date === trade_date && value.type === type)?.value

                                                    const trend = (value || 0) - (trade_value || 0)
                                                    return <tr>
                                                        <td
                                                            colSpan={11}
                                                            className={`${trade.tips?.trade_away && trade.tips?.trade_away
                                                                ?.find(p =>
                                                                    p?.player_id?.season === pick.season
                                                                    && p?.player_id?.round === pick.round
                                                                    && p?.player_id?.order === pick.order
                                                                )?.manager?.user_id === rid ? 'red left' : 'left'}`}
                                                        >
                                                            {
                                                                <p><span>{`+ ${pick.season} Round ${pick.round}${pick.order && pick.season === stateState.league_season ? `.${pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : ` (${pick.original_user?.username || 'Orphan'})`}`}</span></p>
                                                            }
                                                        </td>
                                                        <td className='value' colSpan={4}>
                                                            {
                                                                value
                                                            }
                                                        </td>
                                                        <td
                                                            className={trend > 0 ? 'green stat value' : trend < 0 ? 'red stat value' : 'stat value'}
                                                            style={getTrendColor(trend, 1.5)}
                                                            colSpan={3}
                                                        >
                                                            {
                                                                trend > 0 ? '+' : ''
                                                            }
                                                            {trend}
                                                        </td>
                                                    </tr>
                                                })
                                        }
                                    </tbody>
                                </table>,
                                colSpan: 5,
                                rowSpan: 2,
                                className: 'small'
                            },
                            {
                                text: <table className='trade_info'>
                                    <tbody>
                                        {
                                            Object.keys(trade.drops || {}).filter(d => trade.drops[d] === roster?.user_id).map(player_id =>

                                                <tr
                                                    className={
                                                        `${trade.tips?.acquire && trade.tips?.acquire?.find(p => p.player_id === player_id)?.manager?.user_id === rid
                                                            ? 'green'
                                                            : ''
                                                        }`
                                                    }
                                                >
                                                    <td className='left end' colSpan={4}>

                                                        <p>
                                                            <span className='end'>
                                                                {
                                                                    (`- ${allplayers[player_id]?.full_name}`).toString()
                                                                }
                                                            </span>
                                                        </p>

                                                    </td>
                                                </tr>

                                            )
                                        }
                                        {
                                            trade.draft_picks
                                                .filter(p => p.previous_owner_id === roster?.roster_id)
                                                .sort((a, b) => (a.season) - b.season || a.round - b.round)
                                                .map(pick =>
                                                    <tr
                                                        className={`end ${trade.tips?.acquire && trade.tips?.acquire
                                                            ?.find(p =>
                                                                p?.player_id?.season === pick.season
                                                                && p?.player_id?.round === pick.round
                                                                && p?.player_id?.order === pick.order
                                                            )?.manager?.user_id === rid ? 'green left' : 'left'}`}
                                                    >
                                                        <td colSpan={4} className='left end'>
                                                            <p>
                                                                <span className="end">
                                                                    {
                                                                        (`- ${pick.season} Round ${pick.round}${pick.order && pick.season === stateState.league_season ? `.${pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : ` (${pick.original_user?.username || 'Orphan'})`}`).toString()
                                                                    }
                                                                </span>
                                                            </p>
                                                        </td>
                                                    </tr>
                                                )
                                        }
                                    </tbody>
                                </table>,
                                colSpan: 4,
                                rowSpan: 2,
                                className: 'small'
                            }
                        ]

                    }
                })

            ]
        }
    />
}

export default Trade;