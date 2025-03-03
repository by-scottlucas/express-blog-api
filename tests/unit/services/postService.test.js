import PostService from '../../../src/services/postService.js';
import UserService from '../../../src/services/userService.js';
import PostCreateMock from '../../__mocks__/postCreateMock.js';
import UserCreateMock from '../../__mocks__/userCreateMock.js';

jest.mock('../../../src/services/userService.js');
jest.mock('../../../src/services/postService.js');

describe('PostService', () => {
    let postService;
    let userService;
    let mockUser;
    let mockPost;
    let userId = "67bcd1dea2ee4dee4d8c8ddb"
    let postId = "67bcd339a2ee4dee4d8c8dfb"

    beforeEach(() => {
        userService = new UserService();
        postService = new PostService();
        UserService.mockClear();
        PostService.mockClear();

        mockUser = { _id: userId, ...UserCreateMock };
        mockPost = { _id: postId, author: userId, ...PostCreateMock };

        userService.create.mockResolvedValue({ user: mockUser });
        userService.read.mockResolvedValue(mockUser);
        postService.create.mockResolvedValue(mockPost);
        postService.read.mockImplementation((id) => {
            if (id === postId) return Promise.resolve(mockPost);
            return Promise.reject(new Error('Post não encontrado.'));
        });
        postService.list.mockResolvedValue([mockPost]);
        postService.update.mockResolvedValue({
            ...mockPost, title: 'Titulo atualizado', content: 'Conteudo atualizado'
        });
        postService.delete.mockResolvedValue(null);
    });

    test('Deve listar os posts do sistema', async () => {
        const posts = await postService.list();

        expect(posts.length).toBeGreaterThan(0);
        expect(posts[0]).toHaveProperty('_id');
        expect(posts[0]).toHaveProperty('title');
        expect(posts[0]).toHaveProperty('content');
        expect(posts[0]).toHaveProperty('author');
        expect(posts[0]).toHaveProperty('createdAt');
        expect(posts[0]).toHaveProperty('updatedAt');
    });

    test('Deve criar um post no sistema', async () => {
        const post = await postService.create({
            ...PostCreateMock,
            author: mockUser._id,
        });

        expect(post).toHaveProperty('_id');
        expect(post).toHaveProperty('title', PostCreateMock.title);
        expect(post).toHaveProperty('content', PostCreateMock.content);
        expect(post).toHaveProperty('author', PostCreateMock.author);
        expect(post).toHaveProperty('createdAt');
        expect(post).toHaveProperty('updatedAt');
    });

    test('Deve obter um post cadastrado no sistema', async () => {
        const foundPost = await postService.read(postId);

        expect(foundPost).toHaveProperty('_id', postId);
    });

    test('Deve atualizar um post', async () => {
        const updatedData = { title: 'Titulo atualizado', content: 'Conteudo atualizado' };
        const updatedPost = await postService.update(postId, updatedData);

        expect(updatedPost).toMatchObject({
            _id: postId,
            title: updatedData.title,
            content: updatedData.content,
        });
    });

    test('Deve excluir um post', async () => {
        postService.delete.mockResolvedValue(null);
        postService.read.mockRejectedValue(new Error('Post não encontrado.'));
        await postService.delete(postId);
        await expect(postService.read(postId)).rejects.toThrow('Post não encontrado.');
    });

    test('Não deve criar um post sem título', async () => {
        postService.create.mockRejectedValue(new Error('O título é obrigatório.'));
        await expect(postService.create({
            ...PostCreateMock,
            author: mockUser._id,
            title: ''
        }))
            .rejects.toThrow('O título é obrigatório.');
    });

    test('Não deve criar um post sem conteúdo', async () => {
        postService.create.mockRejectedValue(new Error('O conteúdo é obrigatório.'));
        await expect(postService.create({
            ...PostCreateMock,
            author: mockUser._id,
            content: ''
        }))
            .rejects.toThrow('O conteúdo é obrigatório.');
    });

    test('Não deve criar um post com um autor inexistente', async () => {
        userService.read.mockRejectedValue(new Error('Usuário não encontrado.'));
        postService.create.mockRejectedValue(new Error('Usuário não encontrado.'));
        await expect(postService.create({ ...PostCreateMock, author: 'invalidUserId' }))
            .rejects.toThrow('Usuário não encontrado.');
    });

    test('Não deve encontrar um post que não existe', async () => {
        await expect(postService.read('fakePostId'))
            .rejects.toThrow('Post não encontrado.');
    });

    test('Não deve atualizar um post inexistente', async () => {
        postService.update.mockRejectedValue(new Error('Post não encontrado.'));
        await expect(postService.update(
            'fakePostId', { title: 'Titulo atualizado', content: 'Conteudo atualizado' }
        ))
            .rejects.toThrow('Post não encontrado.');
    });

    test('Não deve excluir um post inexistente', async () => {
        postService.delete.mockRejectedValue(new Error('Post não encontrado.'));
        await expect(postService.delete('fakePostId'))
            .rejects.toThrow('Post não encontrado.');
    });
});