import { AppDataSource } from "../DataSource";
import { Request, Response } from 'express';
import fetch from 'node-fetch';

class UserController {
    constructor() {
        this.list = this.list.bind(this);
        this.edit = this.edit.bind(this);
    }

    async list(req: Request, res: Response) {
        const response = await fetch('/api/users', { method: 'GET' });
        const data = await response.json();
        res.render('users/list', { userList: data });
    }

    async edit(req: Request, res: Response) {
        const _user = await fetch('/api/users/' + req.params.id);
        res.render('users/edit');
    }
}

export default new UserController();