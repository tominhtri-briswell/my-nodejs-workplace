import express, { Request, Response } from 'express';
import UserApiController from '../../controller/api/UserApiController';
import { AppDataSource } from '../../DataSource';
import { User } from '../../entity/User';

const userApiRouter = express.Router();

userApiRouter.get('/', UserApiController.getAll);
userApiRouter.get('/:id', UserApiController.getOne);
userApiRouter.post('/', UserApiController.save);
userApiRouter.put('/:id', UserApiController.save);
userApiRouter.delete('/:id', UserApiController.remove);

export default userApiRouter;