import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import UserModel from '../../src/models/userModel.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('User Model', () => {
    beforeEach(async () => {
        // Redefinir os dados do banco apenas quando necessário, evita chamadas excessivas
        await UserModel.deleteMany({});
    });

    test('Deve criar um usuário válido', async () => {
        const user = new UserModel({
            name: 'Lucas',
            email: 'lucas@email.com',
            password: '123456',
        });

        const savedUser = await user.save();

        expect(savedUser.name).toBe('Lucas');
        expect(savedUser.email).toBe('lucas@email.com');
        expect(savedUser.password).toBe('123456');
        expect(savedUser).toHaveProperty('_id');
    });

    test('Deve falhar ao criar um usuário sem nome', async () => {
        const user = new UserModel({
            email: 'lucas@email.com',
            password: '123456',
        });

        await expect(user.save()).rejects.toThrowError('O nome é obrigatório');
    });

    test('Deve falhar ao criar um usuário sem e-mail', async () => {
        const user = new UserModel({
            name: 'Lucas',
            password: '123456',
        });

        await expect(user.save()).rejects.toThrowError('O e-mail é obrigatório');
    });

    test('Deve falhar ao criar um usuário sem senha', async () => {
        const user = new UserModel({
            name: 'Lucas',
            email: 'lucas@email.com',
        });

        await expect(user.save()).rejects.toThrowError('A senha é obrigatória');
    });

    test('Deve falhar ao criar um usuário com e-mail inválido', async () => {
        const user = new UserModel({
            name: 'Lucas',
            email: 'invalid-email',
            password: '123456',
        });

        await expect(user.save()).rejects.toThrowError('E-mail inválido');
    });

    test('Deve associar posts ao usuário', async () => {
        const user = new UserModel({
            name: 'Lucas',
            email: 'lucas@email.com',
            password: '123456',
            posts: [],
        });

        const savedUser = await user.save();
        expect(savedUser).toHaveProperty('posts');
        expect(Array.isArray(savedUser.posts)).toBe(true);
    });
});
