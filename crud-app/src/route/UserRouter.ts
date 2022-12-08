import express, { Request, Response } from 'express';
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
userRouter.get('/list', (req: Request, res: Response) => {
    res.render('users/list');
});

export default userRouter;