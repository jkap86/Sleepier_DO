import TableMain from "../Home/tableMain";
import { default_scoring_settings, scoring_settings_display } from '../../functions/misc';
import { useSelector, useDispatch } from 'react-redux';
import ktcLogo from '../../images/KTClogo.png';
import fantasycalcLogo from '../../images/fantasycalclogo.png';
import Roster from "../Home/roster";
import { setState } from "../../redux/actions/state";
import { useEffect } from "react";

const Leagues2View = ({
    league,
    scoring_settings,
    type
}) => {
    const dispatch = useDispatch();
    const { state } = useSelector(state => state.main);
    const { itemActive2: itemActive, lineupType, recordType } = useSelector(state => state.leagues);
    const { lineupChecks } = useSelector(state => state.lineups);

    useEffect(() => {
        dispatch(setState({ itemActive2: league.userRoster?.roster_id }, 'LEAGUES'));
    }, [dispatch])

    const active_roster = league.rosters.find(x => x.roster_id === itemActive)

    const standings_headers = [
        [
            {
                text: 'Manager',
                colSpan: 5,
            },
            {
                text: 'Record',
                colSpan: 2,
            },
            {
                text: 'FP',
                colSpan: 3
            }
        ]
    ]

    const standings = recordType === 'Record'
        ? league.rosters
            .sort((a, b) => b.settings.wins - a.settings.wins || b.settings.fpts - a.settings.fpts)

        : league.rosters
            .sort((a, b) => lineupChecks.totals?.[league.league_id][b.roster_id].wins - lineupChecks.totals?.[league.league_id][a.roster_id].wins
                || lineupChecks.totals?.[league.league_id][b.roster_id].fp - lineupChecks.totals?.[league.league_id][a.roster_id].fp)




    const standings_body = standings
        ?.map((team, index) => {
            let record;

            const ties = lineupChecks.totals?.[league.league_id]?.[team.roster_id]?.ties;

            if (recordType === 'Record') {
                record = team.settings.wins
                    + '-'
                    + team.settings.losses
                    + (team.settings.ties > 0 ? '-' + team.settings.ties : '')
            } else {
                record = lineupChecks.totals
                    && (lineupChecks.totals?.[league.league_id]?.[team.roster_id]?.wins
                        + '-'
                        + lineupChecks.totals?.[league.league_id]?.[team.roster_id]?.losses
                        + (ties > 0 ? '-' + ties : ''))
                    || 'Loading'
            }
            return {
                id: team.roster_id,
                list: [
                    {
                        text: team.username || 'Orphan',
                        colSpan: 5,
                        className: 'left',
                        image: {
                            src: team.avatar,
                            alt: 'user avatar',
                            type: 'user'
                        }
                    },
                    {
                        text: record,
                        colSpan: 2
                    },
                    {
                        text: (
                            parseFloat(team.settings.fpts + '.' + (team.settings.fpts_decimal || '00'))
                        ).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
                        colSpan: 3
                    }
                ]
            }
        })

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']

    const leagueInfo_headers = [
        [
            {
                text: 'Category',
                colSpan: 11
            },
            {
                text: 'Setting',
                colSpan: 11
            }
        ]
    ]

    const leagueInfo_body = [
        {
            id: 'Type',
            list: [
                {
                    text: league.settings['type'] === 2 ? 'Dynasty'
                        : league.settings['type'] === 1 ? 'Keeper'
                            : 'Redraft',
                    colSpan: 11
                },
                {
                    text: league.settings['best_ball'] === 1 ? 'Bestball' : 'Standard',
                    colSpan: 11
                },
            ]
        }, (league.userRoster && {
            id: 'Trade Deadline',
            list: [
                {
                    text: 'Trade Deadline',
                    colSpan: 11
                },
                {
                    text: 'Week ' + league.settings['trade_deadline'],
                    colSpan: 11
                }
            ]
        }),
        (league.userRoster && {
            id: 'Daily Waivers',
            list: [
                {
                    text: 'Waivers',
                    colSpan: 11
                },
                {
                    text: `${days[league.settings['waiver_day_of_week']]} 
                                ${league.settings['daily_waivers_hour'] > 12 ? (league.settings['daily_waivers_hour'] - 12) + ' pm' : (league.settings['daily_waivers_hour'] || '12') + 'am'} `,
                    colSpan: 11
                }
            ]
        }),
        ...(scoring_settings
            && Object.keys(scoring_settings)
                .filter(setting => (scoring_settings[setting] !== default_scoring_settings[setting] || scoring_settings_display.includes(setting)))
                .map(setting => {
                    return {
                        id: setting,
                        list: [
                            {
                                text: setting.replace(/_/g, ' '),
                                colSpan: 11
                            },
                            {
                                text: scoring_settings[setting].toLocaleString(),
                                colSpan: 11
                            }
                        ]
                    }
                })
        )
    ]
    const matchups_header = [
        [
            {
                text: 'Wk',
                colSpan: 1
            },
            {
                text: 'Opp',
                colSpan: 5
            },
            {
                text: 'For',
                colSpan: 2
            },
            {
                text: 'Against',
                colSpan: 2
            },
            {
                text: '',
                colSpan: 1
            }
        ]
    ]

    const matchups_body = active_roster
        && Array.from(Array(18).keys()).map(key => key + 1)
            .map(week => {
                let roster_id_opp;
                let pts_for;
                let pts_against;
                let win, loss, tie;
                let median_win;
                let median_loss;

                if (week < state.week) {
                    roster_id_opp = lineupChecks[week]?.[league.league_id]?.lc_opp?.matchup?.roster_id;

                    pts_for = lineupChecks[week]?.[league.league_id]?.lc_user?.matchup?.points;
                    pts_against = lineupChecks[week]?.[league.league_id]?.lc_opp?.matchup?.points;

                    median_win = lineupChecks[week]?.[league.league_id]?.median_win
                    median_loss = lineupChecks[week]?.[league.league_id]?.median_loss
                } else {
                    roster_id_opp = lineupChecks[week]?.['true-true']?.[league.league_id]?.lc_opp?.matchup?.roster_id;

                    pts_for = lineupChecks[week]?.['true-true']?.[league.league_id]?.lc_user?.proj_score_optimal;
                    pts_against = lineupChecks[week]?.['true-true']?.[league.league_id]?.lc_opp?.proj_score_optimal;

                    median_win = lineupChecks[week]?.['true-true']?.[league.league_id]?.median_win;
                    median_loss = lineupChecks[week]?.['true-true']?.[league.league_id]?.median_loss;
                }

                const opp_roster = league.rosters?.find(r => r.roster_id === roster_id_opp)

                return {
                    id: week,
                    list: [
                        {
                            text: week,
                            colSpan: 1
                        },
                        {
                            text: opp_roster?.username || '-',
                            image: {
                                src: opp_roster?.avatar,
                                alt: 'avatar',
                                type: 'user'
                            },
                            colSpan: 5,
                            className: 'left'
                        },
                        {
                            text: pts_for?.toFixed(1) || '-',
                            colSpan: 2
                        },
                        {
                            text: pts_against?.toFixed(1) || '-',
                            colSpan: 2
                        },
                        {
                            text: <>
                                {
                                    pts_for > pts_against
                                        ? 'W'
                                        : pts_for < pts_against
                                            ? 'L'
                                            : pts_for === pts_against
                                                ? 'T'
                                                : '-'

                                }
                                {
                                    median_win === 1
                                        ? <i className="fa-solid fa-trophy"></i>
                                        : median_loss === 1
                                            ? <i className="fa-solid fa-poop"></i>
                                            : null
                                }
                            </>,
                            colSpan: 1,
                            className: (pts_for > 0 && pts_against > 0)
                                ? pts_for > pts_against
                                    ? 'greenb'
                                    : pts_for < pts_against
                                        ? 'redb'
                                        : '-'
                                : '-',
                        }
                    ]
                }
            })
        || []

    return <>
        <div className={`${type || 'secondary'} nav`}>

            <div>
                {
                    <>
                        <img src={ktcLogo} alt="ktclogo" onClick={() => {
                            window.open(`https://keeptradecut.com/dynasty/power-rankings/league?leagueId=${league.league_id}&platform=Sleeper`)
                        }} />
                        <img src={fantasycalcLogo} alt="fantasycalclogo" onClick={() => {
                            window.open(`https://fantasycalc.com/league/dashboard?leagueId=${league.league_id}&site=sleeper`)
                        }} />

                        <button className={active_roster ? '' : 'active'} onClick={() => dispatch(setState({ itemActive2: '' }, 'LEAGUES'))}>
                            Settings
                        </button>
                        {
                            active_roster
                                ? <>
                                    <button className={lineupType === 'Matchups' ? 'active' : ''} onClick={() => dispatch(setState({ lineupType: 'Matchups' }, 'LEAGUES'))}>
                                        Matchups
                                    </button>
                                    <button className={lineupType === 'Players' ? 'active' : ''} onClick={() => dispatch(setState({ lineupType: 'Players' }, 'LEAGUES'))}>
                                        Players
                                    </button>
                                </>
                                : null
                        }
                    </>
                }
            </div>
        </div>
        <TableMain
            type={`${type || 'secondary'} subs`}
            headers={standings_headers}
            body={standings_body}
            itemActive={itemActive}
            setItemActive={(value) => dispatch(setState({ itemActive2: value }, 'LEAGUES'))}
        />
        {
            active_roster
                ? lineupType === 'Matchups'
                    ? <TableMain
                        type={`${type || 'secondary'} lineup`}
                        headers={matchups_header}
                        body={matchups_body}
                    />
                    : <Roster
                        type={`${type || 'secondary'} lineup`}
                        league={league}
                        roster={active_roster}
                    />
                : <TableMain
                    type={`${type || 'secondary'} lineup`}
                    headers={leagueInfo_headers}
                    body={leagueInfo_body}
                />
        }
    </>
}

export default Leagues2View;