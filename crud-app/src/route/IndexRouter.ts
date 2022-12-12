import express, { Request, Response } from 'express';
const indexRouter = express.Router();

indexRouter.get('/', (req: Request, res: Response) => {
    res.render('index');
});

indexRouter.get('/login', (req: Request, res: Response) => {
    res.render('security/login');
});

export default indexRouter;