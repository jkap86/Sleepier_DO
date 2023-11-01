import { useSelector, useDispatch } from "react-redux";
import { useMemo } from "react";
import { setState } from "../../redux/actions/state";
import TableMain from "../../componentsX/Home/tableMain";
import { getTrendColor, loadingIcon } from "../../functions/misc";
import { filterLeagues } from "../../functions/filterLeagues";
import Players3 from "./players3";

const Players2 = ({
    leagues_owned,
    leagues_taken,
    leagues_available,
    player_id
}) => {
    const dispatch = useDispatch();
    const { lmplayershares, isLoadingPS } = useSelector(state => state.user);
    const { tab, itemActive2, page2 } = useSelector(state => state.players)
    const { allplayers: stateAllPlayers, type1, type2 } = useSelector(state => state.main)

    const most_owned = useMemo(() => {
        let keys;

        switch (`${type1}-${type2}`) {
            case 'All-All':
                keys = ['all']
                break;
            case 'Redraft-All':
                keys = ['r_b', 'r_s'];

                break;
            case 'Dynasty-All':
                keys = ['d_b', 'd_s'];

                break;
            case 'All-Bestball':
                keys = ['r_b', 'd_b'];

                break;
            case 'All-Standard':
                keys = ['r_s', 'd_s'];

                break;
            default:
                break;
        }


        const most_owned = isLoadingPS
            ? loadingIcon
            : (lmplayershares || [])
                ?.filter(lm => lm?.user_id && lm?.playershares?.[player_id])
                ?.map(lm => {
                    return {
                        user_id: lm.user_id,
                        username: lm.username,
                        avatar: lm.avatar,
                        count: keys?.reduce((acc, cur) => acc + lm.playershares[player_id]?.[cur]?.[0], 0),
                        percentage: (
                            keys?.reduce((acc, cur) => acc + lm.playershares[player_id]?.[cur]?.[0], 0)
                            / keys?.reduce((acc, cur) => acc + lm.playershares[player_id]?.[cur]?.[1], 0)
                            * 100
                        ).toFixed(1)

                    }
                })

        return most_owned;
    }, [type1, type2, lmplayershares, isLoadingPS, loadingIcon])


    const leagues_display = tab.secondary === 'Owned' ? leagues_owned :
        tab.secondary === 'Taken' ? leagues_taken :
            tab.secondary === 'Available' ? leagues_available :
                []


    let player_leagues_headers = [
        [
            {
                text: 'League',
                colSpan: 3,
                className: 'half'
            },
            {
                text: 'Rank',
                colSpan: 1
            }
        ]
    ]

    if (tab.secondary === 'Taken') {
        player_leagues_headers[0].push(
            ...[
                {
                    text: 'Manager',
                    colSpan: 2
                },
                {
                    text: 'Rank',
                    colSpan: 1
                }
            ],
        )
    }

    const player_leagues_body = filterLeagues(leagues_display, type1, type2).map(lo => {
        const { wins, losses, ties } = lo.userRoster.settings
        const winpct = wins + losses + ties > 0
            ? (wins / (wins + losses + ties)).toFixed(4)
            : '-'



        return {
            id: lo.league_id,
            list: [
                {
                    text: lo.name,
                    colSpan: 3,
                    className: 'left',
                    image: {
                        src: lo.avatar,
                        alt: lo.name,
                        type: 'league'
                    }
                },
                {
                    text: <p
                        className={(lo.userRoster?.rank / lo.rosters.length) < .5 ? 'green stat' :
                            (lo.userRoster?.rank / lo.rosters.length) > .5 ? 'red stat' :
                                'stat'}
                        style={getTrendColor(- ((lo.userRoster.rank / lo.rosters.length) - .5), .0025)
                        }
                    >
                        {lo.userRoster?.rank}
                    </p>,
                    colSpan: 1,
                    className: lo.userRoster?.rank / lo.rosters.length <= .25 ? 'green' :
                        lo.userRoster?.rank / lo.rosters.length >= .75 ? 'red' :
                            null
                },

                /*
                {
                    text: <span
                        className="player_score"
                        onClick={
                            (e) => {
                                e.stopPropagation()
                                dispatch(setState({
                                    modalVisible: {
                                        options: false,
                                        player: false,
                                        player2: {
                                            ...stateAllPlayers[player_id],
                                            trend_games: trend_games,
                                            scoring_settings: lo.scoring_settings,
                                            league: lo
                                        }
                                    }
                                }, 'PLAYERS'))
                            }
                        }
                    >
                        {
                            trend_games?.length > 0
                            && (Object.keys(player_score || {})
                                .reduce(
                                    (acc, cur) => acc + player_score[cur].points, 0) / trend_games.length)
                                .toFixed(1)
                            || '-'
                        }
                    </span>,
                    colSpan: 1
                },
                */
                tab.secondary === 'Taken' ?
                    {
                        text: lo.lmRoster?.username || 'Orphan',
                        colSpan: 2,
                        className: 'left',
                        image: {
                            src: lo.lmRoster?.avatar,
                            alt: lo.lmRoster?.username,
                            type: 'user'
                        }
                    }
                    : '',
                tab.secondary === 'Taken' ?
                    {
                        text: <p
                            className={(lo.lmRoster?.rank / lo.rosters.length) < .5 ? 'green stat' :
                                (lo.lmRoster?.rank / lo.rosters.length) > .5 ? 'red stat' :
                                    'stat'}
                            style={getTrendColor(- ((lo.lmRoster.rank / lo.rosters.length) - .5), .0025)
                            }
                        >
                            {lo.lmRoster?.rank}
                        </p>,
                        colSpan: 1,
                        className: lo.lmRoster?.rank / lo.rosters.length <= .25 ? 'green' :
                            lo.lmRoster?.rank / lo.rosters.length >= .75 ? 'red' :
                                null
                    }
                    : '',

            ],
            secondary_table: (
                <Players3
                    league={lo}
                    type={'tertiary'}
                />
            )
        }
    })


    const leaguemate_shares_body_count = lmplayershares && most_owned
        ?.sort((a, b) => b.count - a.count)
        .slice(0, 25)
        ?.map(lm => {

            return {
                id: lm.user_id,
                list: [
                    {
                        text: lm.username,
                        colSpan: 3,
                        className: 'left',
                        image: {
                            src: lm.avatar,
                            alt: 'avatar',
                            type: 'user'
                        }
                    },
                    {
                        text: lm.count,
                        colSpan: 1
                    },
                    {
                        text: lm.percentage + '%',
                        colSpan: 1
                    }
                ]
            }
        })

    const leaguemate_shares_body_percentage = lmplayershares && most_owned
        ?.sort((a, b) => b.percentage - a.percentage)
        .slice(0, 25)
        ?.map(lm => {

            return {
                id: lm.user_id,
                list: [
                    {
                        text: lm.username,
                        colSpan: 3,
                        className: 'left',
                        image: {
                            src: lm.avatar,
                            alt: 'avatar',
                            type: 'user'
                        }
                    },
                    {
                        text: lm.count,
                        colSpan: 1
                    },
                    {
                        text: lm.percentage + '%',
                        colSpan: 1
                    }
                ]
            }
        })

    return <>
        <div className="secondary nav">
            <button
                className={tab.secondary === 'Owned' ? 'active click' : 'click'}
                onClick={() => dispatch(setState({ tab: { ...tab, secondary: 'Owned' } }, 'PLAYERS'))}
            >
                Owned
            </button>
            <button
                className={tab.secondary === 'Taken' ? 'active click' : 'click'}
                onClick={() => dispatch(setState({ tab: { ...tab, secondary: 'Taken' } }, 'PLAYERS'))}
            >
                Taken
            </button>
            <button
                className={tab.secondary === 'Available' ? 'active click' : 'click'}
                onClick={() => dispatch(setState({ tab: { ...tab, secondary: 'Available' } }, 'PLAYERS'))}
            >
                Available
            </button>
            <button
                className={tab.secondary === 'Leaguemate Shares' ? 'active click' : 'click'}
                onClick={() => dispatch(setState({ tab: { ...tab, secondary: 'Leaguemate Shares' } }, 'PLAYERS'))}
            >
                Leaguemate Shares
            </button>
        </div>
        {
            tab.secondary === 'Leaguemate Shares'
                ? isLoadingPS
                    ? loadingIcon
                    : <>
                        <TableMain
                            type={'secondary subs'}
                            headers={[]}
                            body={leaguemate_shares_body_count}
                        />
                        <TableMain
                            type={'secondary lineup'}
                            headers={[]}
                            body={leaguemate_shares_body_percentage}
                        />
                    </>
                : <div className="relative">

                    <TableMain
                        type={'secondary'}
                        headers={player_leagues_headers}
                        body={player_leagues_body}
                        itemActive={itemActive2}
                        setItemActive={(item) => dispatch(setState({ itemActive2: item }, 'PLAYERS'))}
                        page={page2}
                        setPage={(page) => dispatch(setState({ page2: page }, 'PLAYERS'))}
                    />
                </div>
        }
    </>
}

export default Players2;