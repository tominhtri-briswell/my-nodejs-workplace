import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { User } from '../entity/User';
import { AppDataSource } from '../DataSource';
import _ from 'lodash';
import axios, { AxiosResponse } from 'axios';
import { hashPassword } from '../utils/BcryptUtils';
import AdminUserApiController from './api/AdminUserApiController';
import { CustomResultData } from '../type/CustomResultData';

class AdminUserController {
    private userRepository = AppDataSource.getRepository(User);

    constructor() {
        this.createNewUser = this.createNewUser.bind(this);
        this.listPage = this.listPage.bind(this);
        this.editPage = this.editPage.bind(this);
        this.search = this.search.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.changePasswordPage = this.changePasswordPage.bind(this);
        this.update = this.update.bind(this);
    }

    async addPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        res.render('admin/users/add', { dataBack: {}, message: flashMessage });
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
            req.flash('message', result.message ?? 'Username or email is already exist!');
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
            res.redirect(`/admin/users/edit/${id}`);
        }
    }

    async listPage(req: Request, res: Response) {
        try {
            const take = req.query.take || '0';
            const limit = req.query.limit || '5';
            const result: CustomResultData = await AdminUserApiController.getAllData(take as string, limit as string);
            const flashMessage = req.flash('message')[0];
            res.render('admin/users/list', { userList: result.data[0], queryBack: {}, dayjs: dayjs, message: flashMessage });
        } catch (error) {
            console.log(error);
        }
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

    async search(req: Request, res: Response) {
        // get req params then map to User
        const result = await AdminUserApiController.searchData(req.query);
        res.render('admin/users/list', { userList: result.data, queryBack: req.query, dayjs: dayjs, message: null });
    }
}

export default new AdminUserController();