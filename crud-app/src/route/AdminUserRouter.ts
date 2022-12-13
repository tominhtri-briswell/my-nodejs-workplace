import express, { Request, Response } from 'express';
import AdminUserController from '../controller/AdminUserController';
import checkReqParamsEmpty from '../middlewares/checkReqParamsEmpty';
import checkReqQueryEmpty from '../middlewares/checkReqQueryEmpty';
const adminUserRouter = express.Router();

// router level middlewares
adminUserRouter.use('/addPage', checkReqParamsEmpty);
adminUserRouter.use('/addPage', checkReqQueryEmpty);
adminUserRouter.use('/search', checkReqQueryEmpty);
adminUserRouter.use('/update', checkReqParamsEmpty);

// base path: /users/
adminUserRouter.get('/addPage', AdminUserController.addPage);
adminUserRouter.post('/addPage', AdminUserController.createNewUser);
adminUserRouter.get('/edit/:id', AdminUserController.editPage);
adminUserRouter.post('/update', AdminUserController.update);
adminUserRouter.get('/list', AdminUserController.listPage);
adminUserRouter.get('/change-password/:id', AdminUserController.changePasswordPage);
adminUserRouter.post('/change-password', AdminUserController.changePassword);
adminUserRouter.get('/search', AdminUserController.search);

export default adminUserRouter;