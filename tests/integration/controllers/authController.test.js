import express from 'express';
import request from 'supertest';

import AuthController from '../../../src/controllers/authController.js';
import AuthService from '../../../src/services/authService.js';

jest.mock('../../../src/services/authService.js');

const app = express();
app.use(express.json());

const baseApiUrl = '/api/v1/auth';
const authController = new AuthController();

app.post(`${baseApiUrl}/register`, (req, res) => authController.register(req, res));
app.post(`${baseApiUrl}/login`, (req, res) => authController.login(req, res));
app.post(`${baseApiUrl}/logout`, (req, res) => authController.logout(req, res));

describe('AuthController', () => {
    describe('POST /register', () => {
        it('deve retornar erro se faltar algum campo', async () => {
            const response = await request(app).post(`${baseApiUrl}/register`).send({
                name: 'John Doe',
                email: 'john@example.com'
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Preencha todos os campos.');
        });

        it('deve registrar um usuário com sucesso', async () => {
            const mockUser = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };
            AuthService.prototype.register.mockResolvedValue(mockUser);

            const response = await request(app).post(`${baseApiUrl}/register`).send(mockUser);

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('John Doe');
            expect(response.body.email).toBe('john@example.com');
        });

        it('deve retornar erro de servidor caso haja falha ao registrar', async () => {
            const mockUser = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };
            AuthService.prototype.register.mockRejectedValue(new Error('Erro no servidor'));

            const response = await request(app).post(`${baseApiUrl}/register`).send(mockUser);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Erro no servidor');
        });
    });

    describe('POST /login', () => {
        it('deve retornar erro se faltar algum campo', async () => {
            const response = await request(app).post(`${baseApiUrl}/login`).send({
                email: 'john@example.com'
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Preencha todos os campos.');
        });

        it('deve realizar login com sucesso', async () => {
            const loginData = {
                email: 'john@example.com',
                password: 'password123'
            };
            const mockResponse = {
                user: { name: 'John Doe', email: 'john@example.com' },
                token: 'mock-token',
            };
            AuthService.prototype.login.mockResolvedValue(mockResponse);

            const response = await request(app).post(`${baseApiUrl}/login`).send(loginData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login realizado com sucesso!');
            expect(response.body.user.name).toBe('John Doe');
            expect(response.body.token).toBe('mock-token');
        });

        it('deve retornar erro de autenticação caso falhe no login', async () => {
            const loginData = {
                email: 'john@example.com',
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
            const response = await request(app).post(`${baseApiUrl}/logout`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logout realizado com sucesso!');
        });
    });
});
