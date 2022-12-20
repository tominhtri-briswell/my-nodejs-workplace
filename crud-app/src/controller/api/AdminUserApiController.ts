import { Request, Response } from 'express';
import _ from 'lodash';
import * as fs from 'fs';
import * as csv from 'csv-parse';
import v from 'validator';
import { AppDataSource } from '../../DataSource';
import { User } from '../../entity/User';
import { CustomApiResult, CustomDataTableResult, CustomValidateResult } from '../../type/MyCustomType';
import { hashPassword } from '../../utils/BcryptUtils';
import { getRandomPassword, isValidDate, _1mb } from '../../utils/MyUtils';
import { InsertResult, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { validate, ValidationError } from 'class-validator';

class AdminUserApiController {
    private userRepository = AppDataSource.getRepository(User);

    constructor() {
        this.getAll = this.getAll.bind(this);
        this.search = this.search.bind(this);
        this.getOne = this.getOne.bind(this);
        this.save = this.save.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
        this.importCsv = this.importCsv.bind(this);
        this.exportCsv = this.exportCsv.bind(this);
    }

    //for routing control purposes - START
    async getAll(req: Request, res: Response) {
        const { take, limit } = req.query;
        const result: CustomApiResult<User> = await this.getAllData(take as string, limit as string);
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
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name, username, password, email, role
        });
        const result = await this.insertData(user, false, true, queryRunner);
        return res.status(200).json(result);
    }
    async update(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { name, username, password, email, role } = req.body;
        const id = req.params.id;
        const user: User = Object.assign(new User(), {
            id, name, username, password, email, role
        });
        const result = await this.updateData(user, false, queryRunner);
        return res.status(result.status).json(result);
    }
    async remove(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const result = await this.removeData(id);
        return res.status(result.status).json(result);
    }
    async importCsv(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const msgObj: CustomApiResult<User> = { messages: [], status: 500 };
        try {
            if (req.file == undefined || req.file.mimetype !== 'text/csv') {
                return res.status(400).json({ message: 'Please upload a CSV file' });
            }
            if (req.file.size > (_1mb * 2)) {
                return res.status(400).json({ message: 'File size cannot be larger than 2MB' });
            }
            const parser = csv.parse({
                delimiter: ',', // phân cách giữa các cell trong mỗi row
                trim: true, // bỏ các khoảng trắng ở đầu và cuối của mỗi cell
                skip_empty_lines: true, // bỏ qua các dòng trống
                columns: true, // gán header cho từng column trong row 
            });
            const records: unknown[] = await this.readCsvData(req.file.path, parser);
            // iterate csv records data and check row
            for (let i = 0; i < records.length; i++) {
                const row = records[i];
                const user: User = Object.assign(new User(), {
                    id: row['id'] === '' ? null : row['id'],
                    name: row['name'] === '' ? null : row['name'],
                    username: row['username'] === '' ? null : row['username'],
                    email: row['email'] === '' ? null : row['email'],
                    role: row['role'],
                });
                // validate entity User using 'class-validator'
                const errors: ValidationError[] = await validate(user);
                if (errors.length > 0) {
                    const errMsgStr = errors.map((error) => Object.values(error.constraints)).join(', ');
                    msgObj.messages.push(`Row ${i + 1} : ${errMsgStr}`);
                    continue;
                }
                // + Trường hợp id rỗng => thêm mới user
                if (_.isNil(row['id']) || row['id'] === '') {
                    if (row['deleted'] === 'y') {
                        // deleted="y" và colum id không có nhập thì không làm gì hết, ngược lại sẽ xóa row theo id tương ứng dưới DB trong bảng user
                        continue;
                    }
                    user.password = getRandomPassword();
                    const result = await this.insertData(user, true, false, queryRunner);
                    if (result.status === 500) {
                        msgObj.messages.push(`Row ${i + 1} : ${result.message}`);
                    }
                    if (result.status === 400) {
                        msgObj.messages.push(`Row ${i + 1} : ${result.message}`);
                    }
                } else {
                    // Trường hợp id có trong db (chứ ko phải trong transaction) => chỉnh sửa user nếu deleted != 'y'
                    const findUser = await this.userRepository.findOneBy({ id: user.id });
                    if (findUser) {
                        if (row['deleted'] === 'y') {
                            await queryRunner.manager.remove<User>(findUser);
                        } else {
                            const result = await this.updateData(user, true, queryRunner);
                            if (result.status === 404 || result.status === 400 || result.status === 500) {
                                msgObj.messages.push(`Row ${i + 1} : ${result.message}`);
                            }
                        }
                    } else {
                        // Trường hợp id không có trong db => hiển thị lỗi "id not exist"
                        msgObj.messages.push(`Row ${i + 1} : Id not exist`);
                    }
                }
            }
            if (msgObj.messages.length > 0) {
                msgObj.status = 400;
                await queryRunner.rollbackTransaction();
                console.log(msgObj.messages);
                return res.status(msgObj.status ?? 500).json({ messages: msgObj.messages, status: msgObj.status });
            } else {
                await queryRunner.commitTransaction();
                return res.status(200).json({ message: 'Import csv file successfully!', status: 200, data: records });
            }
        } catch (error) {
            return res.status(500).json({ messages: ['Internal Server Error'], status: 500 });
        } finally {
            await queryRunner.release();
        }
    }
    async exportCsv(req: Request, res: Response) {
        
        null;
    }
    //for routing control purposes - END

    // for process data purposes, self-calling in the application - START
    async readCsvData(filePath: string, parser: csv.Parser): Promise<unknown[]> {
        const result: unknown[] = [];
        return await new Promise((resolve, reject) => fs.createReadStream(filePath)
            .pipe(parser)
            .on("data", (row) => {
                result.push(row);
            })
            .on("error", (err) => {
                reject(err);
            })
            .on("end", () => {
                // xóa file csv sau khi đã đọc xong
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
                resolve(result);
            }));
    }
    async getAllData(take?: string, limit?: string): Promise<CustomApiResult<User>> {
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
    async getOneData(id: number): Promise<CustomApiResult<User>> {
        const findUser: User | null = await this.userRepository.findOneBy({ id: id });
        if (!findUser) {
            return { message: `User ID ${id} Not Found!`, status: 404 };
        }
        return { message: `Found user with id ${id}`, data: findUser, status: 200 };
    }
    async checkUsernameEmailUnique(user: User, queryRunner?: QueryRunner): Promise<CustomValidateResult<User>> {
        let builder: SelectQueryBuilder<User>;
        let message: string;
        let isValid: boolean;
        let result = {
            message: message,
            isValid: isValid,
            data: null
        };
        let findUser: User = null;
        if (!queryRunner) {
            builder = this.userRepository.createQueryBuilder('user').where('');
        }
        if (user.username) {
            if (!queryRunner) {
                builder.orWhere('user.username = :username', { username: `${user.username}` });
                findUser = await builder.getOne();
            } else {
                findUser = await queryRunner.manager.findOneBy(User, { username: user.username });
            }
            if (findUser) {
                result = Object.assign({}, { message: 'Username is already exist!', isValid: false, data: findUser });
                return result;
            }
        }
        if (user.email) {
            if (!queryRunner) {
                builder.orWhere('user.email = :email', { email: `${user.email}` });
                findUser = await builder.getOne();
            } else {
                findUser = await queryRunner.manager.findOneBy(User, { email: user.email });
            }
            if (findUser) {
                result = Object.assign({}, { message: 'Email is already exist!', isValid: false, data: findUser });
                return result;
            }
        }
        return { message: 'Email and username is unique!', isValid: true, data: findUser };
    }
    async insertData(user: User, wantValidate: boolean, isPasswordHash: boolean, queryRunner: QueryRunner): Promise<CustomApiResult<User>> {
        const validateUser = await this.checkUsernameEmailUnique(user);
        if (!validateUser.isValid) {
            return { message: validateUser.message, status: 400 };
        }
        user.created_at = new Date();
        // hash pass if isPasswordHash is true, incase of insert data from csv file (already had pass)
        if (isPasswordHash) {
            const hashed = await hashPassword(user.password);
            user.password = hashed;
        }
        try {
            const insertRes: InsertResult = await queryRunner.manager.insert(User, user);
            const newUser: User | null = await queryRunner.manager.findOneBy(User, { id: insertRes.identifiers[0].id });
            return { message: 'User created successfully!', data: newUser, status: 200 };
        } catch (error) {
            return { message: 'Error when inserting user!', status: 500 };
        }
    }
    async updateData(user: User, wantValidate: boolean, queryRunner: QueryRunner): Promise<CustomApiResult<User>> {
        const validateUser = await this.checkUsernameEmailUnique(user);
        if (!validateUser.isValid) {
            const idStr = validateUser.data['id'].toString();
            if (user.id !== idStr) {
                return { message: validateUser.message, status: 400 };
            }
        }
        user.updated_at = new Date();
        if (!_.isNil(user.password)) {
            const hashed = await hashPassword(user.password);
            user.password = hashed;
        }
        // check if user exist by id
        const findUser: User | null = await queryRunner.manager.findOneBy(User, { id: user.id });
        if (!findUser) {
            return { message: `User ${user.id} not found`, status: 404 };
        }
        try {
            await queryRunner.manager.update(User, user.id, user);
            const updatedUser: User | null = await queryRunner.manager.findOneBy(User, { id: user.id });
            return { message: `Update user successfully!`, data: updatedUser, status: 200 };
        } catch (error) {
            return { message: `Error when updating user!`, status: 500 };
        }
    }
    async removeData(id: number): Promise<CustomApiResult<User>> {
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
