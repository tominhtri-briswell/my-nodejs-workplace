"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersListHtml = exports.getUsersListApi = void 0;
const getUsersListApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch('https://dummyjson.com/users');
    const data = yield response.json();
    return res.status(200).json(data);
});
exports.getUsersListApi = getUsersListApi;
const getUsersListHtml = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch('https://dummyjson.com/users');
    const data = yield response.json();
    return res.render('users/list', { usersList: data });
});
exports.getUsersListHtml = getUsersListHtml;
//# sourceMappingURL=users.api.controller.js.map