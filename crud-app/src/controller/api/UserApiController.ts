import { query, Request, Response } from 'express';
import { AppDataSource } from '../../DataSource';
import { User } from '../../entity/User';

class UserApiController {
    private userRepository = AppDataSource.getRepository(User);

    constructor() {
        this.getAll = this.getAll.bind(this);
        this.getOne = this.getOne.bind(this);
        this.save = this.save.bind(this);
        this.remove = this.remove.bind(this);
    }

    async getAll(req: Request, res: Response) {
        const data = await this.userRepository.find();
        return res.status(200).json(data);
    }

    async getOne(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const user = await this.userRepository.findOneBy({ id: id });
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
        console.log(user.username);

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

    async remove(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const userToRemove = await this.userRepository.findOneBy({ id });
        if (!userToRemove) {
            return res.status(404).json({ message: `User ID ${id} Not Found` });
        }
        await this.userRepository.remove(userToRemove);
        return res.status(200).json({ message: `User removed successfully` });
    }
}

export default new UserApiController();
