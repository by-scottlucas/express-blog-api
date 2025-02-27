import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import CommentService from '../../src/services/commentService.js';
import PostService from '../../src/services/postService.js';
import UserService from '../../src/services/userService.js';
import PostCreateMock from '../__mocks__/postCreateMock.js';
import UserCreateMock from '../__mocks__/userCreateMock.js';

describe('CommentService', () => {
    let mongoServer;
    let postService;
    let userService;
    let commentService;

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
        commentService = new CommentService();
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
        expect(commentService).toBeDefined();
    });

    test('Deve criar um comentário e vinculá-lo a um post', async () => {
        const user = await createUser();
        const post = await createPost(user._id);

        const commentData = {
            content: 'Este é um comentário de teste',
            author: user._id,
            post: post._id
        };

        const comment = await commentService.create(commentData);

        expect(comment).toBeDefined();
        expect(comment.content).toBe(commentData.content);
        expect(comment.author.toString()).toBe(user._id.toString());
        expect(comment.post.toString()).toBe(post._id.toString());
    });

    test('Deve listar os comentários de um post', async () => {
        const user = await createUser();
        const post = await createPost(user._id);

        const commentData1 = { content: 'Comentário 1', author: user._id, post: post._id };
        const commentData2 = { content: 'Comentário 2', author: user._id, post: post._id };

        await commentService.create(commentData1);
        await commentService.create(commentData2);

        const comments = await commentService.list(post._id);

        expect(comments).toBeDefined();
        expect(comments.length).toBe(2);
        expect(comments[0].content).toBe(commentData1.content);
        expect(comments[1].content).toBe(commentData2.content);
    });

    test('Deve obter um comentário pelo ID', async () => {
        const user = await createUser();
        const post = await createPost(user._id);

        const commentData = {
            content: 'Comentário de leitura',
            author: user._id,
            post: post._id
        };

        const createdComment = await commentService.create(commentData);
        const fetchedComment = await commentService.read(createdComment._id);

        expect(fetchedComment).toBeDefined();
        expect(fetchedComment.content).toBe(commentData.content);
        expect(fetchedComment.author._id.toString()).toBe(user._id.toString());
        expect(fetchedComment.post._id.toString()).toBe(post._id.toString());
    });

    test('Deve excluir um comentário e remover a referência no post', async () => {
        const user = await createUser();
        const post = await createPost(user._id);

        const commentData = {
            content: 'Comentário a ser excluído',
            author: user._id,
            post: post._id
        };

        const comment = await commentService.create(commentData);
        await commentService.delete(comment._id);

        const deletedComment = await commentService.read(comment._id);
        const updatedPost = await postService.read(post._id);

        expect(deletedComment).toBeNull();
        expect(updatedPost.comments).not.toContain(comment._id);
    });

    test('Não deve permitir criar um comentário sem conteúdo', async () => {
        const user = await createUser();
        const post = await createPost(user._id);

        const commentData = {
            content: '',
            author: user._id,
            post: post._id
        };

        await expect(commentService.create(commentData)).rejects.toThrow();
    });

    test('Não deve permitir criar um comentário sem um autor válido', async () => {
        const user = await createUser();
        const post = await createPost(user._id);

        const commentData = {
            content: 'Comentário sem autor',
            author: 1,
            post: post._id
        };

        await expect(commentService.create(commentData)).rejects.toThrow();
    });

    test('Não deve permitir criar um comentário sem um post válido', async () => {
        const user = await createUser();

        const commentData = {
            content: 'Comentário sem post',
            author: user._id,
            post: 1
        };

        await expect(commentService.create(commentData)).rejects.toThrow();
    });

    test('Deve retornar null ao tentar obter um comentário inexistente', async () => {
        const nonexistentId = new mongoose.Types.ObjectId();
        const fetchedComment = await commentService.read(nonexistentId);
        expect(fetchedComment).toBeNull();
    });

    test('Deve retornar null ao tentar excluir um comentário inexistente', async () => {
        const nonexistentId = new mongoose.Types.ObjectId();
        const result = await commentService.delete(nonexistentId);
        expect(result).toBeNull();
    });
});