import TableMain from "../Home/tableMain";
import { setState } from "../../redux/actions/state";
import LeaguemateLeagues from './leaguemateLeagues'
import { useSelector, useDispatch } from 'react-redux';
import { filterLeagues } from '../../functions/filterLeagues';
import { getTrendColor } from "../../functions/misc";
import { useEffect } from "react";
import { fetchLmPlayerShares } from "../../redux/actions/fetchUser";

const Leaguemates = () => {
    const dispatch = useDispatch();
    const { itemActive, page, searched } = useSelector(state => state.leaguemates);
    const { user_id, username, lmplayershares } = useSelector(state => state.user)
    const { filteredData } = useSelector(state => state.filteredData)
    const { type1, type2 } = useSelector(state => state.main);



    useEffect(() => {
        if (!lmplayershares) {
            dispatch(fetchLmPlayerShares(user_id))
        }
    }, [lmplayershares, dispatch])
    const stateLeaguemates = filteredData.leaguemates || []

    const leaguemates_headers = [
        [
            {
                text: 'Leaguemate',
                colSpan: 3,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: '#',
                colSpan: 1,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: 'Leaguemate',
                colSpan: 4,
                className: 'half'
            },
            {
                text: username,
                colSpan: 4,
                className: 'half'
            }
        ],
        [
            {
                text: 'Record',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Fpts',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Record',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Fpts',
                colSpan: 2,
                className: 'half'
            }

        ]
    ]


    const leaguemates_body = (stateLeaguemates || [])
        ?.filter(x => x.username !== username && (!searched?.id || searched.id === x.user_id))
        ?.sort((a, b) => filterLeagues(b.leagues, type1, type2)?.length - filterLeagues(a.leagues, type1, type2)?.length)
        ?.map(lm => {
            const lm_leagues = filterLeagues(lm.leagues, type1, type2)

            const lm_wins = lm_leagues?.reduce((acc, cur) => acc + cur.lmRoster.settings?.wins, 0);
            const lm_losses = lm_leagues?.reduce((acc, cur) => acc + cur.lmRoster.settings?.losses, 0);
            const lm_ties = lm_leagues?.reduce((acc, cur) => acc + cur.lmRoster.settings.ties, 0);
            const lm_winpct = lm_wins + lm_losses + lm_ties > 0 && (lm_wins / (lm_wins + lm_losses + lm_ties));
            const lm_fpts = lm.leagues?.reduce(
                (acc, cur) =>
                    acc +
                    parseFloat(
                        cur.lmRoster.settings?.fpts +
                        '.' +
                        cur.lmRoster.settings?.fpts_decimal
                    )
                , 0);

            const user_wins = lm_leagues?.reduce((acc, cur) => acc + cur.userRoster.settings?.wins, 0);
            const user_losses = lm_leagues?.reduce((acc, cur) => acc + cur.userRoster.settings?.losses, 0);
            const user_ties = lm_leagues?.reduce((acc, cur) => acc + cur.userRoster.settings?.ties, 0);
            const user_winpct = user_wins + user_losses + user_ties > 0 && (user_wins / (user_wins + user_losses + user_ties));
            const user_fpts = lm.leagues?.reduce(
                (acc, cur) =>
                    acc +
                    parseFloat(
                        cur.userRoster.settings?.fpts +
                        '.' +
                        cur.userRoster.settings?.fpts_decimal
                    )
                , 0);

            return {
                id: lm.user_id,
                search: {
                    text: lm.username,
                    image: {
                        src: lm.avatar,
                        alt: 'user avatar',
                        type: 'user'
                    }
                },
                list: [
                    {
                        text: lm.username || 'Orphan',
                        colSpan: 3,
                        className: 'left',
                        image: {
                            src: lm.avatar,
                            alt: lm.username,
                            type: 'user'
                        }
                    },
                    {
                        text: lm_leagues?.length.toString(),
                        colSpan: 1
                    },
                    {
                        text: <p
                            className={
                                lm_winpct > 0.5
                                    ? 'green stat'
                                    : lm_winpct < 0.5
                                        ? ' red stat'
                                        : 'stat'
                            }
                            style={getTrendColor(lm_winpct - .5, .0005)}
                        >
                            {lm_wins}-{lm_losses}{lm_ties > 0 ? `-${lm_ties}` : ''}
                        </p>,
                        colSpan: 2
                    },
                    {
                        text: <p
                            className={
                                lm_winpct > 0.5
                                    ? 'green stat'
                                    : lm_winpct < 0.5
                                        ? ' red stat'
                                        : 'stat'
                            }
                            style={getTrendColor(lm_winpct - .5, .0005)}
                        >
                            {lm_fpts?.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </p>,
                        colSpan: 2
                    },
                    {
                        text: <p
                            className={
                                user_winpct > 0.5
                                    ? 'green stat'
                                    : user_winpct < 0.5
                                        ? ' red stat'
                                        : 'stat'
                            }
                            style={getTrendColor(user_winpct - .5, .0005)}
                        >
                            {user_wins}-{user_losses}{user_ties > 0 ? `-${user_ties}` : ''}
                        </p>,
                        colSpan: 2
                    },
                    {
                        text: <p
                            className={
                                user_winpct > 0.5
                                    ? 'green stat'
                                    : user_winpct < 0.5
                                        ? ' red stat'
                                        : 'stat'
                            }
                            style={getTrendColor(user_winpct - .5, .0005)}
                        >
                            {user_fpts?.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </p>,
                        colSpan: 2
                    }
                ],
                secondary_table: (
                    <LeaguemateLeagues
                        leaguemate={lm}
                    />
                )
            }
        })

    return <>
        <TableMain
            id={'Leaguemates'}
            type={'primary'}
            headers={leaguemates_headers}
            body={leaguemates_body}
            page={page}
            setPage={(page) => dispatch(setState({ page: page }, 'LEAGUEMATES'))}
            itemActive={itemActive}
            setItemActive={(item) => dispatch(setState({ itemActive: item }, 'LEAGUEMATES'))}
            search={true}
            searched={searched}
            setSearched={(searched) => dispatch(setState({ searched: searched }, 'LEAGUEMATES'))}
        />
    </>
}

export default Leaguemates;