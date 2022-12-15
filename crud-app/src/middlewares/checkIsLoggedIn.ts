import { Request, Response, NextFunction } from 'express';
const checkIsLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    res.locals.username = '';
    next();
    // const loggedin = req.session.loggedin;
    // console.log('is logged in: ', loggedin);

    // if (loggedin) {
    //     console.log('login success');
    //     res.locals.username = req.session.user.username;
    //     return next();
    // } else {
    //     console.log('login failed');
    //     req.flash('message', 'You need to logged in to access!');
    //     // res.cookie('return-url', req.originalUrl, { maxAge: 14 * 24 * 3600000, signed: true }); // 2 weeks
    //     const encodedUrl = encodeURIComponent(req.originalUrl);
    //     res.redirect(`/login?redirect=${encodedUrl}`); // 401: unauthorized
    // }
};

export default checkIsLoggedIn;