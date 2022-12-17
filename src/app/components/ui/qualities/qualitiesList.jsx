import React from "react";
import PropTypes from "prop-types";
import Quality from "./quality";
import { useQualities } from "../../../hooks/useQualities";
import _ from "lodash";
const QualitiesList = ({ qualities }) => {
    const { isLoading } = useQualities();
    const isEmptyQualities = _.isEmpty(qualities);
    if (isLoading) return "Loading...";

    if (isEmptyQualities !== true) {
        return (
            <>
                {qualities.map((qual) => (
                    <Quality key={qual} id={qual} />
                ))}
            </>
        );
    } else return <span>Качества не выбраны</span>;
};

QualitiesList.propTypes = {
    qualities: PropTypes.array
};

export default QualitiesList;
