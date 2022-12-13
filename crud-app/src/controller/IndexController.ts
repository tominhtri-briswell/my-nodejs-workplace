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
        const returnUrlCookie = req.signedCookies['return-url'];
        if (!username || !rawPassword) {
            res.render('security/login', { message: 'Please enter both username and password' });
        } else {
            const users: User[] = await this.userRepo.find();
            users.filter(async (user) => {
                const isPassMatch: boolean = await comparePassword(rawPassword, user.password);
                if (user.username === username && isPassMatch) {
                    req.session.user = user;
                    if (returnUrlCookie) {
                        res.redirect(returnUrlCookie);
                    }
                    res.redirect('/admin');
                }
            });
            res.render('security/login', { message: 'Username or password is incorrect' });
        }
    }

    async logout(req: Request, res: Response) {
        req.session.destroy(() => {
            console.log('Logged out!');
        });
        res.redirect('/');
    }
}

export default new IndexController();