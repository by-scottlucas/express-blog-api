import PostModel from "../../../src/models/postModel.js";
import PostCreateMock from "../../__mocks__/postCreateMock.js";

jest.mock("../../../src/models/postModel.js");

describe("Post Model", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Deve criar um post válido", async () => {
        const mockSave = jest.fn().mockResolvedValue({
            _id: "mockedPostId",
            ...PostCreateMock,
        });

        PostModel.mockImplementation(() => ({
            save: mockSave,
        }));

        const post = new PostModel(PostCreateMock);
        const savedPost = await post.save();

        expect(savedPost).toHaveProperty("_id");
        expect(savedPost.title).toBe(PostCreateMock.title);
        expect(savedPost.content).toBe(PostCreateMock.content);
    });

    test("Deve falhar ao criar um post sem título", async () => {
        const mockSave = jest.fn().mockRejectedValue(new Error("O título é obrigatório"));

        PostModel.mockImplementation(() => ({
            save: mockSave,
        }));

        const post = new PostModel({
            content: "Conteúdo do post",
        });

        await expect(post.save()).rejects.toThrow("O título é obrigatório");
    });
});
