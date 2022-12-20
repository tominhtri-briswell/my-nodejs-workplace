import express from 'express';
import AdminUserApiController from '../../controller/api/AdminUserApiController';
import { uploadFile } from '../../middlewares/uploadCsv';
const adminUserApiRouter = express.Router();

// base path: /api/admin/users/
adminUserApiRouter.get('/', AdminUserApiController.getAll);
adminUserApiRouter.get('/search', AdminUserApiController.search);
adminUserApiRouter.get('/:id', AdminUserApiController.getOne);
adminUserApiRouter.post('/', AdminUserApiController.save);
adminUserApiRouter.put('/:id', AdminUserApiController.update);
adminUserApiRouter.delete('/:id', AdminUserApiController.remove);
adminUserApiRouter.post('/csv/import', uploadFile.single('file'), AdminUserApiController.importCsv);
adminUserApiRouter.get('/csv/export', AdminUserApiController.exportCsv);
adminUserApiRouter.post('/csv/export', AdminUserApiController.exportCsv);

export default adminUserApiRouter;