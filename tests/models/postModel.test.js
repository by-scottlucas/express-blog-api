import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import PostModel from '../../src/models/postModel.js';
import UserModel from '../../src/models/userModel.js';
import PostCreateMock from '../__mocks__/postCreateMock.js';
import UserCreateMock from '../__mocks__/userCreateMock.js';

describe("Post Model", () => {
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

    test("Deve criar um post válido", async () => {
        const post = new PostModel(PostCreateMock);
        const savedPost = await post.save();

        expect(savedPost.title).toBe(PostCreateMock.title);
        expect(savedPost.author.toString()).toBe(PostCreateMock.author.toString());
        expect(savedPost.content).toBe(PostCreateMock.content);
        expect(savedPost).toHaveProperty("_id");
    });

    test("Deve falhar ao tentar criar um post sem título", async () => {
        const user = await UserModel.create(UserCreateMock);
        const savedUser = await user.save();

        const post = new PostModel({
            author: savedUser._id,
            content: "Conteúdo do post"
        });

        await expect(post.save()).rejects.toThrowError("O título é obrigatório");
    });

    test('Deve falhar ao tentar criar um post sem author', async () => {
        const post = new PostModel({
            title: "Post válido",
            content: "Conteúdo do post"
        });

        await expect(post.save()).rejects.toThrowError("O author é obrigatório");
    });

    test("Deve falha ao tentar criar um post sem conteúdo", async () => {
        const user = await UserModel.create(UserCreateMock);
        const savedUser = await user.save();

        const post = new PostModel({
            title: "Post válido",
            author: savedUser._id,
        });

        await expect(post.save()).rejects.toThrowError("O conteúdo é obrigatório");
    });
});