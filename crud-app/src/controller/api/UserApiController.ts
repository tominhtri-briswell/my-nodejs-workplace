import { Request, Response } from 'express';
import { AppDataSource } from '../../DataSource';
import { User } from '../../entity/User';

class UserApiController {
    private userRepository = AppDataSource.getRepository(User);

    constructor() {
        this.getAll = this.getAll.bind(this);
        this.getOne = this.getOne.bind(this);
        this.save = this.save.bind(this);
        this.remove = this.remove.bind(this);
        this.update = this.update.bind(this);
    }

    async getAll(req: Request, res: Response) {
        const data: User[] = await this.userRepository.find();
        return res.status(200).json(data);
    }

    async getOne(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const user: User | null = await this.userRepository.findOneBy({ id: id });
        if (!user) {
            return res.status(404).json({ message: `User ID ${id} Not Found!` });
        }
        return res.status(200).json(user);
    }

    async save(req: Request, res: Response) {
        // create query runner
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name, username, password, email, role
        });
        // start transaction
        await queryRunner.startTransaction();
        try {
            const newUser: User = await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();
            return res.status(200).json(newUser);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return res.status(400).json({ error: "error 400: Can't save new user " });
        } finally {
            await queryRunner.release();
        }
    }
    async update(req: Request, res: Response) {
        // create query runner
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const { name, username, password, email, role } = req.body;
        const id = req.params.id;
        const user: User = Object.assign(new User(), {
            id, name, username, password, email, role
        });
        user.updated_at = new Date();
        // check if user exist by id
        const findUser: User | null = await this.userRepository.findOneBy({ id: user.id });
        if (!findUser) {
            return res.status(404).json({ error: "error 404: User is not exist with id " + user.id });
        }
        // start transaction
        try {
            await queryRunner.manager.update(User, user.id, user);
            const updatedUser: User | null = await this.userRepository.findOneBy({ id: user.id });
            await queryRunner.commitTransaction();
            return res.status(200).json(updatedUser);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return res.status(400).json({ error: "error 400: Can't save new user " });
        } finally {
            await queryRunner.release();
        }
    }

    async remove(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const userToRemove: User | null = await this.userRepository.findOneBy({ id });
        if (!userToRemove) {
            return res.status(404).json({ message: `User ID ${id} Not Found` });
        }
        await this.userRepository.remove(userToRemove);
        return res.status(200).json({ message: `User removed successfully` });
    }

}

export default new UserApiController();
