import express from 'express';
import AdminUserApiController from '../../controller/api/AdminUserApiController';

const adminUserApiRouter = express.Router();

adminUserApiRouter.get('/', AdminUserApiController.getAll);
adminUserApiRouter.get('/:id', AdminUserApiController.getOne);
adminUserApiRouter.post('/', AdminUserApiController.save);
adminUserApiRouter.put('/:id', AdminUserApiController.update);
adminUserApiRouter.delete('/:id', AdminUserApiController.remove);

export default adminUserApiRouter;