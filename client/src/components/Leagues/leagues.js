import { useSelector, useDispatch } from "react-redux";
import TableMain from "../Home/tableMain";
import { filterLeagues } from '../../functions/filterLeagues';
import { setState } from "../../redux/actions/state";
import { getTrendColor } from "../../functions/misc";
import LeagueInfo from './leagueInfo';
import ProjectedRecords from "../ProjectedRecords/projectedRecords";

const Leagues = () => {
    const dispatch = useDispatch();
    const { leagues } = useSelector(state => state.user);
    const { type1, type2, state } = useSelector(state => state.main);
    const { filteredData } = useSelector(state => state.filteredData);
    const { itemActive, page, searched, recordType } = useSelector(state => state.leagues);
    const { lineupChecks } = useSelector(state => state.lineups);

    const getProjection = (league_id) => {
        return Object.keys(lineupChecks)
            .filter(key => parseInt(key) >= state.display_week)
            .reduce((acc, cur) => {
                return {
                    wins: acc.wins + (
                        lineupChecks[cur]['true-true'][league_id]?.lc_user?.proj_score_optimal >
                            lineupChecks[cur]['true-true'][league_id]?.lc_opp?.proj_score_optimal
                            ? 1
                            : 0
                    ) + (lineupChecks[cur]['true-true'][league_id]?.median_win || 0),
                    losses: acc.losses + (
                        lineupChecks[cur]['true-true'][league_id]?.lc_user?.proj_score_optimal <
                            lineupChecks[cur]['true-true'][league_id]?.lc_opp?.proj_score_optimal
                            ? 1
                            : 0
                    ) + (lineupChecks[cur]['true-true'][league_id]?.median_loss || 0),
                    ties: acc.ties + (
                        (
                            lineupChecks[cur]['true-true'][league_id]?.lc_user?.proj_score_optimal > 0
                            && lineupChecks[cur]['true-true'][league_id]?.lc_opp?.proj_score_optimal > 0
                            && lineupChecks[cur]['true-true'][league_id]?.lc_user?.proj_score_optimal ===
                            lineupChecks[cur]['true-true'][league_id]?.lc_opp?.proj_score_optimal
                        )
                            ? 1
                            : 0
                    ),
                    fpts: lineupChecks[cur]['true-true'][league_id]?.lc_user?.proj_score_optimal || 0,
                    fpts_against: lineupChecks[cur]['true-true'][league_id]?.lc_opp?.proj_score_optimal || 0
                }
            }, {
                wins: 0,
                losses: 0,
                ties: 0,
                fpts: 0,
                fpts_against: 0
            })
    }


    const leagues_headers = [
        [
            {
                text: 'League',
                colSpan: 4
            },
            {
                text: 'Record',
                colSpan: 2
            },
            {
                text: 'Rank',
                colSpan: 1
            }
        ]
    ]

    const leagues_body = filterLeagues((filteredData?.leagues || []), type1, type2)
        ?.filter(l => l.userRoster && (!searched.id || searched.id === l.league_id))
        ?.map(league => {
            const record = {
                wins: league.userRoster.settings.wins + ((recordType === 'Projected Record' && getProjection(league.league_id)?.wins) || 0),
                losses: league.userRoster.settings.losses + ((recordType === 'Projected Record' && getProjection(league.league_id)?.losses) || 0),
                ties: league.userRoster.settings.ties + ((recordType === 'Projected Record' && getProjection(league.league_id)?.ties) || 0)
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
                        colSpan: 4,
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
                        colSpan: 1
                    },
                    {
                        text: (record?.wins + record?.losses > 0 ?
                            (record?.wins / (record?.wins + record?.losses))
                            :
                            '--'
                        ).toLocaleString("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 4 }),
                        colSpan: 1
                    },
                    {
                        text: <p
                            className={(league.userRoster?.rank / league.rosters.length) < .5 ? 'green stat' :
                                (league.userRoster?.rank / league.rosters.length) > .5 ? 'red stat' :
                                    'stat'}
                            style={getTrendColor(-((league.userRoster.rank / league.rosters.length) - .5), .0025)}
                        >
                            {league.userRoster?.rank | '-'}
                        </p>,
                        colSpan: 1,

                    }
                ],
                secondary_table: (
                    <LeagueInfo
                        type={'secondary'}
                        league={league}
                        scoring_settings={league.scoring_settings}

                    />
                )
            }
        })



    const record = filterLeagues((leagues || []), type1, type2)
        ?.reduce(
            (acc, cur) => {
                return {
                    wins: acc.wins + (cur.userRoster?.settings?.wins || 0) + ((recordType === 'Projected Record' && getProjection(cur.league_id)?.wins) || 0),
                    losses: acc.losses + (cur.userRoster?.settings?.losses || 0) + ((recordType === 'Projected Record' && getProjection(cur.league_id)?.losses) || 0),
                    ties: acc.ties + (cur.userRoster?.settings?.ties || 0) + ((recordType === 'Projected Record' && getProjection(cur.league_id)?.ties) || 0),
                    fpts: acc.fpts + parseFloat((cur.userRoster?.settings?.fpts || 0) + '.' + (cur.userRoster?.settings?.fpts_decimal || 0)) + ((recordType === 'Projected Record' && getProjection(cur.league_id)?.fpts) || 0),
                    fpts_against: acc.fpts_against + parseFloat((cur.userRoster?.settings?.fpts_against || 0) + '.' + (cur.userRoster?.settings?.fpts_against_decimal || 0)) + ((recordType === 'Projected Record' && getProjection(cur.league_id)?.fpts_against) || 0),
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

export default Leagues;