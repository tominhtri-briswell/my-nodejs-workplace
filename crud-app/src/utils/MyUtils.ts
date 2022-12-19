import _ from "lodash";
import { generate } from 'generate-password';

const customCheckEmptyValues = (value: unknown) => {
    return value === undefined || value === '';
};

const isValidDate = (obj: unknown) => {
    return _.isDate(obj) && obj.toString() !== 'Invalid Date';
};

const getRandomPassword = () => {
    return generate({
        length: 16,
        numbers: true,
        uppercase: true,
        symbols: true,
        lowercase: true,
        excludeSimilarCharacters: true, // exclude similar characters like 0O1l
        strict: true // include all types of characters
    });
};

const _1mb = 1024 * 1024;

const _1gb = _1mb * 1024;

export { customCheckEmptyValues, isValidDate, _1mb, _1gb, getRandomPassword };