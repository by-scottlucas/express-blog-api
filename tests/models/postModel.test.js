import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import PostModel from '../../src/models/postModel.js';
import UserModel from '../../src/models/userModel.js';

jest.mock('../../src/models/userModel.js', () => require('../__mocks__/userCreateMock.js'));

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

describe("Post Model", () => {
    test("Deve criar um post válido", async () => {
        const user = await UserModel.save();

        const post = new PostModel({
            title: "Post válido",
            author: user._id,
            content: "Conteúdo do post"
        });

        const savedPost = await post.save();

        expect(savedPost.title).toBe("Post válido");
        expect(savedPost.author.toString()).toBe(user._id.toString());
        expect(savedPost.content).toBe("Conteúdo do post");
        expect(savedPost).toHaveProperty("_id");
    });

    test("Deve falhar ao tentar criar um post sem título", async () => {
        const user = await UserModel.save();

        const post = new PostModel({
            author: user._id,
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
        const user = await UserModel.save();

        const post = new PostModel({
            title: "Post válido",
            author: user._id,
        });

        await expect(post.save()).rejects.toThrowError("O conteúdo é obrigatório");
    });

});