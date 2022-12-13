import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { User } from '../entity/User';
import { AppDataSource } from '../DataSource';
import _ from 'lodash';
import { Like } from 'typeorm';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { comparePassword, hashPassword } from '../utils/BcryptUtils';

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
        const builder = this.userRepository.createQueryBuilder('user').where('');
        if (username) {
            builder.orWhere('user.username = :username', { username: `${username}` });
            const result = await builder.getMany();
            if (result.length > 0) {
                req.flash('message', 'Username is already exist!');
                return res.redirect('/admin/users/addPage');
            }
        }
        if (email) {
            builder.orWhere('user.email = :email', { email: `${email}` });
            const result = await builder.getMany();
            if (result.length > 0) {
                req.flash('message', 'Email is already exist!');
                return res.redirect('/admin/users/addPage');
            }
        }
        user.created_at = new Date();
        // hash password with bcrypt
        const hashed = await hashPassword(user.password);
        user.password = hashed;
        // create query runner
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // start transaction
            await queryRunner.manager.save(user);
            // throw new Error();
            await queryRunner.commitTransaction();
            return res.redirect('/admin/users/list');
        } catch (error) {
            // rollback if catch error
            await queryRunner.rollbackTransaction();
            return res.render('admin/users/add', { dataBack: req.body, message: error.message });
        } finally {
            await queryRunner.release();
        }
    }

    async editPage(req: Request, res: Response) {
        const id = req.params.id;
        const response = await fetch(`http://localhost:5000/api/admin/users/${id}`);
        if (response.ok) {
            const data = await response.json();
            const flashMessage = req.flash('message')[0];
            res.render('admin/users/edit', { dataBack: {}, message: flashMessage, user: data });
        } else {
            req.flash("message", `Can't find user with id: ${id}`);
            res.redirect('/admin/users/list');
        }
    }
    async update(req: Request, res: Response) {
        const { id, name, username, email, role } = req.body;
        const response = await axios.put(`http://localhost:5000/api/admin/users/${id}`, { name, username, email, role });
        if (response.status === 200) {
            console.log('Update successfully!');
            res.redirect('/admin/users/list');
        } else {
            req.flash('message', 'Can not update user!');
            res.redirect(`/admin/users/edit/${id}`);
        }
    }

    async listPage(req: Request, res: Response) {
        const response = await fetch('http://localhost:5000/api/admin/users');
        const data: User[] = await response.json();
        const flashMessage = req.flash('message')[0];
        res.render('admin/users/list', { userList: data, queryBack: {}, dayjs: dayjs, message: flashMessage });
    }

    async changePassword(req: Request, res: Response) {
        const { id, password } = req.body; const response = await axios.put(`http://localhost:5000/api/admin/users/${id}`, { password });
        if (response.status === 200) {
            req.flash('message', 'Password changed successfully!');
        } else {
            req.flash('message', 'Error when trying to update password! Please try again');
        }
        res.redirect(`/admin/users/edit/${id}`);
    }
    async changePasswordPage(req: Request, res: Response) {
        const id = req.params.id;
        res.render('admin/users/change-password', { userId: id });
    }

    async search(req: Request, res: Response) {
        // get req params then map to User
        const { name, username, email, role } = req.query;
        // create query builder
        const builder = this.userRepository.createQueryBuilder('user').where('');
        // check if queries exist then concat them with sql query
        if (!_.isNil(name)) {
            builder.andWhere('user.name LIKE :name', { name: `%${name}%` });
        }
        if (!_.isNil(username)) {
            builder.andWhere('user.username LIKE :username', { username: `%${username}%` });
        }
        if (!_.isNil(email)) {
            builder.andWhere('user.email LIKE :email', { email: `%${email}%` });
        }
        if (!_.isNil(role)) {
            builder.andWhere('user.role IN (:role)', { role: role });
        }
        const result = await builder.getMany();
        res.render('admin/users/list', { userList: result, queryBack: req.query, dayjs: dayjs, message: null });
    }
}

export default new AdminUserController();