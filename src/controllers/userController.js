import UserService from '../services/userService.js';

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async listUsers(req, res) {
        try {
            const users = await this.userService.list();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }

    async createUser(req, res) {
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
                message: error.message
            });
        }
    }

    async getUser(req, res) {
        try {
            const user = await this.userService.read(req.params.id);

            if (!user) {
                return res.status(404).json({
                    message: "Usuário não encontrado"
                });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }

    async updateUser(req, res) {
        try {
            const user = await this.userService.read(req.params.id);

            if (!user) {
                return res.status(404).json({
                    message: "Usuário não encontrado"
                });
            }

            const updatedFields = {};

            if (req.body.name) updatedFields.name = req.body.name;
            if (req.body.email) updatedFields.email = req.body.email;
            if (req.body.password) updatedFields.password = req.body.password;

            const updatedUser = await this.userService.update(
                req.params.id, updatedFields
            );

            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const user = await this.userService.read(req.params.id);

            if (!user) {
                return res.status(404).json({
                    message: "Usuário não encontrado"
                });
            }

            await this.userService.delete(req.params.id);
            res.status(204).json({ message: "Usuário excluído com sucesso!" });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
}

export default UserController;
