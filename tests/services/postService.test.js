import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import UserService from '../../src/services/userService.js';
import PostService from '../../src/services/postService.js';
import PostCreateMock from '../__mocks__/postCreateMock.js';
import UserCreateMock from '../__mocks__/userCreateMock.js';

describe('PostService', () => {
    let mongoServer;
    let postService;
    let userService;

    const createUser = async () => {
        const response = await userService.create(UserCreateMock);
        return response.user;
    };

    const createPost = async (userId) => {
        return await postService.create({
            ...PostCreateMock,
            author: userId
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
        const post = await createPost(user._id);
    
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
});
