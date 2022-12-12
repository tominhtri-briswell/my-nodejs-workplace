import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import { customCheckEmptyValues } from '../utils/MyUtils';

const checkReqParamsEmpty = (req: Request, res: Response, next: NextFunction) => {
    Object.keys(req.body).forEach(key => {
        req.body[key] = customCheckEmptyValues(req.body[key]) ? null : req.body[key];
    });
    next();
};

export default checkReqParamsEmpty;