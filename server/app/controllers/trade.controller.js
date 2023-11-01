'use strict'
const db = require("../models");
const User = db.users;
const Trade = db.trades;
const League = db.leagues;
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;


exports.leaguemate = async (req, res) => {

    let filters = [];

    if (req.body.manager) {
        filters.push({
            managers: {
                [Op.contains]: [req.body.manager]
            }
        })
    }

    if (req.body.player) {
        if (req.body.player.includes('.')) {
            const pick_split = req.body.player.split(' ')
            const season = pick_split[0]
            const round = parseInt(pick_split[1]?.split('.')[0])
            const order = parseInt(season) === parseInt(new Date().getFullYear()) ? parseInt(pick_split[1]?.split('.')[1]) : null

            filters.push({
                players: {
                    [Op.contains]: [`${season} ${round}.${order}`]
                }

            })
        } else {
            filters.push({
                players: {
                    [Op.contains]: [req.body.player]
                }

            })
        }
    }

    if (req.body.trade_date) {
        filters.push({
            status_updated: {
                [Op.and]: [
                    { [Op.lt]: new Date(req.body.trade_date).getTime() },
                    { [Op.gt]: new Date(new Date(req.body.trade_date) - 7 * 24 * 60 * 60 * 1000).getTime() }
                ]
            }
        })
    }

    let league_filters = [];


    if (req.body.type1 === 'Dynasty') {
        league_filters.push({
            settings: {
                type: 2
            }
        })
    } else if (req.body.type1 === 'Redraft') {
        league_filters.push({
            settings: {
                type: { [Op.not]: 2 }
            }
        })
    }

    if (req.body.type2 === 'Bestball') {
        league_filters.push({
            settings: {
                best_ball: 1
            }
        })
    } else if (req.body.type2 === 'Lineup') {
        league_filters.push({
            settings: {
                best_ball: { [Op.not]: 1 }
            }
        })
    }

    let lmTrades;

    try {
        lmTrades = await Trade.findAndCountAll({
            order: [['status_updated', 'DESC']],
            offset: req.body.offset,
            limit: req.body.limit,
            where: { [Op.and]: filters },
            attributes: ['transaction_id', 'status_updated', 'rosters', 'managers', 'adds', 'drops', 'draft_picks', 'leagueLeagueId'],
            include: [
                {
                    model: League,
                    attributes: ['league_id', 'name', 'avatar', 'roster_positions', 'scoring_settings', 'settings'],
                    where: { [Op.and]: league_filters }
                },
                {
                    model: User,
                    attributes: [],
                    through: { attributes: [] },
                    include: {
                        model: League,
                        attributes: [],
                        through: { attributes: [] },
                        include: {
                            model: User,
                            attributes: [],
                            through: { attributes: [] },
                            where: {
                                user_id: req.body.user_id
                            },
                            duplicating: false,
                            subQuery: false
                        },
                        duplicating: false,
                        required: true,
                        subQuery: false

                    },
                    duplicating: false,
                    required: true
                }
            ],
            group: ['trade.transaction_id', 'league.league_id'],
            raw: true
        })
    } catch (error) {
        console.log(error)
    }

    const trades_to_send = {
        rows: lmTrades.rows,
        count: lmTrades?.count?.length
    }


    res.send(trades_to_send)

}

exports.pricecheck = async (req, res) => {

    let filters = [];

    if (req.body.player.includes('.')) {
        const pick_split = req.body.player.split(' ')
        const season = pick_split[0]
        const round = parseInt(pick_split[1]?.split('.')[0])
        const order = parseInt(pick_split[1]?.split('.')[1])

        filters.push({
            price_check: {
                [Op.contains]: [`${season} ${round}.${order}`]
            }
        })
    } else {
        filters.push({
            price_check: {
                [Op.contains]: [req.body.player]
            }

        })
    }

    if (req.body.player2) {
        if (req.body.player2.includes('.')) {
            const pick_split = req.body.player2.split(' ')
            const season = pick_split[0]
            const round = parseInt(pick_split[1]?.split('.')[0])
            const order = parseInt(pick_split[1]?.split('.')[1])

            filters.push({
                players: {
                    [Op.contains]: [`${season} ${round}.${order}`]
                }
            })
        } else {
            filters.push({
                players: {
                    [Op.contains]: [req.body.player2]
                }
            })
        }


    }


    let pcTrades;
    let players2;

    try {
        pcTrades = await Trade.findAndCountAll({
            order: [['status_updated', 'DESC']],
            offset: req.body.offset,
            limit: req.body.limit,
            where: {
                [Op.and]: filters
            },
            attributes: ['transaction_id', 'status_updated', 'rosters', 'managers', 'adds', 'drops', 'draft_picks', 'leagueLeagueId'],
            include: {
                model: League,
                attributes: ['name', 'avatar', 'scoring_settings', 'roster_positions', 'settings']
            },
            raw: true
        })


    } catch (error) {
        console.log(error)
    }


    res.send(pcTrades)

}
