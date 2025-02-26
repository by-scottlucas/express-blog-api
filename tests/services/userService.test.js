import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import UserService from '../../src/services/userService.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

const userService = new UserService();

describe('User Service', () => {

    test('Validar a definição', () => {
        expect(userService).toBeDefined();
    });

    test('Deve listar os usuários do sistema', async () => {
        const newUser = {
            name: "Lucas",
            email: "lucas@email.com",
            password: "lucas123"
        };

        await userService.create(newUser);

        const users = await userService.list();
        expect(users.length).toBeGreaterThan(0);
        expect(users[0]).toHaveProperty('_id');
        expect(users[0]).toHaveProperty('name');
        expect(users[0]).toHaveProperty('email');
    });

    test('Deve criar um usuário no sistema', async () => {
        const newUser = {
            name: "Lucas",
            email: "lucas@email.com",
            password: "lucas123"
        };

        const { user, token } = await userService.create(newUser);

        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('password');

        const isPasswordValid = await bcrypt.compare(newUser.password, user.password);
        expect(isPasswordValid).toBe(true);

        expect(token).toBeTruthy();
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        expect(decodedToken.id).toBe(user._id.toString());
    });

    test('Deve obter um usuário pelo ID', async () => {
        const newUser = {
            name: "Lucas",
            email: "lucas@email.com",
            password: "lucas123"
        };

        const { user } = await userService.create(newUser);
        const foundUser = await userService.read(user._id);

        expect(foundUser).toHaveProperty('_id');
        expect(foundUser).toHaveProperty('name');
        expect(foundUser).toHaveProperty('email');
        expect(foundUser.name).toBe(newUser.name);
    });

    test('Deve atualizar um usuário', async () => {
        const newUser = {
            name: "Lucas",
            email: "lucas@email.com",
            password: "lucas123"
        };
    
        const { user } = await userService.create(newUser);
        const updatedData = { name: "Lucas Updated", password: "newpassword123" };
    
        const { user: updatedUser, token } = await userService.update(user._id, updatedData);
    
        expect(updatedUser).toHaveProperty('_id');
        expect(updatedUser.name).toBe(updatedData.name);
        expect(updatedUser.password).toBe(updatedData.password);

        expect(token).toBeTruthy();
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        expect(decodedToken.id).toBe(updatedUser._id.toString());
    });
    

    test('Deve excluir um usuário', async () => {
        const newUser = {
            name: "Lucas",
            email: "lucas@email.com",
            password: "lucas123"
        };

        const { user } = await userService.create(newUser);
        const foundUser = await userService.read(user._id);
        expect(foundUser).toHaveProperty('_id');

        await userService.delete(foundUser);
    });

});
