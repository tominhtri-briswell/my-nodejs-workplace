import express, { Request, Response } from 'express';
import UserController from '../controller/UserController';
const userRouter = express.Router();

userRouter.get('/index', (req: Request, res: Response) => {
    res.render('users/index');
});
userRouter.get('/new', (req: Request, res: Response) => {
    res.render('users/new');
});
userRouter.get('/edit', (req: Request, res: Response) => {
    res.render('users/edit');
});
userRouter.get('/list', UserController.list);

export default userRouter;