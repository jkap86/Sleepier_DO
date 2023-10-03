import { useSelector, useDispatch } from "react-redux";
import TableMain from "../Home/tableMain";
import Roster from '../Home/roster';
import { matchTeam } from "../../functions/misc";
import { setState } from "../../redux/actions/state";

const Lineups2View = ({
    league,
    handleSync,
    matchup_user,
    lineup_check,
    optimal_lineup,
    matchup_opp,
    lineup_check_opp,
    optimal_lineup_opp,
    players_projections,
    proj_score_user_actual,
    proj_score_user_optimal,
    proj_score_opp_actual,
    proj_score_opp_optimal
}) => {
    const dispatch = useDispatch();
    const { state, allplayers, projections, schedule } = useSelector(state => state.main);
    const { user_id, username, syncing } = useSelector(state => state.user);
    const { week, rankings, secondaryContent, itemActive2 } = useSelector(state => state.lineups);

    const getInjuryAbbrev = (injury_status) => {
        switch (injury_status) {
            case 'Questionable':
                return 'Q'
            case 'Sus':
                return 'S'
            case 'Doubtful':
                return 'D'
            case 'Out':
                return 'O'
            case 'IR':
                return 'IR'
            default:
                return ''
        }
    }

    const oppRoster = league.rosters.find(r => r.roster_id === matchup_opp?.roster_id);

    const active_player = lineup_check?.find(x => `${x.slot}_${x.index}` === itemActive2)?.current_player

    const lineup_headers = [
        [
            {
                text: proj_score_user_actual?.toFixed(2),
                colSpan: 23,
                className: 'half'
            }
        ],
        [
            {
                text: 'Slot',
                colSpan: 3,
                className: 'half'
            },
            {
                text: 'Player',
                colSpan: 10,
                className: 'half'
            },
            {
                text: 'Opp',
                colSpan: 3,
                className: 'half'
            },
            {
                text: rankings ? 'Rank' : 'Proj',
                colSpan: 3,
                className: 'half'
            },
            {
                text: 'Points',
                colSpan: 4,
                className: 'half'
            }
        ]
    ]

    const lineup_body = lineup_check?.map((slot, index) => {
        const color = (
            !optimal_lineup.find(x => x.player === slot.current_player) ? 'red'
                : slot.earlyInFlex || slot.lateNotInFlex ? 'yellow'
                    : ''
        )

        return {
            id: slot.slot_index,
            list: !matchup_user ? [] : [
                {
                    text: lineup_check?.find(x => x.current_player === slot.current_player)?.slot,
                    colSpan: 3,
                    className: color
                },
                {
                    text: <>{allplayers[slot.current_player]?.full_name}<span className="player_inj_status">{getInjuryAbbrev(projections[week]?.[slot.current_player]?.injury_status)}</span></> || 'Empty',
                    colSpan: 10,
                    className: color + " left",
                    image: {
                        src: slot.current_player,
                        alt: allplayers[slot.current_player]?.full_name,
                        type: 'player'
                    }
                },
                {
                    text: matchTeam(schedule[week]
                        ?.find(matchup => matchup.team.find(t => matchTeam(t.id) === allplayers[slot.current_player]?.team))
                        ?.team
                        ?.find(team => matchTeam(team.id) !== allplayers[slot.current_player]?.team)
                        ?.id) || 'FA',
                    colSpan: 3,
                    className: color
                },
                {
                    text: rankings
                        ? rankings[slot.current_player]?.prevRank || 999
                        : players_projections[slot.current_player]?.toFixed(1) || '-',
                    colSpan: 3,
                    className: color
                },
                {
                    text: matchup_user?.players_points[slot.current_player]?.toFixed(1) || '-',
                    colSpan: 4,
                    className: color
                }
            ]
        }
    })

    const subs_headers = [
        [
            {
                text: (
                    secondaryContent === 'Optimal'
                        ? proj_score_user_optimal?.toFixed(2)
                        : secondaryContent === 'Opp-Lineup'
                            ? proj_score_opp_actual?.toFixed(2)
                            : secondaryContent === 'Opp-Optimal'
                                ? proj_score_opp_optimal?.toFixed(2)
                                : ''
                ),
                colSpan: 23,
                className: 'half'
            }
        ],
        [
            {
                text: 'Slot',
                colSpan: 3,
                className: 'half'
            },
            {
                text: 'Player',
                colSpan: 10,
                className: 'half'
            },
            {
                text: 'Opp',
                colSpan: 3,
                className: 'half'
            },
            {
                text: rankings ? 'Rank' : 'Proj',
                colSpan: 3,
                className: 'half'
            },
            {
                text: 'Points',
                colSpan: 4,
                className: 'half'
            }
        ]
    ]

    const subs_body = itemActive2 && secondaryContent === 'Options' ?
        [

            {
                id: 'warning',
                list: [
                    {
                        text: lineup_check?.find(x => x.slot_index === itemActive2)?.current_player === '0' ? 'Empty Slot' :
                            lineup_check?.find(x => x.slot_index === itemActive2)?.notInOptimal ? 'Move Out Of Lineup' :
                                lineup_check?.find(x => x.slot_index === itemActive2)?.earlyInFlex ? 'Move Out Of Flex' :
                                    lineup_check?.find(x => x.slot_index === itemActive2)?.lateNotInFlex ? 'Move Into Flex'
                                        : '√',
                        colSpan: 23,
                        className: lineup_check?.find(x => x.slot_index === itemActive2)?.notInOptimal ? 'red'
                            : lineup_check?.find(x => x.slot_index === itemActive2)?.earlyInFlex || lineup_check?.find(x => x.slot_index === itemActive2)?.lateNotInFlex ? 'yellow'
                                : 'green'
                    }
                ]

            },

            ...(lineup_check?.find(x => x.slot_index === itemActive2)?.slot_options || [])
                ?.sort(
                    (a, b) => (rankings && (rankings[a]?.prevRank || 999) - (rankings[b]?.prevRank || 999))
                        || players_projections[b] - players_projections[a]
                )
                ?.map((so, index) => {
                    const color = optimal_lineup.find(x => x.player === so) ? 'green' :
                        allplayers[so]?.rank_ecr < allplayers[active_player]?.rank_ecr ? 'yellow' : ''
                    return {
                        id: so,
                        list: [
                            {
                                text: 'BN',
                                colSpan: 3,
                                className: color
                            },
                            {
                                text: <>{allplayers[so]?.full_name}<span className="player_inj_status">{getInjuryAbbrev(projections[week]?.[so]?.injury_status)}</span></> || 'Empty',
                                colSpan: 10,
                                className: color + " left",
                                image: {
                                    src: so,
                                    alt: allplayers[so]?.full_name,
                                    type: 'player'
                                }
                            },
                            {
                                text: matchTeam(schedule[state.week]
                                    ?.find(matchup => matchup.team.find(t => matchTeam(t.id) === allplayers[so]?.team))
                                    ?.team
                                    ?.find(team => matchTeam(team.id) !== allplayers[so]?.team)
                                    ?.id) || 'FA',
                                colSpan: 3,
                                className: color
                            },
                            {
                                text: rankings
                                    ? rankings[so]?.prevRank || 999
                                    : (players_projections[so] || 0).toFixed(1),
                                colSpan: 3,
                                className: color
                            },
                            {
                                text: matchup_user?.players_points[so].toFixed(1),
                                colSpan: 4,
                                className: color
                            }
                        ]
                    }
                })
        ]
        : secondaryContent === 'Opp-Lineup' ?
            matchup_opp?.starters?.map((opp_starter, index) => {
                return {
                    id: opp_starter,
                    list: [
                        {
                            text: lineup_check_opp[index]?.slot,
                            colSpan: 3
                        },
                        {
                            text: allplayers[opp_starter]?.full_name || 'Empty',
                            colSpan: 10,
                            className: 'left',
                            image: {
                                src: opp_starter,
                                alt: allplayers[opp_starter]?.full_name,
                                type: 'player'
                            }
                        },
                        {
                            text: matchTeam(schedule[state.week]
                                ?.find(matchup => matchup.team.find(t => matchTeam(t.id) === allplayers[opp_starter]?.team))
                                ?.team
                                ?.find(team => matchTeam(team.id) !== allplayers[opp_starter]?.team)
                                ?.id) || 'FA',
                            colSpan: 3,
                        },
                        {
                            text: rankings
                                ? rankings[opp_starter]?.prevRank || 999
                                : (players_projections[opp_starter] || 0).toFixed(1),
                            colSpan: 3
                        },
                        {
                            text: matchup_opp?.players_points[opp_starter]?.toFixed(1) || '-',
                            colSpan: 4
                        }
                    ]
                }
            })
            : secondaryContent === 'Opp-Optimal' ?
                optimal_lineup_opp?.map((opp_starter, index) => {
                    return {
                        id: opp_starter.player || opp_starter,
                        list: [
                            {
                                text: lineup_check_opp[index]?.slot,
                                colSpan: 3
                            },
                            {
                                text: allplayers[opp_starter.player || opp_starter]?.full_name || 'Empty',
                                colSpan: 10,
                                className: 'left',
                                image: {
                                    src: opp_starter.player || opp_starter,
                                    alt: allplayers[opp_starter.player || opp_starter]?.full_name,
                                    type: 'player'
                                }
                            },
                            {
                                text: matchTeam(schedule[state.week]
                                    ?.find(matchup => matchup.team.find(t => matchTeam(t.id) === allplayers[opp_starter.player]?.team))
                                    ?.team
                                    ?.find(team => matchTeam(team.id) !== allplayers[opp_starter.player]?.team)
                                    ?.id) || 'FA',
                                colSpan: 3,
                            },
                            {
                                text: rankings
                                    ? rankings[opp_starter.player || opp_starter]?.prevRank || 999
                                    : (players_projections[opp_starter.player] || 0).toFixed(1),
                                colSpan: 3
                            },
                            {
                                text: matchup_opp?.players_points[opp_starter.player || opp_starter].toFixed(1),
                                colSpan: 4
                            }
                        ]
                    }
                })
                : optimal_lineup?.map((ol, index) => {
                    return {
                        id: ol.player,
                        list: [
                            {
                                text: ol.slot,
                                colSpan: 3,
                                className: 'green'
                            },
                            {
                                text: allplayers[ol.player]?.full_name || ol.player?.toString(),
                                colSpan: 10,
                                className: 'left green',
                                image: {
                                    src: ol.player,
                                    alt: allplayers[ol.player]?.full_name,
                                    type: 'player'
                                }
                            },
                            {
                                text: matchTeam(schedule[state.week]
                                    ?.find(matchup => matchup.team.find(t => matchTeam(t.id) === allplayers[ol.player]?.team))
                                    ?.team
                                    ?.find(team => matchTeam(team.id) !== allplayers[ol.player]?.team)
                                    ?.id) || 'FA',
                                colSpan: 3,
                                className: 'green'
                            },
                            {
                                text: rankings
                                    ? rankings[ol.player]?.prevRank || 999
                                    : (players_projections[ol.player] || 0).toFixed(1),
                                colSpan: 3,
                                className: 'green'
                            },
                            {
                                text: matchup_user?.players_points[ol.player] && matchup_user?.players_points[ol.player].toFixed(1) || ol.player,
                                colSpan: 4,
                                className: 'green'
                            }
                        ]
                    }
                })

    return week < state.week
        ? <>
            <div className="secondary nav">

                <button
                    className={`sync ${syncing ? 'rotate' : 'click'}`}
                    onClick={syncing ? null : () => handleSync(league.league_id)}
                >
                    <i className={`fa-solid fa-arrows-rotate ${syncing ? 'rotate' : ''}`}></i>
                </button>

            </div>
            {
                <>
                    <Roster
                        league={league}
                        roster={{
                            ...league.userRoster,
                            players: matchup_user?.players,
                            starters: matchup_user?.starters,
                        }}
                        type={'tertiary subs'}
                        previous={true}
                        players_projections={players_projections}
                        players_points={matchup_user?.players_points}
                    />
                    <Roster
                        league={league}
                        roster={{
                            ...oppRoster,
                            players: matchup_opp?.players,
                            starters: matchup_opp?.starters
                        }}
                        type={'tertiary subs'}
                        previous={true}
                        players_projections={players_projections}
                        players_points={matchup_opp?.players_points}
                    />
                </>
            }
        </>
        : <>
            <div className="secondary nav">
                <div>
                    <button>
                        Lineup
                    </button>
                </div>
                <button
                    className={`sync ${syncing ? 'rotate' : 'click'}`}
                    onClick={syncing ? null : () => handleSync(league.league_id)}
                >
                    <i className={`fa-solid fa-arrows-rotate ${syncing ? 'rotate' : ''}`}></i>
                </button>
                <div>
                    {
                        itemActive2
                            ? <button
                                className={secondaryContent === 'Options' ? 'active click' : !itemActive2 ? 'inactive' : 'click'}
                                onClick={itemActive2 ? () => dispatch(setState({ secondaryContent: 'Options' }, 'LINEUPS')) : null}
                            >
                                Options
                            </button>
                            : <>
                                <button
                                    className={secondaryContent === 'Optimal' ? 'active click' : 'click'}
                                    onClick={() => dispatch(setState({ secondaryContent: 'Optimal' }, 'LINEUPS'))}
                                >
                                    Optimal
                                </button>

                                <button
                                    className={secondaryContent === 'Opp-Lineup' ? 'active click' : 'click'}
                                    onClick={() => dispatch(setState({ secondaryContent: 'Opp-Lineup' }, 'LINEUPS'))}
                                >
                                    Opp-Lineup
                                </button>
                                <button
                                    className={secondaryContent === 'Opp-Optimal' ? 'active click' : 'click'}
                                    onClick={() => dispatch(setState({ secondaryContent: 'Opp-Optimal' }, 'LINEUPS'))}
                                >
                                    Opp-Optimal
                                </button>
                            </>
                    }

                </div>
            </div>
            {
                lineup_body?.length >= 0 ?
                    <>
                        <TableMain
                            type={'secondary lineup'}
                            headers={lineup_headers}
                            body={lineup_body}
                            itemActive={itemActive2}
                            setItemActive={(value) => dispatch(setState({ itemActive2: value }, 'LINEUPS'))}
                        />
                        <TableMain
                            type={'secondary subs'}
                            headers={subs_headers}
                            body={subs_body}
                        />
                    </>
                    :
                    <div>
                        <h1>No Matchups</h1>
                    </div>
            }
        </>
}

export default Lineups2View;