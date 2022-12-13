import { Request, Response } from 'express';

class AdminController {
    constructor() {
        this.adminIndexPage = this.adminIndexPage.bind(this);
    }

    async adminIndexPage(req: Request, res: Response) {
        res.render('admin/index');
    }
}

export default new AdminController();
