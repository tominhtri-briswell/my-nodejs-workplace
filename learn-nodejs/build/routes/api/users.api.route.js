"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userApiRouter = void 0;
const express_1 = __importDefault(require("express"));
const users_api_controller_1 = require("../../controllers/api/users.api.controller");
const userApiRouter = express_1.default.Router();
exports.userApiRouter = userApiRouter;
userApiRouter.get('/', users_api_controller_1.getUsersListApi);
userApiRouter.get('/list.html', users_api_controller_1.getUsersListHtml);
//# sourceMappingURL=users.api.route.js.map