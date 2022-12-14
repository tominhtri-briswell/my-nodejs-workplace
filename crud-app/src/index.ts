import express, { Express } from 'express';
import * as bodyParser from "body-parser";
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
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
import adminRouter from './route/AdminRouter';
import checkIsLoggedIn from './middlewares/checkIsLoggedIn';
import path from 'path';
import upload from 'multer';
declare module 'express-session' {
    interface SessionData {
        user: User;
        username: string;
        loggedin: boolean;
        authority: number;
        userId: number;
        searchQuery: Record<string, unknown>;
    }
}
dotenv.config();
// secret variable from .env
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET;
const COOKIE_SECRET = process.env.COOKIE_SECRET;

AppDataSource.initialize().then(async () => {
    // create express app
    const app: Express = express();
    app.use(session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    }));
    // setting middlewares
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser(COOKIE_SECRET));
    app.use('/public', express.static('./public'));
    app.set('views', './views');
    app.set('view engine', 'ejs');
    app.use(flash());
    app.use(cors());
    // logging
    if (NODE_ENV === 'production') {
        const accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' });
        console.log(path.join(__dirname, '../access.log'));
        app.use(morgan('common', { stream: accessLogStream }));
    }
    // app.use(morgan("dev"));
    // register express routes from defined application routes
    app.use('/', indexRouter);
    app.use(checkIsLoggedIn);
    app.use('/admin', adminRouter);
    app.use('/admin/users', adminUserRouter);
    app.use('/api/admin/users', adminUserApiRouter);
    // error handler middleware
    app.use(checkInvalidPath);
    app.use(checkInteralServerError);
    // start express server
    app.listen(PORT);
    console.log(`'Node.js web server at http://localhost:${PORT} is running`);
}).catch(error => console.log(error));
