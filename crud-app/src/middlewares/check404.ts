import { Request, Response, NextFunction } from 'express';

const checkNotFoundError = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error("Not found");
    next({
        ...error,
        status: 404
    });
};

export default checkNotFoundError;