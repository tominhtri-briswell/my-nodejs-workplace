import _ from "lodash";

const customCheckEmptyValues = (value: unknown) => {
    return value === undefined || value === '';
};

const isValidDate = (obj: unknown) => {
    return _.isDate(obj) && obj.toString() !== 'Invalid Date';
};

export { customCheckEmptyValues, isValidDate };