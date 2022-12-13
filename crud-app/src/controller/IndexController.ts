import { Request, Response } from 'express';
import { AppDataSource } from '../DataSource';
import { User } from '../entity/User';
import { comparePassword } from '../utils/BcryptUtils';



class IndexController {
    private userRepo = AppDataSource.getRepository(User);

    constructor() {
        this.indexPage = this.indexPage.bind(this);
        this.loginPage = this.loginPage.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    async indexPage(req: Request, res: Response) {
        res.render('user/index');
    }

    async loginPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        res.render('security/login', { message: flashMessage });
    }

    async login(req: Request, res: Response) {
        const { username, password: rawPassword } = req.body;
        const { redirect } = req.query;
        const returnUrl: string = decodeURIComponent(redirect as string);
        let isLoginValid = false;
        if (!username || !rawPassword) {
            req.flash('message', 'Please enter both username and password');
            res.redirect('/login');
        }
        const findUser: User = await this.userRepo.findOneBy({ username: username });
        if (findUser) {
            const isPassMatch = await comparePassword(rawPassword, findUser.password);
            if (isPassMatch) {
                req.session.user = findUser;
                req.session.isAuthorized = true;
                isLoginValid = true;
            }
        }
        if (isLoginValid) {
            res.redirect(returnUrl ?? '/admin');
        } else {
            req.flash('message', 'Username or password is incorrect');
            res.redirect('/login');
        }
    }

    async logout(req: Request, res: Response) {
        req.session.user = null;
        req.session.isAuthorized = false;
        res.redirect('/');
    }
}

export default new IndexController();