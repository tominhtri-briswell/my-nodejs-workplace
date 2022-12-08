import express, { Request, Response } from "express";

const contactRouter = express.Router();

contactRouter.get('/', (req: Request, res: Response) => {
    res.render('contact-form');
});
contactRouter.post('/', (req: Request, res: Response) => {
    res.send(req.body);
});

export { contactRouter };
