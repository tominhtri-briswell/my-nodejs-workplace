import express from 'express';
import AdminUserController from '../controller/AdminUserController';
import checkReqParamsEmpty from '../middlewares/checkReqParamsEmpty';
import checkReqQueryEmpty from '../middlewares/checkReqQueryEmpty';
import { userValidationRule, validateUser } from '../validator/user/UserValidator';
const adminUserRouter = express.Router();

// router level middlewares
adminUserRouter.use('/addPage', checkReqParamsEmpty);
adminUserRouter.use('/addPage', checkReqQueryEmpty);
adminUserRouter.use('/search', checkReqQueryEmpty);
adminUserRouter.use('/update', checkReqParamsEmpty);

// base path: /admin/users/
adminUserRouter.get('/addPage', AdminUserController.addPage);
adminUserRouter.post('/addPage', userValidationRule(true), validateUser, AdminUserController.createNewUser); // add middleware for validate req.body and is exist username, email
adminUserRouter.get('/edit/:id', AdminUserController.editPage);
adminUserRouter.post('/update', AdminUserController.update);
adminUserRouter.get('/list', AdminUserController.listPage);
adminUserRouter.get('/change-password/:id', AdminUserController.changePasswordPage);
adminUserRouter.post('/change-password', AdminUserController.changePassword);

export default adminUserRouter;