import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import { customCheckEmptyValues } from '../utils/MyUtils';

const checkReqQueryEmpty = (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
        console.log('Day la middleware cho /users/addPage GET');
        // console.log('before', req.query);
        Object.keys(req.query).forEach(key => {
            req.query[key] = customCheckEmptyValues(req.query[key]) ? null : req.query[key];
            console.log(`${req.query[key]} : ${customCheckEmptyValues(req.query[key])}`);
        });
        req.body = req.query;
        // console.log('after', req.query);
    }
    next();
};
export default checkReqQueryEmpty;