import express, { Express } from 'express';
import * as bodyParser from "body-parser";
import dotenv from 'dotenv';
import cors from 'cors';
import flash from 'connect-flash';
import { AppDataSource } from "./DataSource";
import userRouter from './route/UserRouter';
import indexRouter from './route/IndexRouter';
import userApiRouter from './route/api/UserApiRouter';
import checkInvalidPath from './middlewares/checkInvalidPath';
import checkInteralServerError from './middlewares/checkError';
dotenv.config();
const PORT = process.env.PORT || 5000;

AppDataSource.initialize().then(async () => {
    // create express app
    const app: Express = express();
    app.use(cors());
    app.use('/public', express.static('./public'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.set('views', './views');
    app.set('view engine', 'ejs');
    // register express routes from defined application routes
    app.use('/', indexRouter);
    app.use('/users', userRouter);
    app.use('/api/users', userApiRouter);
    // application-level middlewares
    // error handler middleware
    app.use(checkInvalidPath);
    app.use(checkInteralServerError);
    // start express server
    app.listen(PORT);
    console.log(`'Node.js web server at http://localhost:${PORT} is running`);
}).catch(error => console.log(error));
