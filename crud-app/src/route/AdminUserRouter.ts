import express from 'express';
import AdminUserController from '../controller/AdminUserController';
import { allowParams, allowBody, defaultAllow } from '../middlewares/checkPermission';
import checkReqParamsEmpty from '../middlewares/checkReqParamsEmpty';
import checkReqQueryEmpty from '../middlewares/checkReqQueryEmpty';
import { userExpressValidationRule, expressValidateUser } from '../validator/user/UserValidator';
const adminUserRouter = express.Router();

// check params and query for all routes
adminUserRouter.use('/addPage', checkReqParamsEmpty);
adminUserRouter.use('/addPage', checkReqQueryEmpty);
adminUserRouter.use('/search', checkReqQueryEmpty);
adminUserRouter.use('/update', checkReqParamsEmpty);
// check permission for all routes
adminUserRouter.use('/addPage', defaultAllow);
adminUserRouter.use('/edit/:id', allowParams);
adminUserRouter.use('/update', allowBody);

// base path: /admin/users/
adminUserRouter.get('/addPage', AdminUserController.addPage);
adminUserRouter.post('/addPage', userExpressValidationRule(true), expressValidateUser, AdminUserController.createNewUser); // add middleware for validate req.body and is exist username, email
adminUserRouter.get('/edit/:id', AdminUserController.editPage);
adminUserRouter.post('/update', AdminUserController.update);
adminUserRouter.get('/list', AdminUserController.listPage);
adminUserRouter.get('/change-password/:id', allowParams, AdminUserController.changePasswordPage);
adminUserRouter.post('/change-password', allowBody, AdminUserController.changePassword);

export default adminUserRouter;