import UserModel from '../../../src/models/userModel.js';
import UserCreateMock from '../../__mocks__/userCreateMock.js';

jest.mock('../../../src/models/userModel.js');

describe('User Model (Mockado)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Deve criar um usuário válido', async () => {
        UserModel.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({ ...UserCreateMock, _id: 'fakeId' }),
        }));

        const user = new UserModel(UserCreateMock);
        const savedUser = await user.save();

        expect(savedUser).toHaveProperty('_id');
        expect(savedUser.name).toBe(UserCreateMock.name);
        expect(savedUser.email).toBe(UserCreateMock.email);
        expect(savedUser.password).toBe(UserCreateMock.password);
    });

    test('Deve falhar ao criar um usuário sem nome', async () => {
        UserModel.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(new Error('O nome é obrigatório')),
        }));

        const user = new UserModel({ email: 'lucas@email.com', password: '123456' });

        await expect(user.save()).rejects.toThrow('O nome é obrigatório');
    });

    test('Deve falhar ao criar um usuário com e-mail inválido', async () => {
        UserModel.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(new Error('E-mail inválido')),
        }));

        const user = new UserModel({ name: 'Lucas', email: 'invalid-email', password: '123456' });

        await expect(user.save()).rejects.toThrow('E-mail inválido');
    });

    test('Deve associar posts ao usuário', async () => {
        UserModel.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({ ...UserCreateMock, posts: [] }),
        }));

        const user = new UserModel({ ...UserCreateMock, posts: [] });
        const savedUser = await user.save();

        expect(savedUser).toHaveProperty('posts');
        expect(Array.isArray(savedUser.posts)).toBe(true);
    });
});
