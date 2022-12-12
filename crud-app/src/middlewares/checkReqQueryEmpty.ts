import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import { customCheckEmptyValues } from '../utils/MyUtils';

const checkReqQueryEmpty = (req: Request, res: Response, next: NextFunction) => {
    Object.keys(req.query).forEach(key => {
        req.query[key] = customCheckEmptyValues(req.query[key]) ? null : req.query[key];
    });
    next();
};
export default checkReqQueryEmpty;