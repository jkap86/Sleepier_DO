import { useSelector, useDispatch } from "react-redux";
import TableMain from "../Home/tableMain";
import { filterLeagues } from '../../functions/filterLeagues';
import { setState } from "../../redux/actions/state";
import { getTrendColor } from "../../functions/misc";
import Leagues2Main from "./leagues2Main";

const LeaguesView = ({
    getProjection
}) => {
    const dispatch = useDispatch();
    const { user_id, leagues } = useSelector(state => state.user);
    const { type1, type2, state, allplayers, schedule, projections } = useSelector(state => state.main);
    const { filteredData } = useSelector(state => state.filteredData);
    const { itemActive, page, searched, recordType } = useSelector(state => state.leagues);
    const { lineupChecks, rankings, includeLocked, includeTaxi, isLoadingProjectionDict } = useSelector(state => state.lineups);



    const leagues_headers = [
        [
            {
                text: 'League',
                colSpan: 5
            },
            {
                text: 'Record',
                colSpan: 4
            },
            {
                text: 'FP',
                colSpan: 3
            },
            {
                text: 'FPA',
                colSpan: 3
            },
            {
                text: 'Rank',
                colSpan: 2
            }
        ]
    ]

    const leagues_body = filterLeagues((filteredData?.leagues || []), type1, type2)
        ?.filter(l => l.userRoster && (!searched.id || searched.id === l.league_id))
        ?.map(league => {
            let standings;
            let rank;

            if (recordType === 'Projected Record') {
                standings = league.rosters
                    .map(roster => {
                        const projection_roster = recordType === 'Projected Record' && getProjection(league.league_id, league.settings.playoff_week_start)

                        const wins = roster.settings.wins + (projection_roster?.wins || 0);
                        const losses = roster.settings.losses + (projection_roster?.losses || 0);
                        const ties = roster.settings.ties + (projection_roster?.ties || 0);
                        const fpts = parseFloat(roster.settings.fpts + '.' + roster.settings.fpts_decimal) + (projection_roster?.fpts || 0);
                        const fpts_against = parseFloat(roster.settings.fpts_against + '.' + roster.settings.fpts_against_decimal) + (projection_roster?.fpts_against || 0);

                        return {
                            roster_id: roster.roster_id,
                            username: roster.username,
                            avatar: roster.avatar,
                            wins: wins,
                            losses: losses,
                            ties: ties,
                            fpts: fpts,
                            fpts_against: fpts_against
                        }
                    })
                    .sort((a, b) => b.wins - a.wins || b.fpts - a.fpts)

                rank = standings.findIndex(s => {
                    return s.roster_id === league.userRoster.roster_id
                })

                rank = rank >= 0 && rank + 1

            } else {
                standings = league.rosters
                    .map(roster => {
                        return {
                            roster_id: roster.roster_id,
                            username: roster.username,
                            avatar: roster.avatar,
                            wins: roster.settings.wins,
                            losses: roster.settings.losses,
                            ties: roster.settings.ties,
                            fpts: parseFloat(roster.settings.fpts + '.' + roster.settings.fpts_decimal),
                            fpts_against: parseFloat(roster.settings.fpts_against + '.' + roster.settings.fpts_against_decimal)
                        }
                    })
                    .sort((a, b) => b.wins - a.wins || b.fpts - a.fpts)

                rank = league.userRoster?.rank;
            }

            const record = {
                wins: league.userRoster.settings.wins + ((recordType === 'Projected Record' && getProjection(league.league_id, league.settings.playoff_week_start)?.wins) || 0),
                losses: league.userRoster.settings.losses + ((recordType === 'Projected Record' && getProjection(league.league_id, league.settings.playoff_week_start)?.losses) || 0),
                ties: league.userRoster.settings.ties + ((recordType === 'Projected Record' && getProjection(league.league_id, league.settings.playoff_week_start)?.ties) || 0),
                fpts: parseFloat(league.userRoster.settings.fpts + '.' + league.userRoster.settings.fpts_decimal)
                    + ((recordType === 'Projected Record' && getProjection(league.league_id, league.settings.playoff_week_start)?.fpts) || 0),
                fpts_against: parseFloat(league.userRoster.settings.fpts_against + '.' + league.userRoster.settings.fpts_against_decimal)
                    + ((recordType === 'Projected Record' && getProjection(league.league_id, league.settings.playoff_week_start)?.fpts_against) || 0)
            }




            return {
                id: league.league_id,
                search: {
                    text: league.name,
                    image: {
                        src: league.avatar,
                        alt: 'league avatar',
                        type: 'league'
                    }
                },
                list: [
                    {
                        text: league.name,
                        colSpan: 5,
                        className: 'left',
                        image: {
                            src: league.avatar,
                            alt: league.name,
                            type: 'league'
                        }
                    },
                    {
                        text: `${record?.wins?.toString() || ''}-${record?.losses?.toString() || ''}`
                            + (league.userRoster.settings.ties > 0 ? `-${league.userRoster.settings.ties}` : ''),
                        colSpan: 2
                    },
                    {
                        text: (record?.wins + record?.losses > 0 ?
                            (record?.wins / (record?.wins + record?.losses))
                            :
                            '--'
                        ).toLocaleString("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 4 }),
                        colSpan: 2
                    },
                    {
                        text: record.fpts?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                        colSpan: 3
                    },
                    {
                        text: record.fpts_against?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                        colSpan: 3
                    },
                    {
                        text: <p
                            className={(rank / league.rosters.length) < .5 ? 'green stat' :
                                (rank / league.rosters.length) > .5 ? 'red stat' :
                                    'stat'}
                            style={getTrendColor(-((rank / league.rosters.length) - .5), .0025)}
                        >
                            {rank || '-'}
                        </p>,
                        colSpan: 2,

                    }
                ],
                secondary_table: (
                    <Leagues2Main
                        type={'secondary'}
                        league={league}
                        scoring_settings={league.scoring_settings}
                        standings={standings}
                    />
                )
            }
        })



    const record = filterLeagues((leagues || []), type1, type2)
        ?.reduce(
            (acc, cur) => {
                return {
                    wins: acc.wins + (cur.userRoster?.settings?.wins || 0) + ((recordType === 'Projected Record' && getProjection(cur.league_id, cur.settings.playoff_week_start)?.wins) || 0),
                    losses: acc.losses + (cur.userRoster?.settings?.losses || 0) + ((recordType === 'Projected Record' && getProjection(cur.league_id, cur.settings.playoff_week_start)?.losses) || 0),
                    ties: acc.ties + (cur.userRoster?.settings?.ties || 0) + ((recordType === 'Projected Record' && getProjection(cur.league_id, cur.settings.playoff_week_start)?.ties) || 0),
                    fpts: acc.fpts + parseFloat((cur.userRoster?.settings?.fpts || 0) + '.' + (cur.userRoster?.settings?.fpts_decimal || 0)) + ((recordType === 'Projected Record' && getProjection(cur.league_id, cur.settings.playoff_week_start)?.fpts) || 0),
                    fpts_against: acc.fpts_against + parseFloat((cur.userRoster?.settings?.fpts_against || 0) + '.' + (cur.userRoster?.settings?.fpts_against_decimal || 0)) + ((recordType === 'Projected Record' && getProjection(cur.league_id, cur.settings.playoff_week_start)?.fpts_against) || 0),
                }
            },
            {
                wins: 0,
                losses: 0,
                ties: 0,
                fpts: 0,
                fpts_against: 0
            }
        )



    return <>
        <select
            className="nav"
            value={recordType}
            onChange={(e) => dispatch(setState({ recordType: e.target.value }, 'LEAGUES'))}
        >
            <option>Record</option>
            <option>Projected Record</option>
        </select>
        {
            <>
                <h2>
                    {record?.wins?.toLocaleString('en-US')}-{record?.losses?.toLocaleString('en-US')}{record?.ties > 0 && `-${record?.ties?.toLocaleString('en-US')}`}
                </h2>
                <h2>
                    {record?.fpts?.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                    &nbsp;-&nbsp;
                    {record?.fpts_against?.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                </h2>
                <TableMain
                    id={'Leagues'}
                    type={'primary'}
                    headers={leagues_headers}
                    body={leagues_body}
                    page={page}
                    setPage={(page) => dispatch(setState({ page: page }, 'LEAGUES'))}
                    itemActive={itemActive}
                    setItemActive={(item) => dispatch(setState({ itemActive: item }, 'LEAGUES'))}
                    search={true}
                    searched={searched}
                    setSearched={(searched) => dispatch(setState({ searched: searched }, 'LEAGUES'))}
                />
            </>
        }
    </>

}

export default LeaguesView;