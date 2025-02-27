import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import validator from 'validator';

import PostModel from '../models/postModel.js';
import UserModel from '../models/userModel.js';

dotenv.config();

class UserService {
    async list() {
        try {
            const users = await UserModel.find();
            return users;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async create(data) {
        try {

            if (!validator.isEmail(data.email)) {
                throw new Error("E-mail inválido");
            }

            const existingUser = await UserModel.findOne({ email: data.email });
            
            if (existingUser) {
                throw new Error("Email já está em uso.");
            }            

            const newUser = new UserModel(data);
            newUser.password = await bcrypt.hash(newUser.password, 10);
            await newUser.save();

            const token = await jwt.sign(
                { id: newUser._id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return { user: newUser, token };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async read(id) {
        try {
            const user = await UserModel.findById(id).populate('posts');

            if (!user) {
                throw new Error("Usuário não encontrado.");
            }

            return user;
        } catch (error) {
            throw new Error(error.message);
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

            if (!updatedUser) {
                throw new Error("Usuário não encontrado, impossível atualizar.");
            }

            const token = await jwt.sign(
                { id: updatedUser._id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return { user: updatedUser, token };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async delete(id) {
        try {
            await this.read(id);
            await PostModel.deleteMany({ author: id });
            const result = await UserModel.deleteOne({ _id: id });

            if (result.deletedCount === 0) {
                throw new Error("Falha ao excluir o usuário. Tente novamente mais tarde.");
            }

            return;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default UserService;
