import express, { Request, Response } from "express";
import { getProducts } from "../controllers/products.controller";
const productRouter = express.Router();

productRouter.get('/', getProducts);

export { productRouter };
