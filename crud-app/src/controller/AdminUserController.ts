import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { User } from '../entity/User';
import { AppDataSource } from '../DataSource';
import _ from 'lodash';
import AdminUserApiController from './api/AdminUserApiController';

class AdminUserController {
    private userRepository = AppDataSource.getRepository(User);

    constructor() {
        this.createNewUser = this.createNewUser.bind(this);
        this.listPage = this.listPage.bind(this);
        this.editPage = this.editPage.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.changePasswordPage = this.changePasswordPage.bind(this);
        this.update = this.update.bind(this);
    }

    async addPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        const dataBack = req.flash('dataBack')[0];
        res.render('admin/users/add', { dataBack: dataBack ?? {}, message: flashMessage });
    }
    async createNewUser(req: Request, res: Response) {
        // get body 
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name, username, password, email, role
        });
        // create query builder to check exist email, username
        const result = await AdminUserApiController.saveData(user);
        if (result.status === 400) {
            req.flash('message', result.message ?? 'Error when create user!');
            req.flash('dataBack', req.body);
            return res.redirect('/admin/users/addPage');
        }
        if (result.status === 500) {
            return res.render('admin/users/add', { dataBack: req.body, message: result.message });
        }
        req.flash('message', result.message ?? 'New user created!!');
        return res.redirect('/admin/users/list');
    }

    async editPage(req: Request, res: Response) {
        const { id } = req.params;
        const result = await AdminUserApiController.getOneData(parseInt(id));
        if (result.status === 200) {
            const flashMessage = req.flash('message')[0];
            res.render('admin/users/edit', { dataBack: {}, message: flashMessage, user: result.data });
        } else {
            req.flash("message", `Can't find user with id: ${id}`);
            res.redirect('/admin/users/list');
        }
    }
    async update(req: Request, res: Response) {
        const { id, name, username, email, role } = req.body;
        const user: User = Object.assign(new User(), { id, name, username, email, role });
        const result = await AdminUserApiController.updateData(user);
        if (result.status === 200) {
            req.flash('message', result.message ?? 'Update successfully!');
            res.redirect('/admin/users/list');
        } else {
            req.flash('message', result.message ?? 'Can not update user!');
            res.redirect(`/admin/users/edit/${id.trim()}`);
        }
    }

    async listPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        res.render('admin/users/list', { queryBack: {}, dayjs: dayjs, message: flashMessage });
    }

    async changePassword(req: Request, res: Response) {
        const { id, password } = req.body;
        const user: User = Object.assign(new User(), { id, password });
        const result = await AdminUserApiController.updateData(user);
        if (result.status === 200) {
            req.flash('message', result.message ?? 'Password changed successfully!');
        } else {
            req.flash('message', result.message ?? 'Error when trying to update password! Please try again');
        }
        res.redirect(`/admin/users/edit/${id}`);
    }
    async changePasswordPage(req: Request, res: Response) {
        const id = req.params.id;
        res.render('admin/users/change-password', { userId: id });
    }
}

export default new AdminUserController();