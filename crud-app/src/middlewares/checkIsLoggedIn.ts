import { Request, Response, NextFunction } from 'express';

const checkIsLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    const { user, username } = req.session;
    if (user || username) {
        console.log('login success');
        next();
    } else {
        console.log('login failed');
        req.flash('message', 'You need to logged in to access!');
        // set return url
        res.cookie('return-url', req.originalUrl, { maxAge: 14 * 24 * 3600000, signed: true }); // 2 weeks
        res.status(401).redirect('/login'); // 401: unauthorized
    }
};

export default checkIsLoggedIn;