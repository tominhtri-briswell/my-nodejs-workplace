import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';

const checkReqParamsEmpty = (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
        console.log('Day la middleware cho /users/create GET');
    } else {
        console.log('Day la middleware cho /users/create POST');
        console.log('before', req.body);
        Object.keys(req.body).forEach(key => {
            req.body[key] = req.body[key] === '' ? null : req.body[key];
        });
        console.log('after', req.body);
    }
    next();
};

export default checkReqParamsEmpty;