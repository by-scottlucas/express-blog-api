import express from 'express';
import request from 'supertest';

import routes from '../../../src/routes/routes.js';
import UserService from '../../../src/services/userService.js';
import UserCreateMock from '../../__mocks__/userCreateMock.js';
import UserListMock from '../../__mocks__/userListMock.js';

jest.mock('../../../src/services/userService.js');

jest.mock('../../../src/middlewares/authMiddleware.js', () => (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).send('Token não fornecido');
    }
    next();
});

const app = express();
app.use(express.json());

const baseApiUrl = '/api/v1';

routes(app);

describe('UserController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Deve listar os usuários', async () => {
        const mockUsers = [UserListMock];
        UserService.prototype.list.mockResolvedValue(mockUsers);

        const response = await request(app)
            .get(`${baseApiUrl}/users/`)
            .set('Authorization', `Bearer token`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUsers);
    });

    test('Deve criar um usuário', async () => {
        const newUser = UserCreateMock;
        UserService.prototype.create.mockResolvedValue(newUser);

        const response = await request(app)
            .post(`${baseApiUrl}/users/`)
            .send(UserCreateMock);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newUser);
    });

    test('Deve buscar um usuário pelo ID', async () => {
        const mockUser = UserCreateMock;
        UserService.prototype.read.mockResolvedValue(mockUser);

        const response = await request(app)
            .get(`${baseApiUrl}/users/1`)
            .set('Authorization', 'Bearer token');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUser);
    });

    test('Deve atualizar um usuário', async () => {
        const updatedUser = { id: 1, name: 'Lucas Silva', email: 'lucas@example.com' };
        UserService.prototype.read.mockResolvedValue(updatedUser);
        UserService.prototype.update.mockResolvedValue(updatedUser);

        const response = await request(app)
            .put(`${baseApiUrl}/users/1`)
            .set('Authorization', 'Bearer token')
            .send({ name: 'Lucas Silva' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedUser);
    });

    test('Deve excluir um usuário', async () => {
        UserService.prototype.read.mockResolvedValue(UserCreateMock);
        UserService.prototype.delete.mockResolvedValue();

        const response = await request(app)
            .delete(`${baseApiUrl}/users/1`)
            .set('Authorization', 'Bearer token');
        expect(response.status).toBe(204);
    });

    test('Não deve listar usuários sem autorização', async () => {
        const response = await request(app)
            .get(`${baseApiUrl}/users/`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('Não deve criar um usuário com dados inválidos', async () => {
        const invalidUser = { ...UserCreateMock, email: '' };
        const response = await request(app)
            .post(`${baseApiUrl}/users/`)
            .send(invalidUser);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Preencha todos os campos.');
    });

    test('Deve retornar 500 quando buscar um usuário com ID inexistente', async () => {
        UserService.prototype.read.mockRejectedValue(new Error('Usuário não encontrado'));

        const response = await request(app)
            .get(`${baseApiUrl}/users/invalid_id`)
            .set('Authorization', 'Bearer token');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Usuário não encontrado');
    });

    test('Não deve atualizar um usuário com dados inválidos', async () => {
        const invalidUserData = { name: '', email: 'invalid@domain.com' };

        UserService.prototype.update.mockRejectedValue(new Error('O nome é obrigatório'));

        const response = await request(app)
            .put(`${baseApiUrl}/users/1`)
            .set('Authorization', 'Bearer token')
            .send(invalidUserData);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Usuário não encontrado');
    });

    test('Não deve excluir um usuário com ID inválido', async () => {
        UserService.prototype.delete.mockRejectedValue(new Error('Usuário não encontrado'));

        const response = await request(app)
            .delete(`${baseApiUrl}/users/invalid_id`)
            .set('Authorization', 'Bearer token');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Usuário não encontrado');
    });
});
