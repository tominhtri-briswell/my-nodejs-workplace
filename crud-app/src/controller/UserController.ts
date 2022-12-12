import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { User } from '../entity/User';
import { AppDataSource } from '../DataSource';
import _ from 'lodash';
import { Like } from 'typeorm';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { comparePassword, hashPassword } from '../utils/BcryptUtils';

class UserController {
    private userRepository = AppDataSource.getRepository(User);

    constructor() {
        this.index = this.index.bind(this);
        this.createNewUser = this.createNewUser.bind(this);
        this.listPage = this.listPage.bind(this);
        this.editPage = this.editPage.bind(this);
        this.search = this.search.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.changePasswordPage = this.changePasswordPage.bind(this);
        this.update = this.update.bind(this);
    }
    async index(req: Request, res: Response) {
        res.render('users/index');
    }

    async addPage(req: Request, res: Response) {
        res.render('users/add', { dataBack: {}, error: '' });
    }
    async createNewUser(req: Request, res: Response) {
        // get body 
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name, username, password, email, role
        });
        // check exist email, username
        const findUser: User | null = await this.userRepository.findOneBy({ name: name, username: username });
        if (findUser) {
            return res.redirect('/users/list');
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
            return res.redirect('/users/list');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return res.render('users/add', { dataBack: req.body, error: error });
        } finally {
            await queryRunner.release();
        }
    }

    async editPage(req: Request, res: Response) {
        const response = await fetch(`http://localhost:5000/api/users/${req.params.id}`);
        if (response.status === 404) {
            res.redirect('/users/list');
        }
        const data = await response.json();
        res.render('users/edit', { dataBack: {}, error: {}, user: data });
    }
    async update(req: Request, res: Response) {
        const { id, name, username, email, role } = req.body;
        const response = await axios.put(`http://localhost:5000/api/users/${id}`, { name, username, email, role });
        if (response.status === 200) {
            console.log('Update successfully!');
            res.redirect('/users/list');
        } else {
            res.redirect(`/users/edit/${id}`);
        }
    }

    async listPage(req: Request, res: Response) {
        const response = await fetch('http://localhost:5000/api/users');
        const data: User = await response.json();
        res.render('users/list', { userList: data, queryBack: {}, dayjs: dayjs });
    }

    async changePassword(req: Request, res: Response) {
        const { id, password } = req.body;
        console.log(password);
        const response = await axios.put(`http://localhost:5000/api/users/${id}`, { password });
        if (response.status === 200) {
            console.log('Update password successfully!');
        }
        res.redirect(`/users/edit/${id}`);
    }
    async changePasswordPage(req: Request, res: Response) {
        const id = req.params.id;
        res.render('users/change-password', { userId: id });
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
            builder.andWhere('user.role = :role', { role: role });
        }
        const result = await builder.getMany();
        res.render('users/list', { userList: result, queryBack: req.query, dayjs: dayjs });
    }
}

export default new UserController();