import express, {  } from 'express';
import IndexController from '../controller/IndexController';
const indexRouter = express.Router();

indexRouter.get('/', IndexController.indexPage);
indexRouter.get('/login', IndexController.loginPage);
indexRouter.post('/login', IndexController.login);
indexRouter.get('/logout', IndexController.logout);

export default indexRouter;