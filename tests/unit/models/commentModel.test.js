import CommentModel from "../../../src/models/commentModel.js";
import CommentCreateMock from "../../__mocks__/commentCreateMock.js";

jest.mock("../../../src/models/commentModel.js");

describe("Comment Model", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Deve criar um comentário válido", async () => {
        const mockSave = jest.fn().mockResolvedValue({
            _id: "mockedCommentId",
            ...CommentCreateMock,
        });

        CommentModel.mockImplementation(() => ({
            save: mockSave,
        }));

        const comment = new CommentModel(CommentCreateMock);
        const savedComment = await comment.save();

        expect(savedComment).toHaveProperty("_id");
        expect(savedComment.content).toBe(CommentCreateMock.content);
    });

    test("Deve falhar ao criar um comentário sem conteúdo", async () => {
        const mockSave = jest.fn().mockRejectedValue(new Error("O comentário não pode ser publicado sem conteúdo"));

        CommentModel.mockImplementation(() => ({
            save: mockSave,
        }));

        const comment = new CommentModel({
            author: CommentCreateMock.author,
            post: CommentCreateMock.post,
        });

        await expect(comment.save()).rejects.toThrow("O comentário não pode ser publicado sem conteúdo");
    });
});
