import { Request, Response } from "express";
// import fetch from 'node-fetch';
import { returnDataFromUrl } from "../utils/fetchUtils";


const getProducts = async (req: Request, res: Response) => {
    const response = await fetch('https://dummyjson.com/products');
    const data = await response.json();
    return res.render('products/index', { productsArr: data });
};

export { getProducts };