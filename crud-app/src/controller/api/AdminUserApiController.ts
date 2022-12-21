import { Request, Response } from 'express';
import _ from 'lodash';
import * as fs from 'fs';
import * as csv from 'csv-parse';
import { AppDataSource } from '../../DataSource';
import { User } from '../../entity/User';
import { CustomApiResult, CustomDataTableResult, CustomValidateResult } from '../../type/MyCustomType';
import { hashPassword } from '../../utils/BcryptUtils';
import { bench, getRandomPassword, isValidDate, _1mb } from '../../utils/MyUtils';
import { InsertResult, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { stringify } from 'csv-stringify';
import dayjs from 'dayjs';
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
        // save req.query to session for export csv based on search query
        req.session.searchQuery = req.query;
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
        const result = await this.insertData(user, null, false, true, queryRunner);
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
        const result = await this.updateData(user, null, false, queryRunner);
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
            // if (req.file.size > (_1mb * 2)) {
            //     return res.status(400).json({ message: 'File size cannot be larger than 2MB' });
            // }
            const parser = csv.parse({
                delimiter: ',', // phân cách giữa các cell trong mỗi row
                trim: true, // bỏ các khoảng trắng ở đầu và cuối của mỗi cell
                skip_empty_lines: true, // bỏ qua các dòng trống
                columns: true, // gán header cho từng column trong row 
            });
            const records: unknown[] = await this.readCsvData(req.file.path, parser);
            const idRecords = records.filter((record) => record['id'] !== '').map((record) => record['id']);
            const usernameRecords = records.filter((record) => record['username'] !== '').map((record) => record['username']);
            const nameRecords = records.filter((record) => record['name'] !== '').map((record) => record['name']);
            const deleteArr = [];
            const insertArr = [];
            const updateArr = [];
            // query data from db first then pass it around to prevent multiple query to db
            const builder = this.userRepository.createQueryBuilder('user').select(['user.id', 'user.username', 'user.email']);
            if (idRecords.length > 0) {
                builder.orWhere('user.id IN (:ids)', { ids: idRecords });
            }
            if (usernameRecords.length > 0) {
                builder.orWhere('user.username IN (:usernames)', { usernames: usernameRecords });
            }
            if (nameRecords.length > 0) {
                builder.orWhere('user.name IN (:names)', { names: nameRecords });
            }
            const dbData = await builder.getMany();
            // iterate csv records data and check row
            const { start, end } = bench();
            start();
            await Promise.all(records.map(async (record, i) => {
                const row = record;
                const user: User = Object.assign(new User(), {
                    id: row['id'] === '' ? null : _.isString(row['id']) ? parseInt(row['id']) : row['id'],
                    name: row['name'] === '' ? null : row['name'],
                    username: row['username'] === '' ? null : row['username'],
                    email: row['email'] === '' ? null : row['email'],
                    role: _.isString(row['role']) ? parseInt(row['role']) : row['role'],
                });
                // validate entity User using 'class-validator'
                const errors: ValidationError[] = await validate(user);
                if (errors.length > 0) {
                    const errMsgStr = errors.map((error) => Object.values(error.constraints)).join(', ');
                    msgObj.messages.push(`Row ${i + 1} : ${errMsgStr}`);
                    return;
                }
                console.log('Reading csv row: ', i);
                // + Trường hợp id rỗng => thêm mới user
                if (_.isNil(row['id']) || row['id'] === '') {
                    if (row['deleted'] === 'y') {
                        // deleted="y" và colum id không có nhập thì không làm gì hết, ngược lại sẽ xóa row theo id tương ứng dưới DB trong bảng user
                        return;
                    }
                    user.password = getRandomPassword();
                    insertArr.push(user); // push to map to insert later
                } else {
                    // Trường hợp id có trong db (chứ ko phải trong transaction) => chỉnh sửa user nếu deleted != 'y'
                    const findUser = _.find(dbData, { id: user.id });
                    if (findUser) {
                        if (row['deleted'] === 'y') {
                            deleteArr.push(findUser); // push to map to delete later
                        } else {
                            const result: CustomValidateResult<User> = this.checkUsernameEmailUnique(findUser, dbData);
                            if(result.isValid === false) {
                                
                            }
                            updateArr.push(user); // push to map to update later
                        }
                    } else {
                        // Trường hợp id không có trong db => hiển thị lỗi "id not exist"
                        msgObj.messages.push(`Row ${i + 1} : Id not exist`);
                    }
                }
            }));
            await Promise.all(deleteArr.map(async (user) => {
                await queryRunner.manager.remove<User>(user);
                // delete user from dbData
                dbData.splice(dbData.indexOf(user), 1);
            }));
            await Promise.all(updateArr.map(async (user, i) => {
                const result: CustomApiResult<User> = await this.updateData(user, dbData, true, queryRunner);
                // update dbData with new data
                if (result.data) {
                    dbData.splice(dbData.indexOf(result.data as User), 1, result.data as User);
                }
                if (result.status !== 200) {
                    msgObj.messages.push(`Row ${i + 1} : ${result.message}`);
                }
            }));
            await Promise.all(insertArr.map(async (user, i) => {
                const result: CustomApiResult<User> = await this.insertData(user, dbData, true, false, queryRunner);
                // add new dbData with new data
                if (result.data) {
                    dbData.push(result.data as User);
                }
                if (result.status !== 200) {
                    msgObj.messages.push(`Row ${i + 1} : ${result.message}`);
                }
            }));
            // check if msgObj is not empty => meaning has errors => return 500
            if (msgObj.messages.length > 0) {
                end();
                msgObj.status = 400;
                await queryRunner.rollbackTransaction();
                return res.status(msgObj.status ?? 500).json({ messages: msgObj.messages, status: msgObj.status });
            } else {
                end();
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
        const { start, end } = bench();
        const searchQuery = req.session.searchQuery;
        let builder: SelectQueryBuilder<User>;
        let userList: unknown[];
        if (searchQuery) {
            builder = await this.getSearchQueryBuilder(searchQuery, false); // set false to turn off offset,limit search criteria
            userList = await builder.getMany();
        } else {
            userList = await this.userRepository.find();
        }
        start(); // begin count time start
        // format date, transform role number to string (Ex: '1' => 'User')
        userList.map((user) => {
            user['created_at'] = dayjs(user['created_at']).format('YYYY/MM/DD');
            user['updated_at'] = dayjs(user['updated_at']).format('YYYY/MM/DD');
            user['role'] = user['role'] === 1 ? 'user' : (user['role'] === 2 ? 'admin' : 'manager');
        });
        const filename = `${dayjs(Date.now()).format('DD-MM-YYYY-HH-mm-ss')}-users.csv`;
        const columns = Object.keys(userList[0]);
        const columns_string = columns.toString().replace(/,/g, ',');
        stringify(userList, {
            // header: true,
            columns: columns,
            delimiter: ',',
            quoted: true,
            quoted_empty: true,
        }, function (err, data) {
            if (err) {
                res.status(500).json({ message: 'Internal Server Error\nFailed to export csv', status: 500 });
            }
            data = columns_string + '\n' + data;
            end(); // end count time and log to console
            res.status(200).json({ data: data, status: 200, message: `Export to CSV success!, \nTotal records: ${userList.length}`, filename: filename });
        });
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
    async checkUsernameEmailUnique(user: User, dbData?: User[]): Promise<CustomValidateResult<User>> {
        let builder: SelectQueryBuilder<User>;
        let message: string;
        let isValid: boolean;
        let result = {
            message: message,
            isValid: isValid,
            datas: null
        };
        let findUsers: User[] = null;
        if (!dbData) {
            builder = this.userRepository.createQueryBuilder('user').where('');
        }
        if (user.username) {
            if (!dbData) {
                builder.orWhere('user.username = :username', { username: `${user.username}` });
                findUsers = await builder.getMany();
            } else {
                if (user.id) {
                    findUsers = dbData.filter((data) => data.username === user.username && data.id !== user.id);
                } else {
                    findUsers = dbData.filter((data) => data.username === user.username);
                }
            }
            if (findUsers.length > 0) {
                result = Object.assign({}, { message: 'Username is already exist!', isValid: false, datas: findUsers });
                return result;
            }
        }
        if (user.email) {
            if (!dbData) {
                builder.orWhere('user.email = :email', { email: `${user.email}` });
                findUsers = await builder.getMany();
            } else {
                if (user.id) {
                    findUsers = dbData.filter((data) => data.email === user.email && data.id !== user.id);
                } else {
                    findUsers = dbData.filter((data) => data.email === user.email);
                }
            }
            if (findUsers.length > 0) {
                result = Object.assign({}, { message: 'Email is already exist!', isValid: false, datas: findUsers });
                return result;
            }
        }
        return { message: 'Email and username is unique!', isValid: true, data: findUsers };
    }
    async insertData(user: User, dbData: User[] | null, wantValidate: boolean, isPasswordHash: boolean, queryRunner: QueryRunner): Promise<CustomApiResult<User>> {
        const validateUser = await this.checkUsernameEmailUnique(user, dbData);
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
            const insertedUser: User = await queryRunner.manager.save(User, user);
            if (dbData) {
                dbData.push(insertedUser);
            }
            // const newUser: User | null = await queryRunner.manager.findOneBy(User, { id: insertRes.identifiers[0].id });
            return { message: 'User created successfully!', data: insertedUser, status: 200 };
        } catch (error) {
            return { message: 'Error when inserting user!', status: 500 };
        }
    }
    async updateData(user: User, dbData: User[] | null, wantValidate: boolean, queryRunner: QueryRunner): Promise<CustomApiResult<User>> {
        const validateUser = await this.checkUsernameEmailUnique(user, dbData);
        if (!validateUser.isValid) {
            const arr: number[] = validateUser.datas.map((u) => u.id);
            if (!arr.includes(user.id)) {
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
            const updatedUser = await queryRunner.manager.save(User, user);
            if (dbData) {
                dbData.push(updatedUser);
            }
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
        const builder = await this.getSearchQueryBuilder(query, true);
        let data: string | User[];
        const recordsTotal: number = await this.userRepository.createQueryBuilder('user').select('user').getCount(); // get total records count
        const recordsFiltered: number = recordsTotal; // get filterd records count
        try {
            data = await builder.getMany(); //get data 
        } catch (error) {
            // if error then find all
            console.log(error);
            data = await this.userRepository.find();
        }
        const returnData = {
            draw: query.draw as number,
            recordsTotal: recordsTotal,
            recordsFiltered: recordsFiltered,
            data: data,
        };
        return returnData;
    }
    async getSearchQueryBuilder(query: Record<string, unknown>, hasAnyLimitOrOffset: boolean): Promise<SelectQueryBuilder<User>> {
        const { length, start, name, username, email, role, createdDateFrom, createdDateTo } = query;
        const builder = this.userRepository.createQueryBuilder('user').where('');
        // let isFromAndToDateEqual = false;
        // check if queries exist then concat them with sql query
        if (hasAnyLimitOrOffset) {
            if (!_.isNil(length)) {
                builder.limit(parseInt(length as string));
            }
            // check both start end length for error: typeorm RDBMS does not support OFFSET without LIMIT in SELECT statements
            if (!_.isNil(start) && !_.isNil(length)) {
                builder.offset(parseInt(start as string));
            }
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
        return builder;
    }
    // for process data purposes, self-calling in the application - END


}

export default new AdminUserApiController();
