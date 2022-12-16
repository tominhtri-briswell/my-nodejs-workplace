import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { DestinationCallback } from '../type/MyCustomType';

const csvFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.includes("csv")) {
        cb(null, true);
    } else {
        cb(new Error("Please upload only csv file."));
    }
};

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback: DestinationCallback): void => {
        callback(null, path.join(__dirname, '../../public/upload/csv/'));
    },
    filename: (req, file, callback): void => {
        callback(null, `${Date.now()}-briswellvn-${file.originalname}`);
    }
});

const uploadFile = multer({ storage: storage, fileFilter: csvFilter });

export { uploadFile };