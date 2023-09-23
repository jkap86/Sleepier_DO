import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setState } from "../../redux/actions/state";

const ProjectedRecords = () => {
    const dispatch = useDispatch();
    const { lineupChecks } = useSelector(state => state.lineups);


    useEffect(() => {

    }, [])

    return <>

    </>
}

export default ProjectedRecords;