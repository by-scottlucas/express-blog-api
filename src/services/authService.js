import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

dotenv.config();

class AuthService {
    async login(data) {
        try {
            const user = await UserModel.findOne({ email: data.email });
            if (!user) throw new Error("Usuário não encontrado.");

            const isPasswordValid = await bcrypt.compare(
                data.password, user.password
            );
            if (!isPasswordValid) throw new Error("Senha incorreta.");

            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            return {
                message: "Login realizado com sucesso!",
                user: {
                    id: user._id,
                    email: user.email
                },
                token,
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default AuthService;
