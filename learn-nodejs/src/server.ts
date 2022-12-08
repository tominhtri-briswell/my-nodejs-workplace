/* eslint-disable @typescript-eslint/no-var-requires */
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import _ from 'lodash';
import { userRouter } from './routes/users.route';
import { productRouter } from './routes/products.route';
import { indexRouter } from './routes/index.route';
import { userApiRouter } from './routes/api/users.api.route';
import { contactRouter } from './routes/contact.route';
dotenv.config();
const port = process.env.PORT;


const app: Express = express();
app.use(cors());
app.use('/public', express.static('./public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', './views');
app.set('view engine', 'ejs');

// router
app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/contact', contactRouter);

// api router
app.use('/api/users', userApiRouter);
// app.use('/api/products');

// error handler middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error("Not found");
    next({
        ...error,
        status: 404
    });
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500).render('error.ejs', {
        error: {
            status: error.status || 500,
            message: error.message || 'Internal Server Error',
        },
    });
});

app.listen(port, () => {
    console.log(`'Node.js web server at http://localhost:${port} is running`);
});

