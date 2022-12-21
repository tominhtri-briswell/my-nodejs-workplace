import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { User } from '../entity/User';
import { AppDataSource } from '../DataSource';
import _ from 'lodash';
import AdminUserApiController from './api/AdminUserApiController';
import { CustomApiResult } from '../type/MyCustomType';

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
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        // get body 
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name, username, password, email, role
        });
        try {
            const result: CustomApiResult<User> = await AdminUserApiController.insertData(user, null, false, true, queryRunner);
            if (result.status === 400 || result.status === 500) {
                await queryRunner.rollbackTransaction();
                req.flash('message', result.message ?? 'Error when create user!');
                req.flash('dataBack', req.body);
                return res.redirect('/admin/users/addPage');
            }
            await queryRunner.commitTransaction();
            req.flash('message', result.message ?? 'New user created!!');
            return res.redirect('/admin/users/list');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            req.flash('message', error.message ?? 'Error when create user!');
            req.flash('dataBack', req.body);
            return res.redirect('/admin/users/addPage');
        } finally {
            await queryRunner.release();
        }
    }

    async editPage(req: Request, res: Response) {
        const { id } = req.params;
        const result: CustomApiResult<User> = await AdminUserApiController.getOneData(parseInt(id));
        if (result.status === 200) {
            const flashMessage = req.flash('message')[0];
            res.render('admin/users/edit', { dataBack: {}, message: flashMessage, user: result.data });
        } else {
            req.flash("message", `Can't find user with id: ${id}`);
            res.redirect('/admin/users/list');
        }
    }
    async update(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { id, name, username, email, role } = req.body;
        const user: User = Object.assign(new User(), { id, name, username, email, role });

        try {
            const result: CustomApiResult<User> = await AdminUserApiController.updateData(user, null, false, queryRunner);
            if (result.status === 404) {
                req.flash('message', result.message ?? `Can't find user!`);
                res.redirect('/admin/users/list');
            }
            await queryRunner.commitTransaction();
            req.flash('message', result.message ?? 'Update successfully!');
            res.redirect('/admin/users/list');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            req.flash('message', error.message ?? 'Can not update user!');
            res.redirect(`/admin/users/edit/${id.trim()}`);
        } finally {
            await queryRunner.release();
        }
    }

    async listPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        res.render('admin/users/list', { queryBack: {}, dayjs: dayjs, message: flashMessage });
    }

    async changePassword(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { id, password } = req.body;
        const user: User = Object.assign(new User(), { id, password });
        try {
            const result: CustomApiResult<User> = await AdminUserApiController.updateData(user, null, false, queryRunner);
            if (result.status === 404) {
                req.flash('message', result.message ?? `Can't find user!`);
            }
            await queryRunner.commitTransaction();
            req.flash('message', result.message ?? 'Password changed successfully!');
            res.redirect(`/admin/users/edit/${id}`);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            req.flash('message', error.message ?? 'Error when trying to update password! Please try again');
            res.redirect(`/admin/users/edit/${id}`);
        } finally {
            await queryRunner.release();
        }
    }
    async changePasswordPage(req: Request, res: Response) {
        const id = req.params.id;
        res.render('admin/users/change-password', { userId: id });
    }
}

export default new AdminUserController();