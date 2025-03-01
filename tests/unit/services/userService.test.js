import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import UserService from '../../../src/services/userService.js';
import UserCreateMock from '../../__mocks__/userCreateMock.js';

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
        await userService.create(UserCreateMock);
        const users = await userService.list();

        expect(users).toHaveLength(1);
        expect(users[0]).toHaveProperty('_id');
        expect(users[0]).toHaveProperty('name');
        expect(users[0]).toHaveProperty('email');
    });

    test('Deve criar um usuário no sistema', async () => {
        const { user, token } = await userService.create(UserCreateMock);

        expect(user).toMatchObject({
            name: UserCreateMock.name,
            email: UserCreateMock.email
        });
        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('password');

        const isPasswordValid = await bcrypt.compare(UserCreateMock.password, user.password);
        expect(isPasswordValid).toBe(true);

        expect(token).toBeTruthy();
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        expect(decodedToken.id).toBe(user._id.toString());
    });

    test('Deve obter um usuário pelo ID', async () => {
        const { user } = await userService.create(UserCreateMock);
        const foundUser = await userService.read(user._id);

        expect(foundUser._id.toString()).toBe(user._id.toString());
        expect(foundUser).toHaveProperty('name', UserCreateMock.name);
        expect(foundUser).toHaveProperty('email', UserCreateMock.email);
    });

    test('Deve atualizar um usuário', async () => {
        const { user } = await userService.create(UserCreateMock);
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
        const { user } = await userService.create(UserCreateMock);
        const foundUser = await userService.read(user._id);
        expect(foundUser._id.toString()).toBe(user._id.toString());
        await userService.delete(foundUser);
    });

    test('Não deve criar um usuário sem o nome', async () => {
        const invalidUser = { ...UserCreateMock, name: '' };

        await expect(userService.create(invalidUser))
            .rejects
            .toThrowError('O nome é obrigatório');
    });

    test('Não deve criar um usuário sem o e-mail', async () => {
        const invalidUser = { ...UserCreateMock, email: '' };

        await expect(userService.create(invalidUser))
            .rejects
            .toThrowError('O e-mail é obrigatório');
    });

    test('Não deve encontrar um usuário com ID inválido', async () => {
        const invalidUserId = new mongoose.Types.ObjectId();
        await expect(userService.read(invalidUserId))
            .rejects
            .toThrowError('Usuário não encontrado');
    });

    test('Não deve atualizar um usuário com nome vazio', async () => {
        const { user } = await userService.create(UserCreateMock);
        const updatedData = { name: '', password: 'newpassword123' };

        await expect(userService.update(user._id, updatedData))
            .rejects
            .toThrowError('O nome é obrigatório');
    });

    test('Não deve atualizar um usuário com e-mail já existente', async () => {
        const { user } = await userService.create(UserCreateMock);
        const anotherUser = { ...UserCreateMock, email: 'outro@dominio.com' };
        await userService.create(anotherUser);
 
        const updatedData = { email: 'outro@dominio.com' };
        await expect(userService.update(user._id, updatedData))
            .rejects
            .toThrowError('O e-mail já em uso');
    });

    test('Não deve excluir um usuário com ID inválido', async () => {
        const invalidUserId = new mongoose.Types.ObjectId();
        await expect(userService.delete(invalidUserId))
            .rejects
            .toThrowError('Usuário não encontrado');
    });

    test('Deve retornar uma lista vazia quando não houver usuários', async () => {
        const users = await userService.list();
        expect(users).toHaveLength(0);
    });
});
