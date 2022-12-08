"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRouter = void 0;
const express_1 = __importDefault(require("express"));
const contactRouter = express_1.default.Router();
exports.contactRouter = contactRouter;
contactRouter.get('/', (req, res) => {
    res.render('contact-form');
});
contactRouter.post('/', (req, res) => {
    res.send(req.body);
});
//# sourceMappingURL=contact.route.js.map