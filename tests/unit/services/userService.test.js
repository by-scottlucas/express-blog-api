import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import UserService from '../../../src/services/userService.js';
import UserCreateMock from '../../__mocks__/userCreateMock.js';

jest.mock('../../../src/services/userService.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('User Service', () => {
    let userService;
    let userId = "67bcd1dea2ee4dee4d8c8ddb"

    beforeEach(() => {
        userService = new UserService();
        UserService.mockClear();
        bcrypt.hash.mockClear();
        bcrypt.compare.mockClear();
        jwt.sign.mockClear();
        jwt.verify.mockClear();
    });

    test('Deve listar os usuários do sistema', async () => {
        const mockUsers = [{
            _id: userId,
            name: UserCreateMock.name,
            email: UserCreateMock.email
        }];

        userService.list.mockResolvedValue(mockUsers);

        const users = await userService.list();

        expect(users).toHaveLength(1);
        expect(users[0]).toHaveProperty('_id');
        expect(users[0]).toHaveProperty('name');
        expect(users[0]).toHaveProperty('email');
    });

    test('Deve criar um usuário no sistema', async () => {
        const mockUser = {
            _id: userId,
            name: UserCreateMock.name,
            email: UserCreateMock.email,
            password: 'hashedPassword'
        };
        const mockToken = 'mockedToken';

        userService.create.mockResolvedValue({
            user: mockUser,
            token: mockToken
        });
        bcrypt.hash.mockResolvedValue('hashedPassword');
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue(mockToken);
        jwt.verify.mockReturnValue({ id: mockUser._id });

        const { user, token } = await userService.create(UserCreateMock);

        expect(user).toMatchObject({
            name: UserCreateMock.name,
            email: UserCreateMock.email
        });
        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('password');

        const isPasswordValid = await bcrypt.compare(
            UserCreateMock.password, user.password
        );
        expect(isPasswordValid).toBe(true);

        expect(token).toBeTruthy();
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        expect(decodedToken.id).toBe(user._id.toString());
    });

    test('Deve obter um usuário pelo ID', async () => {
        const mockUser = {
            _id: userId,
            name: UserCreateMock.name,
            email: UserCreateMock.email
        };
        
        userService.read.mockResolvedValue(mockUser);

        const foundUser = await userService.read(mockUser._id);

        expect(foundUser._id).toBe(mockUser._id);
        expect(foundUser).toHaveProperty('name', UserCreateMock.name);
        expect(foundUser).toHaveProperty('email', UserCreateMock.email);
    });

    test('Deve atualizar um usuário', async () => {
        const mockUser = {
            _id: userId,
            name: UserCreateMock.name,
            email: UserCreateMock.email
        };
        const updatedData = { name: "Lucas Silva", password: "newpassword123" };
        const mockUpdatedUser = { ...mockUser, ...updatedData, password: 'hashedPassword' };
        const mockToken = 'mockedToken';

        userService.update.mockResolvedValue({ user: mockUpdatedUser, token: mockToken });
        bcrypt.hash.mockResolvedValue('hashedPassword');
        jwt.sign.mockReturnValue(mockToken);
        jwt.verify.mockReturnValue({ id: mockUpdatedUser._id });

        const { user, token } = await userService.update(mockUser._id, updatedData);

        expect(user).toHaveProperty('_id');
        expect(user.name).toBe(updatedData.name);
        expect(user.password).toBe('hashedPassword');

        expect(token).toBeTruthy();
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        expect(decodedToken.id).toBe(user._id.toString());
    });

    test('Deve excluir um usuário', async () => {
        const mockUser = {
            _id: userId,
            name: UserCreateMock.name,
            email: UserCreateMock.email
        };

        userService.read.mockResolvedValue(mockUser);
        userService.delete.mockResolvedValue(mockUser);

        const foundUser = await userService.read(mockUser._id);
        expect(foundUser._id).toBe(mockUser._id);
        await userService.delete(foundUser);
    });

    test('Não deve criar um usuário sem o nome', async () => {
        const invalidUser = { ...UserCreateMock, name: '' };

        userService.create.mockRejectedValue(new Error('O nome é obrigatório.'));

        await expect(userService.create(invalidUser))
            .rejects
            .toThrowError('O nome é obrigatório.');
    });

    test('Não deve criar um usuário sem o e-mail', async () => {
        const invalidUser = { ...UserCreateMock, email: '' };

        userService.create.mockRejectedValue(new Error('O e-mail é obrigatório'));

        await expect(userService.create(invalidUser))
            .rejects
            .toThrowError('O e-mail é obrigatório');
    });

    test('Não deve encontrar um usuário com ID inválido', async () => {
        const invalidUserId = 'invalid_id';
        userService.read.mockRejectedValue(new Error('Usuário não encontrado'));

        await expect(userService.read(invalidUserId))
            .rejects
            .toThrowError('Usuário não encontrado');
    });

    test('Não deve atualizar um usuário com nome vazio', async () => {
        const mockUser = { _id: userId, ...UserCreateMock };
        userService.create.mockResolvedValue({ user: mockUser });
        userService.update.mockRejectedValue(new Error('O nome é obrigatório.'));

        const updatedData = { name: '', password: 'newpassword123' };

        await expect(userService.update(mockUser._id, updatedData))
            .rejects
            .toThrowError('O nome é obrigatório.');
    });

    test('Não deve atualizar um usuário com e-mail já existente', async () => {
        const mockUser = { _id: userId, ...UserCreateMock };
        const anotherUser = { _id: '456', ...UserCreateMock, email: 'outro@dominio.com' };
        userService.create.mockResolvedValueOnce({ user: mockUser });
        userService.create.mockResolvedValueOnce({ user: anotherUser });
        userService.update.mockRejectedValue(new Error('O e-mail já em uso'));

        const updatedData = { email: 'outro@dominio.com' };

        await expect(userService.update(mockUser._id, updatedData))
            .rejects
            .toThrowError('O e-mail já em uso');
    });

    test('Não deve excluir um usuário com ID inválido', async () => {
        const invalidUserId = 'invalid_id';
        userService.delete.mockRejectedValue(new Error('Usuário não encontrado'));

        await expect(userService.delete(invalidUserId))
            .rejects
            .toThrowError('Usuário não encontrado');
    });

    test('Deve retornar uma lista vazia quando não houver usuários', async () => {
        userService.list.mockResolvedValue([]);

        const users = await userService.list();
        expect(users).toHaveLength(0);
    });
});