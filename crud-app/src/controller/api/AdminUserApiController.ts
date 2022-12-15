import { Request, Response } from 'express';
import _ from 'lodash';
import { AppDataSource } from '../../DataSource';
import { User } from '../../entity/User';
import { CustomApiResult, CustomDataTableResult, CustomValidateResult } from '../../type/MyCustomType';
import { hashPassword } from '../../utils/BcryptUtils';
import { isValidDate } from '../../utils/MyUtils';

class AdminUserApiController {
    private userRepository = AppDataSource.getRepository(User);

    constructor() {
        this.getAll = this.getAll.bind(this);
        this.search = this.search.bind(this);
        this.getOne = this.getOne.bind(this);
        this.save = this.save.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
    }

    //for routing control purposes - START
    async getAll(req: Request, res: Response) {
        const { take, limit } = req.query;
        const result: CustomApiResult = await this.getAllData(take as string, limit as string);
        // eslint-disable-next-line prefer-const
        return res.status(result.status).json(result);
    }
    async search(req: Request, res: Response) {
        return res.status(200).json(await this.searchData(req.query));
    }
    async getOne(req: Request, res: Response) {
        const result = await this.getOneData(parseInt(req.params.id));
        return res.status(result.status).json(result);
    }
    async save(req: Request, res: Response) {
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name, username, password, email, role
        });
        const result = await this.saveData(user);
        return res.status(200).json(result);
    }
    async update(req: Request, res: Response) {
        const { name, username, password, email, role } = req.body;
        const id = req.params.id;
        const user: User = Object.assign(new User(), {
            id, name, username, password, email, role
        });
        const result = await this.updateData(user);
        return res.status(result.status).json(result);
    }
    async remove(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const result = await this.removeData(id);
        return res.status(result.status).json(result);
    }
    //for routing control purposes - END

    // for process data purposes, self-calling in the application - START
    async getAllData(take?: string, limit?: string): Promise<CustomApiResult> {
        const builder = this.userRepository.createQueryBuilder('user').select('user');
        let users: User[];
        try {
            // check if limit query is exist to prevent: typeorm RDBMS does not support OFFSET without LIMIT in SELECT statements
            let hasLimit = false;
            if (!_.isNil(limit) && !_.isEmpty(limit)) {
                const _limit = parseInt(limit);
                if (_.isFinite(_limit)) {
                    hasLimit = true;
                    builder.limit(_limit);
                }
            }
            if (!_.isNil(take) && !_.isEmpty(take) && hasLimit) {
                const _take = parseInt(take);
                if (_.isFinite(_take)) {
                    builder.offset(_take);
                }
            }
            users = await builder.getMany();
        } catch (error) {
            users = await this.userRepository.find();
            console.log(error.message);
        }
        // users = await this.userRepository.find();
        return { data: users, status: 200 };
    }

    async getOneData(id: number): Promise<CustomApiResult> {
        const findUser: User | null = await this.userRepository.findOneBy({ id: id });
        if (!findUser) {
            return { message: `User ID ${id} Not Found!`, status: 404 };
        }
        return { message: `Found user with id ${id}`, data: findUser, status: 200 };
    }

    async validateUser(user: User): Promise<CustomValidateResult> {
        const builder = this.userRepository.createQueryBuilder('user').where('');
        let message: string;
        let isValid: boolean;
        const result = {
            message: message,
            isValid: isValid,
        };
        if (user.username) {
            builder.orWhere('user.username = :username', { username: `${user.username}` });
            const list = await builder.getMany();
            if (list.length > 0) {
                result.message = 'Username is already exist!';
                result.isValid = false;
                return result;
            }
        }
        if (user.email) {
            builder.orWhere('user.email = :email', { email: `${user.email}` });
            const list = await builder.getMany();
            if (list.length > 0) {
                result.message = 'Email is already exist!';
                result.isValid = false;
                return result;
            }
        }

        return { message: 'Email and username is unique!', isValid: true };

    }

    async saveData(user: User): Promise<CustomApiResult> {
        // check all input is null and is already exist(middleware already convert '' to null)
        const validateUser = await this.validateUser(user);
        if (!validateUser.isValid) {
            return { message: validateUser.message, status: 400 };
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
            const newUser: User = await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();
            return { message: "User saved successfully", data: newUser, status: 200 };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { message: "Error! Can't save new user!", status: 500 };
        } finally {
            await queryRunner.release();
        }
    }
    async updateData(user: User): Promise<CustomApiResult> {
        // create query runner
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        user.updated_at = new Date();
        if (!_.isNil(user.password)) {
            const hashed = await hashPassword(user.password);
            user.password = hashed;
        }
        // check if user exist by id
        const findUser: User | null = await this.userRepository.findOneBy({ id: user.id });
        if (!findUser) {
            return { message: `User ${user.id} not found`, status: 404 };
        }
        // start transaction
        try {
            await queryRunner.manager.update(User, user.id, user);
            const updatedUser: User | null = await this.userRepository.findOneBy({ id: user.id });
            await queryRunner.commitTransaction();
            return { message: `Update user successfully!`, data: updatedUser, status: 200 };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { message: `Error when update user`, status: 500 };
        } finally {
            await queryRunner.release();
        }
    }

    async removeData(id: number): Promise<CustomApiResult> {
        const userToRemove: User | null = await this.userRepository.findOneBy({ id });
        if (!userToRemove) {
            return { message: `User ID ${id} Not Found`, status: 404 };
        }
        await this.userRepository.remove(userToRemove);
        return { message: `User removed successfully`, status: 200 };
    }
    async searchData(query: Record<string, unknown>): Promise<CustomDataTableResult> {
        const { draw, length, start, name, username, email, role, createdDateFrom, createdDateTo } = query;
        const builder = this.userRepository.createQueryBuilder('user').where('');

        let data: string | User[];
        const recordsTotal: number = await this.userRepository.createQueryBuilder('user').select('user').getCount(); // get total records count
        const recordsFiltered: number = recordsTotal; // get filterd records count

        try {
            // let isFromAndToDateEqual = false;
            // check if queries exist then concat them with sql query
            if (!_.isNil(length)) {
                builder.limit(parseInt(length as string));
            }
            // check both start end length for error: typeorm RDBMS does not support OFFSET without LIMIT in SELECT statements
            if (!_.isNil(start) && !_.isNil(length)) {
                builder.offset(parseInt(start as string));
            }
            if (!_.isNil(createdDateFrom) && isValidDate(new Date(createdDateFrom as string))) {
                builder.andWhere('Date(user.created_at) >= :fromDate', { fromDate: `${createdDateFrom}` });
            }
            if (!_.isNil(createdDateTo) && isValidDate(new Date(createdDateTo as string))) {
                builder.andWhere('Date(user.created_at) <= :toDate', { toDate: `${createdDateTo}` });
            }
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
            data = await builder.getMany(); //get data 
        } catch (error) {
            // if error then find all
            console.log(error);
            data = await this.userRepository.find();
        }

        const returnData = {
            draw: draw as number,
            recordsTotal: recordsTotal,
            recordsFiltered: recordsFiltered,
            data: data,
        };

        return returnData;
    }
    // for process data purposes, self-calling in the application - END


}

export default new AdminUserApiController();
