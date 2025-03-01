import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import PostService from '../../../src/services/postService.js';
import UserService from '../../../src/services/userService.js';
import PostCreateMock from '../../__mocks__/postCreateMock.js';
import UserCreateMock from '../../__mocks__/userCreateMock.js';

describe('PostService', () => {
    let mongoServer;
    let postService;
    let userService;

    const createUser = async () => {
        const response = await userService.create(UserCreateMock);
        return response.user;
    };

    const createPost = async (userId, override = {}) => {
        return await postService.create({
            ...PostCreateMock,
            author: userId,
            ...override
        });
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        userService = new UserService();
        postService = new PostService();
    });

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test('Deve validar a instância dos serviços', () => {
        expect(postService).toBeDefined();
        expect(userService).toBeDefined();
    });

    test('Deve listar os posts do sistema', async () => {
        const user = await createUser();
        await createPost(user._id);
    
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
        const user = await createUser();
        const post = await createPost(user._id);
    
        expect(post).toHaveProperty('_id');
        expect(post).toHaveProperty('title', PostCreateMock.title);
        expect(post).toHaveProperty('content', PostCreateMock.content);
        expect(post).toHaveProperty('author', user._id);
        expect(post).toHaveProperty('createdAt');
        expect(post).toHaveProperty('updatedAt');
    });

    test('Deve obter um post cadastrado no sistema', async () => {
        const user = await createUser();
        const post = await createPost(user._id);

        const foundPost = await postService.read(post._id);

        expect(foundPost).toHaveProperty('_id', post._id);
    });

    test('Deve atualizar um post', async () => {
        const user = await createUser();
        const post = await createPost(user._id);

        const updatedData = { title: 'Title Updated', content: 'new post content' };
        const updatedPost = await postService.update(post._id, updatedData);

        expect(updatedPost).toMatchObject({
            _id: post._id,
            title: updatedData.title,
            content: updatedData.content,
        });
    });

    test('Deve excluir um post', async () => {
        const user = await createUser();
        const post = await createPost(user._id);

        await postService.delete(post._id);
        
        await expect(postService.read(post._id)).rejects.toThrow('Post não encontrado.');
    });

    test('Não deve criar um post sem título', async () => {
        const user = await createUser();
        
        await expect(createPost(user._id, { title: '' }))
            .rejects.toThrow('O título é obrigatório.');
    });

    test('Não deve criar um post sem conteúdo', async () => {
        const user = await createUser();
        
        await expect(createPost(user._id, { content: '' }))
            .rejects.toThrow('O conteúdo é obrigatório.');
    });

    test('Não deve criar um post com um autor inexistente', async () => {
        const invalidUserId = new mongoose.Types.ObjectId();
        
        await expect(createPost(invalidUserId))
            .rejects.toThrow('Usuário não encontrado.');
    });

    test('Não deve encontrar um post que não existe', async () => {
        const fakePostId = new mongoose.Types.ObjectId();

        await expect(postService.read(fakePostId))
            .rejects.toThrow('Post não encontrado.');
    });

    test('Não deve atualizar um post inexistente', async () => {
        const fakePostId = new mongoose.Types.ObjectId();
        const updatedData = { title: 'Updated Title', content: 'Updated Content' };

        await expect(postService.update(fakePostId, updatedData))
            .rejects.toThrow('Post não encontrado.');
    });

    test('Não deve excluir um post inexistente', async () => {
        const fakePostId = new mongoose.Types.ObjectId();

        await expect(postService.delete(fakePostId))
            .rejects.toThrow('Post não encontrado.');
    });
});
