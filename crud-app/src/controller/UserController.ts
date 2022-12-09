import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { User } from '../entity/User';
import { AppDataSource } from '../DataSource';
import querystring from 'querystring';
import _ from 'lodash';
class UserController {
    constructor() {
        this.listPage = this.listPage.bind(this);
        this.editPage = this.editPage.bind(this);
    }
    async index(req: Request, res: Response) {
        res.render('users/index');
    }

    async addPage(req: Request, res: Response) {
        if (_.isEmpty(req.query) === false) {
            // console.log(req.query);
            // console.log(querystring.parse(req.url));
            // const user: User = Object.assign(new User(), req.query);
            console.log('co query');
        }
        res.render('users/add');
    }
    async createNewUser(req: Request, res: Response) {
        console.log('after middleware', req.body);
        // get body 
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name, username, password, email, role
        });
        // create query runner
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // start transaction
            await queryRunner.manager.save(user);
            throw new Error();
            await queryRunner.commitTransaction();
            return res.redirect('/users/list');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            // Example: /users/addPage?name=hoho&username=batman&password=1212
            const queryStr = querystring.stringify(req.body);
            return res.redirect('/users/addPage?' + queryStr);
        } finally {
            await queryRunner.release();
        }
    }


    async editPage(req: Request, res: Response) {
        const response = await fetch(`http://localhost:5000/api/users/${req.params.id}`);
        const data = await response.json();
        res.render('users/edit', { user: data });
    }

    async listPage(req: Request, res: Response) {
        const response = await fetch('http://localhost:5000/api/users');
        const data: User = await response.json();
        res.render('users/list', { userList: data, dayjs: dayjs });
    }

    async search(req: Request, res: Response) {
        const { name, username, email, role } = req.query;
        console.log(name, username, email, role);

        res.render('users/list', { dayjs: dayjs });
    }
}

export default new UserController();