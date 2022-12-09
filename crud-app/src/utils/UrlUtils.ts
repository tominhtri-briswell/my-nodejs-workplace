import { Request } from "express";

const getFullURL = (req: Request, url: string) => {
    return `${req.protocol}://${req.headers.host}${url}`;
};

export { getFullURL };