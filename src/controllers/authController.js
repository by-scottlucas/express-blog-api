import AuthService from '../services/authService.js';

class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name) {
                return res.status(400).json({ message: "O nome é obrigatório." });
            }

            if (!email) {
                return res.status(400).json({ message: "O e-mail é obrigatório." });
            }

            if (!password) {
                return res.status(400).json({ message: "A senha é obrigatória." });
            }

            const newUser = await this.authService.register(req.body);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Preencha todos os campos." });
            }

            const loginResponse = await this.authService.login(req.body);

            res.status(200).json({
                message: "Login realizado com sucesso!",
                user: loginResponse.user,
                token: loginResponse.token,
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    async logout(req, res) {
        try {
            res.status(200).json({ message: "Logout realizado com sucesso!" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default AuthController;
