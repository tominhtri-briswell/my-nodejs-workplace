import express, { Request, Response } from 'express';
const indexRouter = express.Router();

indexRouter.get('/', (req: Request, res: Response) => {
    res.redirect('/users/index');
});

export default indexRouter;