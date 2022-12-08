import { Request, Response } from "express";

const getUsersListApi = async (req: Request, res: Response) => {
    const response = await fetch('https://dummyjson.com/users');
    const data = await response.json();
    return res.status(200).json(data);
};
const getUsersListHtml = async (req: Request, res: Response) => {
    const response = await fetch('https://dummyjson.com/users');
    const data = await response.json();
    return res.render('users/list', { usersList: data });
};

export { getUsersListApi, getUsersListHtml };