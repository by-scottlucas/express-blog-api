import express from 'express';
import request from 'supertest';

import PostModel from '../../../src/models/postModel.js';
import UserModel from '../../../src/models/userModel.js';
import routes from '../../../src/routes/routes.js';
import CommentService from '../../../src/services/commentService.js';
import CommentCreateMock from '../../__mocks__/commentCreateMock.js';
import CommentListMock from '../../__mocks__/commentListMock.js';
import TokenMock from '../../__mocks__/tokenMock.js';

jest.mock('../../../src/models/userModel.js');
jest.mock('../../../src/models/postModel.js');
jest.mock('../../../src/services/postService.js');
jest.mock('../../../src/services/commentService.js');

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

describe('CommentController', () => {
    let token = TokenMock;
    let userId = "67bcd1dea2ee4dee4d8c8ddb";
    let postId = "67bcd339a2ee4dee4d8c8dfb";
    let commentId = "67bcf1bc449338919d8db283";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Deve listar os comentários de um post', async () => {
        const mockComments = { CommentListMock };
        CommentService.prototype.list.mockResolvedValue(mockComments);

        const response = await request(app)
            .get(`${baseApiUrl}/comments/${postId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.comments).toEqual(mockComments);
    });
    
    test('Deve criar um comentário com sucesso', async () => {
        UserModel.findById.mockResolvedValue({ _id: userId });
        PostModel.findById.mockResolvedValue({ _id: postId });
        CommentService.prototype.create.mockResolvedValue(CommentCreateMock);

        const response = await request(app)
            .post(`${baseApiUrl}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ userId, postId, content: "Ótimo post!" });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(CommentCreateMock);
    });

    test('Deve retornar erro ao criar um comentário sem todos os campos', async () => {
        const response = await request(app)
            .post(`${baseApiUrl}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ userId, postId: '', content: "Ótimo post!" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Preencha todos os campos.");
    });

    test('Deve excluir um comentário com sucesso', async () => {
        CommentService.prototype.read.mockResolvedValue({ _id: commentId });
        CommentService.prototype.delete.mockResolvedValue();

        const response = await request(app)
            .delete(`${baseApiUrl}/comments/${commentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(204);
    });

    test('Deve retornar erro ao excluir um comentário inexistente', async () => {
        CommentService.prototype.read.mockResolvedValue(null);

        const response = await request(app)
            .delete(`${baseApiUrl}/comments/${commentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Comentário não encontrado");
    });
});