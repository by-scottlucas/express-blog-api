import express from 'express';
import request from 'supertest';

import UserModel from '../../../src/models/userModel.js';
import routes from '../../../src/routes/routes.js';
import PostService from '../../../src/services/postService.js';
import PostCreateMock from '../../__mocks__/postCreateMock.js';
import PostListMock from '../../__mocks__/postListMock.js';
import TokenMock from '../../__mocks__/tokenMock.js';

jest.mock('../../../src/models/userModel.js');
jest.mock('../../../src/services/postService.js');

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

describe('PostController', () => {
    let postId = "67bcd339a2ee4dee4d8c8dfb";
    let token = TokenMock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Deve listar os posts', async () => {
        const mockPosts = [PostListMock];
        PostService.prototype.list.mockResolvedValue(mockPosts);

        const response = await request(app)
            .get(`${baseApiUrl}/posts/`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPosts);
    });

    test('Deve criar um novo post', async () => {
        const newPost = PostCreateMock;
        PostService.prototype.create.mockResolvedValue(newPost);
        UserModel.findById.mockResolvedValue(PostCreateMock);

        const response = await request(app)
            .post(`${baseApiUrl}/posts/`)
            .set('Authorization', `Bearer ${token}`)
            .send(PostCreateMock);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(newPost);

        expect(PostService.prototype.create).toHaveBeenCalledWith({
            title: PostCreateMock.title,
            content: PostCreateMock.content,
            author: PostCreateMock.author,
        });
    });

    test('Deve buscar um post pelo ID', async () => {
        const mockPosts = PostCreateMock;
        PostService.prototype.read.mockResolvedValue(mockPosts);

        const response = await request(app)
            .get(`${baseApiUrl}/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPosts);
    });

    test('Deve atualizar um post', async () => {
        const updatePost = { title: 'New title', content: 'Updated content' };
        PostService.prototype.update.mockResolvedValue({ _id: postId, ...updatePost });

        const response = await request(app)
            .put(`${baseApiUrl}/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatePost);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ _id: postId, ...updatePost });
        expect(PostService.prototype.update).toHaveBeenCalledWith(postId, updatePost);
    });

    test('Deve excluir um post', async () => {
        PostService.prototype.delete.mockResolvedValue();

        const response = await request(app)
            .delete(`${baseApiUrl}/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
        expect(PostService.prototype.delete).toHaveBeenCalledWith(postId);
    });

    test('Não deve criar um post sem título', async () => {
        const invalidPost = { ...PostCreateMock, title: '' };
        PostService.prototype.create.mockRejectedValue(new Error('O título é obrigatório.'));

        const response = await request(app)
            .post(`${baseApiUrl}/posts/`)
            .set('Authorization', `Bearer ${token}`)
            .send(invalidPost);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('O título é obrigatório.');
    });

    test('Não deve criar um post sem conteúdo', async () => {
        const invalidPost = { ...PostCreateMock, content: '' };
        PostService.prototype.create.mockRejectedValue(new Error('O conteúdo é obrigatório.'));

        const response = await request(app)
            .post(`${baseApiUrl}/posts/`)
            .set('Authorization', `Bearer ${token}`)
            .send(invalidPost);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('O conteúdo é obrigatório.');
    });

    test('Não deve atualizar um post inexistente', async () => {
        const updatePost = { title: 'Updated Title', content: 'Updated Content' };
        PostService.prototype.update.mockRejectedValue(new Error('Post não encontrado.'));

        const response = await request(app)
            .put(`${baseApiUrl}/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatePost);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Post não encontrado.');
    });

    test('Não deve excluir um post inexistente', async () => {
        PostService.prototype.delete.mockRejectedValue(new Error('Post não encontrado.'));

        const response = await request(app)
            .delete(`${baseApiUrl}/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Post não encontrado.');
    });
});
