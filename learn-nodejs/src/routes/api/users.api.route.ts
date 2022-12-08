import express, { Request, Response } from "express";
import { getUsersListApi, getUsersListHtml } from "../../controllers/api/users.api.controller";

const userApiRouter = express.Router();

userApiRouter.get('/', getUsersListApi);
userApiRouter.get('/list.html', getUsersListHtml);

export { userApiRouter };
