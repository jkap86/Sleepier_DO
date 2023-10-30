import Leagues2Main from "../Leagues/leagues2Main";

const TradeRosters = ({
    trade
}) => {

    return <>
        <Leagues2Main
            league={{
                roster_positions: trade['league.roster_positions'],
                rosters: trade.rosters,
                settings: trade['league.settings']
            }}
            scoring_settings={trade['league.scoring_settings']}
        />
    </>
}

export default TradeRosters;