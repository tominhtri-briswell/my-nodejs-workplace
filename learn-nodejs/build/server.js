"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const users_route_1 = require("./routes/users.route");
const products_route_1 = require("./routes/products.route");
const index_route_1 = require("./routes/index.route");
const users_api_route_1 = require("./routes/api/users.api.route");
const contact_route_1 = require("./routes/contact.route");
dotenv_1.default.config();
const port = process.env.PORT;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use('/public', express_1.default.static('./public'));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.set('views', './views');
app.set('view engine', 'ejs');
app.use('/', index_route_1.indexRouter);
app.use('/users', users_route_1.userRouter);
app.use('/products', products_route_1.productRouter);
app.use('/contact', contact_route_1.contactRouter);
app.use('/api/users', users_api_route_1.userApiRouter);
app.use((req, res, next) => {
    const error = new Error("Not found");
    next(Object.assign(Object.assign({}, error), { status: 404 }));
});
app.use((error, req, res, next) => {
    res.status(error.status || 500).render('error.ejs', {
        error: {
            status: error.status || 500,
            message: error.message || 'Internal Server Error',
        },
    });
});
app.listen(port, () => {
    console.log(`'Node.js web server at http://localhost:${port} is running`);
});
//# sourceMappingURL=server.js.map