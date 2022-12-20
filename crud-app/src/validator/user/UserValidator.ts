import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const errMsg = {
    ERR001: (column: string) => {
        return `${column.toUpperCase()} is required!`;
    },
    ERR002: (column: string, minLength: number, maxLength: number) => {
        return `${column.toUpperCase()} should be more than ${minLength}, less than equal to ${maxLength} characters`;
    },
    ERR003: (email: string) => {
        return `${email.toUpperCase()} is invalid!`;
    },
    ERR004: (field1: string, field2: string) => {
        return `${field1.toUpperCase()} must match ${field2}`;
    },
    ERR005: (field: string, min: number) => {
        return `${field.toUpperCase()} should be bigger than ${min} characters`;
    },
    ERR006: (field: string, max: number) => {
        return `${field.toUpperCase()} should be less than equal to ${max} characters`;
    },
    ERR007: (field: string, type: string) => {
        return `${field.toUpperCase()} is not of type ${type.toLowerCase()}`;
    }
};

const userExpressValidationRule = (hasRetype: boolean) => {
    // task validation: https://redmine.bridevelopment.com/issues/106778
    return [
        body('name')
            .isLength({ max: 100 })
            .not()
            .isEmpty().withMessage(errMsg.ERR001('name'))
            .trim()
            .escape(),
        body('username')
            .isLength({ max: 255 })
            .not()
            .isEmpty().withMessage(errMsg.ERR001('username'))
            .trim()
            .escape(),
        body('password', errMsg.ERR002('password', 6, 20))
            .isLength({ min: 6, max: 20 })
            .not()
            .isEmpty()
            .trim()
            .escape(),
        // body('retype')
        //     .optional({ checkFalsy: true })
        //     .not()
        //     .isEmpty().withMessage(errMsg.ERR001('retype'))
        //     .custom((value, { req }) => value === req.body.password).withMessage(errMsg.ERR004('retype', 'password')),
        body('retype')
            .custom((value, { req }) => {
                return hasRetype ? value === req.body.password : true;
            }).withMessage(errMsg.ERR004('retype', 'password')),
        body('email')
            .isLength({ max: 255 })
            .isEmail().withMessage(errMsg.ERR003('email'))
            .trim()
            .escape(),
        body('role')
            .not()
            .isEmpty().withMessage(errMsg.ERR001('role'))
    ];
};

const expressValidateUser = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().forEach((err) => {
        extractedErrors.push({ [err.param]: err.msg });
    });
    // return res.status(422).json({ errors: extractedErrors });
    req.flash('message', Object.values(extractedErrors[0]))[0]; // get first value of the first object element in the array
    req.flash('dataBack', req.body); // return req.body data back to front-end
    res.redirect('/admin/users/addPage');
};

export { userExpressValidationRule, expressValidateUser, errMsg }

