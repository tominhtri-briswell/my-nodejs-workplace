import express, { Request, Response } from 'express';
import { AppDataSource } from '../../DataSource';
import { User } from '../../entity/User';
import { UserModel } from '../../model/UserModel';

class UserApiController {
    private userRepository = AppDataSource.getRepository(User);

    constructor() {
        this.getAll = this.getAll.bind(this);
        this.getOne = this.getOne.bind(this);
        this.save = this.save.bind(this);
        this.remove = this.remove.bind(this);
    }

    async getAll(req: Request, res: Response) {
        console.log(await this.userRepository.find());
        return res.status(200).json(await this.userRepository.find());
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
        const user = req.body;
        return this.userRepository.save(user);
    }

    async remove(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const userToRemove = await this.userRepository.findOneBy({ id: id });
        if (!userToRemove) {
            return res.status(404).json({ message: `User ID ${id} Not Found` });
        }
        await this.userRepository.remove(userToRemove);
        return res.status(200).json({ message: `User removed successfully` });
    }
}

export default new UserApiController();
