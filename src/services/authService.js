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

    async register(data) {
        try {
            const existingUser = await UserModel.findOne({ email: data.email });
            if (existingUser) throw new Error("E-mail já cadastrado.");

            const hashedPassword = await bcrypt.hash(data.password, 10);
            const newUser = new UserModel({
                name: data.name,
                email: data.email,
                password: hashedPassword,
            });

            await newUser.save();

            return {
                message: "Usuário registrado com sucesso!",
                user: {
                    id: newUser._id,
                    email: newUser.email
                },
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async verifyToken(token) {
        try {
            if (!token) throw new Error("Token não fornecido.");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            if (error.message === "Token não fornecido.") {
                throw error;
            }
            throw new Error("Token inválido.");
        }
    }
}

export default AuthService;
