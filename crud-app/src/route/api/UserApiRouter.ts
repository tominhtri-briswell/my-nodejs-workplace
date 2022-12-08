import express, { Request, Response } from 'express';
import UserApiController from '../../controller/api/test';
import { AppDataSource } from '../../DataSource';
import { User } from '../../entity/User';

const userApiRouter = express.Router();
const userRepository = AppDataSource.getRepository(User);

// userApiRouter.get('/', UserApiController.getAll);
userApiRouter.get('/', async (req: Request, res: Response) => {
    const data = await userRepository.find();
    return res.json(data);
});
userApiRouter.get('/:id', UserApiController.getOne);
userApiRouter.post('/', UserApiController.save);
userApiRouter.put('/:id', (req: Request, res: Response) => {
    res.render('users/edit');
});
userApiRouter.delete('/:id', (req: Request, res: Response) => {
    res.render('users/list');
});

export default userApiRouter;