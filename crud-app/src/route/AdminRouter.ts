import express from 'express';
import AdminController from '../controller/AdminController';

const adminRouter = express.Router();

adminRouter.get('/', AdminController.adminIndexPage);

export default adminRouter;