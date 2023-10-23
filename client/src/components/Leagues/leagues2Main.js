import Leagues2View from "./leagues2View"

const Leagues2Main = ({
    league,
    scoring_settings,
    type,
    standings
}) => {

    return <Leagues2View
        league={league}
        scoring_settings={scoring_settings}
        type={type}
        standings={standings}
    />
}

export default Leagues2Main;