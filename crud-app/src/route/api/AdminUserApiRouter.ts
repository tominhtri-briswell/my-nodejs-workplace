import express, { Request, Response } from 'express';
import AdminUserApiController from '../../controller/api/AdminUserApiController';
import { AppDataSource } from '../../DataSource';
import { User } from '../../entity/User';

const adminUserApiRouter = express.Router();

adminUserApiRouter.get('/', AdminUserApiController.getAll);
adminUserApiRouter.get('/:id', AdminUserApiController.getOne);
adminUserApiRouter.post('/', AdminUserApiController.save);
adminUserApiRouter.put('/:id', AdminUserApiController.update);
adminUserApiRouter.delete('/:id', AdminUserApiController.remove);

export default adminUserApiRouter;