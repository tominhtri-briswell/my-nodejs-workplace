import express, { Request, Response } from "express";

const userRouter = express.Router();

// for routing
userRouter.get('/', (req: Request, res: Response) => {
    res.render('users/index');
});

// for api 

export { userRouter };
