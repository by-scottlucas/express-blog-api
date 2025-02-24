import AuthService from "../services/authService.js";
import UserService from "../services/userService.js";

class AuthController {
    constructor() {
        this.userService = new UserService();
        this.authService = new AuthService();
    }

    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({
                    message: "Preencha todos os campos."
                });
            }

            const newUser = await this.userService.create(req.body);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({
                message: `${error.message}`,
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    message: "Preencha todos os campos."
                });
            }

            const loginResponse = await this.authService.login(req.body);

            res.status(200).json({
                message: "Login realizado com sucesso!",
                user: loginResponse.user,
                token: loginResponse.token,
            });
        } catch (error) {
            res.status(401).json({
                message: `Erro ao realizar o login. Erro: ${error.message}`
            });
        }
    }

    async logout(req, res) {
        try {
            res.status(200).json({
                message: "Logout realizado com sucesso!"
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({
                message: "Erro ao fazer logout."
            });
        }
    }
}

export default AuthController;
