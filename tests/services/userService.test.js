import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import UserService from '../../src/services/userService.js';
import userCreateMock from '../__mocks__/userCreateMock.js';

describe('User Service', () => {
    let mongoServer;
    let userService;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        userService = new UserService();
    });

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test('Deve validar a instância do serviço', () => {
        expect(userService).toBeDefined();
    });

    test('Deve listar os usuários do sistema', async () => {
        await userService.create(userCreateMock);
        const users = await userService.list();

        expect(users.length).toBeGreaterThan(0);
        expect(users[0]).toHaveProperty('_id');
        expect(users[0]).toHaveProperty('name');
        expect(users[0]).toHaveProperty('email');
    });

    test('Deve criar um usuário no sistema', async () => {
        const { user, token } = await userService.create(userCreateMock);

        expect(user).toMatchObject({
            name: userCreateMock.name,
            email: userCreateMock.email
        });
        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('password');

        const isPasswordValid = await bcrypt.compare(userCreateMock.password, user.password);
        expect(isPasswordValid).toBe(true);

        expect(token).toBeTruthy();
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        expect(decodedToken.id).toBe(user._id.toString());
    });

    test('Deve obter um usuário pelo ID', async () => {
        const { user } = await userService.create(userCreateMock);
        const foundUser = await userService.read(user._id);

        expect(foundUser).toMatchObject({
            name: userCreateMock.name,
            email: userCreateMock.email
        });
        expect(foundUser).toHaveProperty('_id');
    });

    test('Deve atualizar um usuário', async () => {
        const { user } = await userService.create(userCreateMock);
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
        const { user } = await userService.create(userCreateMock);
        const foundUser = await userService.read(user._id);
        expect(foundUser).toHaveProperty('_id');
        await userService.delete(foundUser);
    });

});
