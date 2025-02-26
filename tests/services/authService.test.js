import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import UserCreateMock from '../__mocks__/userCreateMock.js';
import AuthService from '../../src/services/authService.js';
import UserService from '../../src/services/userService.js';

describe('AuthService', () => {
    let mongoServer;
    let authService;
    let userService;
    let testUser;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        authService = new AuthService();
        userService = new UserService();
    });

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase();
        testUser = await createTestUser();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    async function createTestUser() {
        const { user } = await userService.create(UserCreateMock);
        return user;
    }

    test('Deve realizar login com credenciais válidas', async () => {
        const loginData = { email: 'lucas@email.com', password: 'lucas123' };
        const response = await authService.login(loginData);

        expect(response).toHaveProperty('message');
        expect(response).toHaveProperty('user');
        expect(response.user).toHaveProperty('id');
        expect(response.user).toHaveProperty('email');
        expect(response).toHaveProperty('token');

        const decodedToken = jwt.verify(response.token, process.env.JWT_SECRET);
        expect(decodedToken.id).toBe(testUser._id.toString());
    });

    test('Deve falhar ao tentar login com email inválido', async () => {
        await expect(authService.login({
            email: 'joaninha@email.com',
            password: 'lucas123'
        })).rejects.toThrow('Usuário não encontrado.');
    });

    test('Deve falhar ao tentar login com senha incorreta', async () => {
        await expect(authService.login({
            email: testUser.email,
            password: 'senhaErrada'
        })).rejects.toThrow('Senha incorreta.');
    });
});
