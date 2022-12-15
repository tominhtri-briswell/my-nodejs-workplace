import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const errMsg = {
    ERR001: (column: string) => {
        return `${column} is required!`;
    },
    ERR002: (column: string, minLength: number, maxLength: number) => {
        return `${column} should be more than ${minLength}, less than equal to ${maxLength} characters`;
    },
    ERR003: (email: string) => {
        return `${email} is invalid!`;
    }
};

const userValidationRule = () => {
    // task validation: https://redmine.bridevelopment.com/issues/106778
    return [
        body('name')
            .isLength({ max: 100 })
            .not()
            .isEmpty().withMessage(errMsg.ERR001('Name'))
            .trim()
            .escape(),
        body('username')
            .isLength({ max: 255 })
            .not()
            .isEmpty().withMessage(errMsg.ERR001('Username'))
            .trim()
            .escape(),
        body('password', errMsg.ERR002('Password', 6, 20))
            .isLength({ min: 6, max: 20 })
            .not()
            .isEmpty()
            .trim()
            .escape(),
        body('retype')
            .not()
            .isEmpty().withMessage(errMsg.ERR001('Retype'))
            .custom((value, { req }) => value === req.body.password),
        body('email')
            .isLength({ max: 255 })
            .isEmail().withMessage(errMsg.ERR003('Email'))
            .trim()
            .escape()
            .normalizeEmail(),
        body('role')
            .not()
            .isEmpty().withMessage(errMsg.ERR001('Role'))
    ];
};

const validateUser = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().forEach((err) => {
        extractedErrors.push({ [err.param]: err.msg });
    });
    // Example JSON response
    // {
    //     "errors": [
    //         {
    //             "name": "Name is required!"
    //         },
    //         {
    //             "email": "Not a valid email"
    //         }
    //     ];
    // }
    return res.status(422).json({ errors: extractedErrors });
    // req.flash('message', Object.values(extractedErrors[0]))[0]; // get first value of the first object element in the array
    // req.flash('dataBack', req.body); // return req.body data back to front-end
    return res.redirect('/admin/users/addPage');
};

export { userValidationRule, validateUser }

