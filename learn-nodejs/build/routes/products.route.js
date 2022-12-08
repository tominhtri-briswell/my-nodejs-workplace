"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = __importDefault(require("express"));
const products_controller_1 = require("../controllers/products.controller");
const productRouter = express_1.default.Router();
exports.productRouter = productRouter;
productRouter.get('/', products_controller_1.getProducts);
//# sourceMappingURL=products.route.js.map