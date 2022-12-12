import express, { Request, Response } from 'express';
import UserController from '../controller/UserController';
import checkReqParamsEmpty from '../middlewares/checkReqParamsEmpty';
import checkReqQueryEmpty from '../middlewares/checkReqQueryEmpty';
const userRouter = express.Router();

// router level middlewares
userRouter.use('/addPage', checkReqParamsEmpty);
userRouter.use('/addPage', checkReqQueryEmpty);
userRouter.use('/search', checkReqQueryEmpty);
userRouter.use('/update', checkReqParamsEmpty);

// base path: /users/
userRouter.get('/index', UserController.index);
userRouter.get('/addPage', UserController.addPage);
userRouter.post('/addPage', UserController.createNewUser);
userRouter.get('/edit/:id', UserController.editPage);
userRouter.post('/update', UserController.update);
userRouter.get('/list', UserController.listPage);
userRouter.get('/search', UserController.search);

export default userRouter;