import express, { Express } from 'express';
import * as bodyParser from "body-parser";
import dotenv from 'dotenv';
import cors from 'cors';
import flash from 'connect-flash';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { AppDataSource } from "./DataSource";
import adminUserRouter from './route/AdminUserRouter';
import indexRouter from './route/IndexRouter';
import adminUserApiRouter from './route/api/AdminUserApiRouter';
import checkInvalidPath from './middlewares/checkInvalidPath';
import checkInteralServerError from './middlewares/checkError';
import { User } from './entity/User';
import checkLogin from './middlewares/checkIsLoggedIn';
import adminRouter from './route/AdminRouter';
import checkIsLoggedIn from './middlewares/checkIsLoggedIn';
declare module 'express-session' {
    interface SessionData {
        user: User;
        username: string;
        isAuthorized: boolean;
    }
}

dotenv.config();
// secret variable from .env
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET;
const COOKIE_SECRET = process.env.COOKIE_SECRET;

AppDataSource.initialize().then(async () => {

    // create express app
    const app: Express = express();
    app.use(session({
        secret: SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
    }));

    app.use(flash());
    app.use(cors());
    app.use(cookieParser(COOKIE_SECRET));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use('/public', express.static('./public'));
    app.set('views', './views');
    app.set('view engine', 'ejs');
    // register express routes from defined application routes
    app.use('/', indexRouter);
    app.use('/admin', checkIsLoggedIn, adminRouter);
    app.use('/admin/users', checkIsLoggedIn, adminUserRouter);
    app.use('/api/admin/users', checkIsLoggedIn, adminUserApiRouter);
    // error handler middleware
    app.use(checkInvalidPath);
    app.use(checkInteralServerError);
    // start express server
    app.listen(PORT);
    console.log(`'Node.js web server at http://localhost:${PORT} is running`);
}).catch(error => console.log(error));
