import { avatar } from "../../functions/misc";
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
            standings={trade.rosters.map(r => {
                const { wins, losses, ties, fpts, fpts_decimal } = r.settings;
                return {
                    roster_id: r.roster_id,
                    username: r.username,
                    avatar: r.avatar,
                    wins, losses, ties,
                    fpts: parseFloat(fpts + '.' + fpts_decimal)
                }

            })}
        />
    </>
}

export default TradeRosters;