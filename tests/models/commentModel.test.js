import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import CommentModel from '../../src/models/commentModel.js';
import PostModel from '../../src/models/postModel.js';
import UserModel from '../../src/models/userModel.js';

jest.mock('../../src/models/userModel.js', () => require('../__mocks__/userCreateMock.js'));
jest.mock('../../src/models/postModel.js', () => require('../__mocks__/postCreateMock.js'));

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

describe("Comment Model", () => {
    test("Deve criar um comentário válido", async () => {
        const user = await UserModel.save();
        const post = await PostModel.save();

        const comment = new CommentModel({
            author: user._id,
            post: post._id,
            content: "Conteúdo do comentário"
        });

        const savedComment = await comment.save();

        expect(savedComment.author.toString()).toBe(user._id.toString());
        expect(savedComment.post.toString()).toBe(post._id.toString());
        expect(savedComment.content).toBe("Conteúdo do comentário");
        expect(savedComment).toHaveProperty("_id");
    });

    test("Deve falhar ao tentar criar um comentário sem conteúdo", async () => {
        const user = await UserModel.save();
        const post = await PostModel.save();

        const comment = new CommentModel({
            author: user._id,
            post: post._id,
        });

        await expect(comment.save()).rejects.toThrowError(
            "O comentário não pode ser publicado sem conteúdo"
        );
    });

    test("Deve falhar ao tentar criar um comentário sem autor", async () => {
        const post = await PostModel.save();

        const comment = new CommentModel({
            post: post._id,
            content: "Comentário sem autor"
        });

        await expect(comment.save()).rejects.toThrowError("O author é obrigatório");
    });

    test("Deve falhar ao tentar criar um comentário sem post associado", async () => {
        const user = await UserModel.save();

        const comment = new CommentModel({
            author: user._id,
            content: "Comentário sem post"
        });

        await expect(comment.save()).rejects.toThrowError("O post é obrigatório");
    });
});
