import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import UserModel from '../../../src/models/userModel.js';
import AuthService from '../../../src/services/authService.js';
import { TokenMock } from '../../__mocks__/tokenMock.js';
import UserCreateMock from '../../__mocks__/userCreateMock.js';

jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('../../../src/models/userModel.js');

describe('AuthService', () => {
    let testUser;
    let authService;

    const validCredentials = {
        email: UserCreateMock.email,
        password: UserCreateMock.password,
    };

    const invalidEmailCredentials = {
        email: 'invalid@email.com',
        password: UserCreateMock.password,
    };

    const incorrectPasswordCredentials = {
        email: validCredentials.email,
        password: 'incorrectPassword',
    };

    beforeEach(() => {
        authService = new AuthService();
        UserModel.findOne.mockReset();
        UserModel.prototype.save.mockReset();
        bcrypt.compare.mockReset();
        bcrypt.hash.mockReset();
        jwt.sign.mockReset();
        jwt.verify.mockReset();

        testUser = {
            _id: 'someUserId',
            email: validCredentials.email,
            password: 'hashedPassword',
            save: jest.fn()
        };

        UserModel.findOne.mockResolvedValue(testUser);
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue('hashedPassword');
        jwt.sign.mockReturnValue(TokenMock);
        jwt.verify.mockReturnValue({
            _id: testUser._id,
            email: testUser.email
        });
    });

    test('Deve realizar login com credenciais válidas', async () => {
        const response = await authService.login(validCredentials);

        expect(response).toHaveProperty('message');
        expect(response).toHaveProperty('user');
        expect(response.user).toHaveProperty('id');
        expect(response.user).toHaveProperty('email');
        expect(response).toHaveProperty('token');
        expect(response.token).toBe(TokenMock);
    });

    test('Deve falhar ao tentar login com email inválido', async () => {
        UserModel.findOne.mockResolvedValue(null);

        await expect(authService.login(invalidEmailCredentials))
            .rejects
            .toThrow('Usuário não encontrado.');
    });

    test('Deve falhar ao tentar login com senha incorreta', async () => {
        bcrypt.compare.mockResolvedValue(false);

        await expect(authService.login(incorrectPasswordCredentials))
            .rejects
            .toThrow('Senha incorreta.');
    });

    test('Deve registrar um novo usuário', async () => {
        UserModel.findOne.mockResolvedValue(null);
        const newUser = UserCreateMock;
        const savedUser = {
            id: 'newUserId',
            email: newUser.email,
            save: jest.fn()
        };
        UserModel.mockReturnValue(savedUser);

        const response = await authService.register(newUser);

        expect(response).toHaveProperty('user');
        expect(response.user).toHaveProperty('id');
        expect(response.user.email).toBe(newUser.email);
    });

    test('Não deve permitir registrar um usuário com e-mail já cadastrado', async () => {
        await expect(authService.register(validCredentials))
            .rejects
            .toThrow('E-mail já cadastrado.');
    });

    test('Deve gerar um token válido ao realizar login', async () => {
        const response = await authService.login(validCredentials);
        expect(response.token).toBe(TokenMock);
    });

    test('Não deve permitir acessar um recurso protegido com um token inválido', async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error('Token inválido.');
        });
        await expect(authService.verifyToken('invalidToken'))
            .rejects
            .toThrow('Token inválido.');
    });

    test('Não deve permitir acessar um recurso protegido sem um token', async () => {
        await expect(authService.verifyToken(null))
            .rejects
            .toThrow('Token não fornecido.');
    });
});