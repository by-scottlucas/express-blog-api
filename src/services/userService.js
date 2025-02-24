import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import UserModel from '../models/userModel.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

class UserService {
    async list() {
        try {
            const users = await UserModel.find();
            return users;
        } catch (error) {
            throw new Error(
                "Erro ao buscar os users. " + error.message
            );
        }
    }

    async create(data) {
        try {
            const newUser = new UserModel(data);
            newUser.password = await bcrypt.hash(newUser.password, 10);
            await newUser.save();

            const token = await jwt.sign(
                { id: newUser._id },
                jwtSecret,
                { expiresIn: '1h' }
            );

            return { user: newUser, token };
        } catch (error) {
            throw new Error(
                "Erro ao cadastrar novo usuário. " + error.message
            );
        }
    }

    async read(id) {
        try {
            const user = await UserModel.findById(id);
            if (!user) throw new Error("Usuário não encontrado.");
            return user;
        } catch (error) {
            throw new Error("Erro ao buscar o usuário. " + error.message);
        }
    }

    async update(id, data) {
        try {
            if (data.password) {
                data.password = await bcrypt.hash(data.password, 10);
            }

            const updatedUser = await UserModel.findByIdAndUpdate(
                id, data, { new: true }
            );

            if (!updatedUser) throw new Error(
                "Usuário não encontrado, impossível atualizar."
            );

            const token = await jwt.sign(
                { id: updatedUser._id },
                jwtSecret,
                { expiresIn: '1h' }
            );

            return { user: updatedUser, token };
        } catch (error) {
            throw new Error("Erro ao atualizar o usuário. " + error.message);
        }
    }

    async delete(id) {
        try {
            await this.read(id);
            const result = await UserModel.deleteOne({ _id: id });
            if (result.deletedCount === 0) {
                throw new Error(
                    "Falha ao exluir o usuário. Tente novamente mais tarde."
                );
            }
            return;
        } catch (error) {
            throw new Error("Erro ao exluir o usuário. " + error.message);
        }
    }
}

export default UserService;