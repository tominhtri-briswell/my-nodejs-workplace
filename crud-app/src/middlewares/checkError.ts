import { Request, Response, NextFunction } from 'express';

const checkInteralServerError = (error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500).render('error.ejs', {
        error: {
            status: error.status || 500,
            message: error.message || 'Internal Server Error',
        },
    });
};

export default checkInteralServerError;