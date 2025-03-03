import express from 'express';
import request from 'supertest';

import Routes from '../../../src/routes/routes.js';
import AuthService from '../../../src/services/authService.js';
import TokenMock from '../../__mocks__/tokenMock.js';
import UserCreateMock from '../../__mocks__/userCreateMock.js';

jest.mock('../../../src/services/authService.js');

const app = express();
app.use(express.json());

const baseApiUrl = '/api/v1/auth';

Routes(app);

describe('AuthController', () => {
    describe('POST /register', () => {
        it('deve retornar erro se faltar algum campo', async () => {
            const response = await request(app)
                .post(`${baseApiUrl}/register`)
                .send({ ...UserCreateMock, password: '' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('A senha é obrigatória.');
        });

        it('deve registrar um usuário com sucesso', async () => {
            const mockUser = UserCreateMock;
            AuthService.prototype.register.mockResolvedValue(mockUser);

            const response = await request(app)
                .post(`${baseApiUrl}/register`)
                .send(mockUser);

            expect(response.status).toBe(201);
            expect(response.body.name).toBe(UserCreateMock.name);
            expect(response.body.email).toBe(UserCreateMock.email);
        });

        it('deve retornar erro de servidor caso haja falha ao registrar', async () => {
            const mockUser = UserCreateMock;
            AuthService.prototype.register.mockRejectedValue(new Error('Erro no servidor'));

            const response = await request(app)
                .post(`${baseApiUrl}/register`)
                .send(mockUser);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Erro no servidor');
        });
    });

    describe('POST /login', () => {
        it('deve retornar erro se faltar algum campo', async () => {
            const response = await request(app)
                .post(`${baseApiUrl}/login`)
                .send({ email: UserCreateMock.email });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Preencha todos os campos.');
        });

        it('deve realizar login com sucesso', async () => {
            const loginData = {
                email: UserCreateMock.email,
                password: UserCreateMock.password
            };

            const mockResponse = {
                user: { name: UserCreateMock.name, email: UserCreateMock.email },
                token: TokenMock,
            };
            AuthService.prototype.login.mockResolvedValue(mockResponse);

            const response = await request(app)
                .post(`${baseApiUrl}/login`)
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login realizado com sucesso!');
            expect(response.body.user.name).toBe(UserCreateMock.name);
            expect(response.body.token).toBe(TokenMock);
        });

        it('deve retornar erro de autenticação caso falhe no login', async () => {
            const loginData = {
                email: UserCreateMock.email,
                password: 'wrongpassword'
            };
            AuthService.prototype.login.mockRejectedValue(new Error('Credenciais inválidas'));

            const response = await request(app).post(`${baseApiUrl}/login`).send(loginData);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Credenciais inválidas');
        });
    });

    describe('POST /logout', () => {
        it('deve realizar logout com sucesso', async () => {
            const response = await request(app)
                .post(`${baseApiUrl}/logout`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logout realizado com sucesso!');
        });
    });
});
