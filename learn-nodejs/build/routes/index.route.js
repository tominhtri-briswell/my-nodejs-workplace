"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexRouter = void 0;
const express_1 = __importDefault(require("express"));
const moment_1 = __importDefault(require("moment"));
const indexRouter = express_1.default.Router();
exports.indexRouter = indexRouter;
indexRouter.get('/', (req, res) => {
    const momentDateTime = (0, moment_1.default)().format('MMMM Do YYYY, h:mm:ss a');
    const test1 = (0, moment_1.default)('2011 14', 'YYYY MM').isValid();
    const test2 = (0, moment_1.default)('2011 11 31', 'YYYY MM DD').isValid();
    const test3 = (0, moment_1.default)('2010 2 29', 'YYYY MM DD').isValid();
    const test4 = (0, moment_1.default)('2010 hehehehe 22', 'YYYY MM DD').isValid();
    const createdDateObject = (0, moment_1.default)().add(7, 'days');
    console.log(`
        Test1: ${test1}
        Test2: ${test2}
        Test3: ${test3}
        Test4: ${test4}
        Created Date Object with Moment: ${(0, moment_1.default)(createdDateObject).format('DD MMM YYYY')}
    `);
    res.render('index', { dateObj: momentDateTime });
});
//# sourceMappingURL=index.route.js.map