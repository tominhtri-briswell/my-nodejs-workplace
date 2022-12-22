import express from 'express';
import AdminUserApiController from '../../controller/api/AdminUserApiController';
import { allowParams, defaultAllow } from '../../middlewares/checkPermission';
import { uploadFile } from '../../middlewares/uploadCsv';
const adminUserApiRouter = express.Router();

// base path: /api/admin/users/
adminUserApiRouter.get('/', AdminUserApiController.getAll);
adminUserApiRouter.get('/search', AdminUserApiController.search);
adminUserApiRouter.get('/:id', AdminUserApiController.getOne);
adminUserApiRouter.post('/', defaultAllow, AdminUserApiController.save);
adminUserApiRouter.put('/:id', allowParams, AdminUserApiController.update);
adminUserApiRouter.delete('/:id', allowParams, AdminUserApiController.remove);
adminUserApiRouter.post('/csv/import', defaultAllow, uploadFile.single('file'), AdminUserApiController.importCsv);
adminUserApiRouter.get('/csv/export', defaultAllow, AdminUserApiController.exportCsv);
adminUserApiRouter.post('/csv/export', defaultAllow, AdminUserApiController.exportCsv);

export default adminUserApiRouter;
