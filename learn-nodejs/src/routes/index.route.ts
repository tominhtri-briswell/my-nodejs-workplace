import express, { Request, Response } from "express";
import moment from "moment";

const indexRouter = express.Router();

indexRouter.get('/', (req: Request, res: Response) => {
    const momentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
    const test1 = moment('2011 14', 'YYYY MM').isValid(); // false
    const test2 = moment('2011 11 31', 'YYYY MM DD').isValid(); // false
    const test3 = moment('2010 2 29', 'YYYY MM DD').isValid(); // false
    const test4 = moment('2010 hehehehe 22', 'YYYY MM DD').isValid(); // false
    const createdDateObject = moment().add(7, 'days');
    console.log(`
        Test1: ${test1}
        Test2: ${test2}
        Test3: ${test3}
        Test4: ${test4}
        Created Date Object with Moment: ${moment(createdDateObject).format('DD MMM YYYY')}
    `);
    res.render('index', { dateObj: momentDateTime });
});

export { indexRouter };
