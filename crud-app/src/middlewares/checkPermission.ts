import { Request, Response, NextFunction } from "express";
import { ROLE } from "../utils/MyConst";

function allow(options: {
    roles: number[],
    permitIf?: {
        userSessionPropEqualPropFrom?: {
            params?: {
                whichProp: string,
            },
            body?: {
                whichProp: string,
            };
        };
    };
}) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.session.user.role;
        if (options.permitIf && options.permitIf.userSessionPropEqualPropFrom) {
            if (req.params && options.permitIf.userSessionPropEqualPropFrom.params) {
                const { whichProp } = options.permitIf.userSessionPropEqualPropFrom.params;
                if (req.params[whichProp].trim() === (typeof req.session.user[whichProp] === 'string' ? req.session.user[whichProp] : req.session.user[whichProp].toString())) {
                    next();
                    return;
                }
            }
            if (req.body && options.permitIf.userSessionPropEqualPropFrom.body) {
                const { whichProp } = options.permitIf.userSessionPropEqualPropFrom.body;
                if (req.body[whichProp].trim() === (typeof req.session.user[whichProp] === 'string' ? req.session.user[whichProp] : req.session.user[whichProp].toString())) {
                    next();
                    return;
                }
            }
        }
        if (userRole && options.roles.includes(userRole)) {
            next(); // role is allowed, so continue on the next middleware
            return;
        } else {
            res.status(403).json({ status: 403, message: "Forbidden" }); // user is forbidden
        }
    };
}

const defaultAllow = allow({ roles: [ROLE.ADMIN, ROLE.MANAGER] });
const allowParams = allow({ roles: [ROLE.ADMIN, ROLE.MANAGER], permitIf: { userSessionPropEqualPropFrom: { params: { whichProp: 'id' } } } });
const allowBody = allow({ roles: [ROLE.ADMIN, ROLE.MANAGER], permitIf: { userSessionPropEqualPropFrom: { body: { whichProp: 'id' } } } });
const allowBoth = allow({ roles: [ROLE.ADMIN, ROLE.MANAGER], permitIf: { userSessionPropEqualPropFrom: { params: { whichProp: 'id' }, body: { whichProp: 'id' } } } });

export { allow, defaultAllow, allowBoth, allowParams, allowBody };