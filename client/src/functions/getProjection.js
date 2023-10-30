
export const getProjection = (league_id, playoff_week_start, lineupChecks, state) => {
    return Object.keys(lineupChecks)
        .filter(key => parseInt(key) >= state.week && (parseInt(key) < playoff_week_start - 1 || playoff_week_start === 0))
        .reduce((acc, cur) => {
            return {
                wins: acc.wins
                    + (lineupChecks[cur]['true-true']?.[league_id]?.win || 0)
                    + (lineupChecks[cur]['true-true']?.[league_id]?.median_win || 0),
                losses: acc.losses
                    + (lineupChecks[cur]['true-true']?.[league_id]?.loss || 0)
                    + (lineupChecks[cur]['true-true']?.[league_id]?.median_loss || 0),
                ties: acc.ties + (lineupChecks[cur]['true-true']?.[league_id]?.tie || 0),
                fpts: acc.fpts + lineupChecks[cur]['true-true']?.[league_id]?.lc_user?.proj_score_optimal || 0,
                fpts_against: acc.fpts_against + lineupChecks[cur]['true-true']?.[league_id]?.lc_opp?.proj_score_optimal || 0
            }
        }, {
            wins: 0,
            losses: 0,
            ties: 0,
            fpts: 0,
            fpts_against: 0
        })
}
