import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import CommentModel from '../../src/models/commentModel.js';
import CommentCreateMock from '../__mocks__/commentCreateMock.js';

describe("Comment Model", () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test("Deve criar um comentário válido", async () => {
        const comment = new CommentModel(CommentCreateMock);
        const savedComment = await comment.save();

        expect(savedComment.author.toString()).toBe(CommentCreateMock.author.toString());
        expect(savedComment.post.toString()).toBe(CommentCreateMock.post.toString());
        expect(savedComment.content).toBe(CommentCreateMock.content);
        expect(savedComment).toHaveProperty("_id");
    });

    test("Deve falhar ao tentar criar um comentário sem conteúdo", async () => {
        const comment = new CommentModel({
            author: CommentCreateMock.user,
            post: CommentCreateMock.post,
        });

        await expect(comment.save()).rejects.toThrowError(
            "O comentário não pode ser publicado sem conteúdo"
        );
    });

    test("Deve falhar ao tentar criar um comentário sem autor", async () => {
        const comment = new CommentModel({
            post: CommentCreateMock.post,
            content: "Comentário sem autor"
        });

        await expect(comment.save()).rejects.toThrowError(
            "O author é obrigatório"
        );
    });

    test("Deve falhar ao tentar criar um comentário sem post associado", async () => {
        const comment = new CommentModel({
            author: CommentCreateMock.user,
            content: "Comentário sem post"
        });

        await expect(comment.save()).rejects.toThrowError(
            "O post é obrigatório"
        );
    });
});
