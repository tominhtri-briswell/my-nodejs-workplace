import { Request, Response } from 'express';
import _ from 'lodash';
import { AppDataSource } from '../../DataSource';
import { User } from '../../entity/User';
import { CustomResultData } from '../../type/CustomResultData';
import { DataTableResultData } from '../../type/DataTableResultData';
import { hashPassword } from '../../utils/BcryptUtils';



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
        const result: CustomResultData = await this.getAllData(take as string, limit as string);
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
    async getAllData(take?: string, limit?: string): Promise<CustomResultData> {
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

    async getOneData(id: number): Promise<CustomResultData> {
        const findUser: User | null = await this.userRepository.findOneBy({ id: id });
        if (!findUser) {
            return { message: `User ID ${id} Not Found!`, status: 404 };
        }
        return { message: `Found user with id ${id}`, data: findUser, status: 200 };
    }

    async saveData(user: User): Promise<CustomResultData> {
        // create query builder to check exist email, username
        const builder = this.userRepository.createQueryBuilder('user').where('');
        if (user.username) {
            builder.orWhere('user.username = :username', { username: `${user.username}` });
            const result = await builder.getMany();
            if (result.length > 0) {
                return { message: "Username is already exist!", status: 400 };
            }
        }
        if (user.email) {
            builder.orWhere('user.email = :email', { email: `${user.email}` });
            const result = await builder.getMany();
            if (result.length > 0) {
                return { message: "Email is already exist!", status: 400 };
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
    async updateData(user: User): Promise<CustomResultData> {
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

    async removeData(id: number): Promise<CustomResultData> {
        const userToRemove: User | null = await this.userRepository.findOneBy({ id });
        if (!userToRemove) {
            return { message: `User ID ${id} Not Found`, status: 404 };
        }
        await this.userRepository.remove(userToRemove);
        return { message: `User removed successfully`, status: 200 };
    }
    async searchData(query: Record<string, unknown>): Promise<DataTableResultData> {
        const { draw, length, start, name, username, email, role } = query;

        const builder = this.userRepository.createQueryBuilder('user').where('');
        // check if queries exist then concat them with sql query
        if (!_.isNil(length)) {
            builder.limit(parseInt(length as string));
        }
        if (!_.isNil(start) && !_.isNil(length)) {
            builder.offset(parseInt(start as string));
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
        const data: string | User[] = await builder.getMany(); //get data 
        const recordsTotal: number = await this.userRepository.createQueryBuilder('user').select('user').getCount(); // get total records count
        const recordsFiltered: number = recordsTotal; // get filterd records count
        
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
