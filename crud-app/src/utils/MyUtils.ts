import _ from "lodash";
import { generate } from 'generate-password';
import { DataSource } from "typeorm";

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

const bench = () => {
    const iterations = 100000;
    let startTime;
    const start = () => {
        startTime = new Date().getTime();
    };

    const end = () => {
        const endTime = new Date().getTime();
        const time = endTime - startTime;
        console.info(`time: ${time}ms, op: ${time / iterations}ms`);
    };

    return { start, end };
};

const _1mb = 1024 * 1024;

const _1gb = _1mb * 1024;

export { customCheckEmptyValues, isValidDate, _1mb, _1gb, getRandomPassword, bench };