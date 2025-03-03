import CommentService from '../../../src/services/commentService.js';
import PostService from '../../../src/services/postService.js';
import UserService from '../../../src/services/userService.js';
import CommentCreateMock from '../../__mocks__/commentCreateMock.js';
import PostCreateMock from '../../__mocks__/postCreateMock.js';
import UserCreateMock from '../../__mocks__/userCreateMock.js';

jest.mock('../../../src/services/userService.js');
jest.mock('../../../src/services/postService.js');
jest.mock('../../../src/services/commentService.js');

describe('CommentService', () => {
    let postService;
    let userService;
    let commentService;
    let mockUser;
    let mockPost;
    let mockComment;
    let commentDeleted = false;
    let userId = "67bcd1dea2ee4dee4d8c8ddb";
    let postId = "67bcd339a2ee4dee4d8c8dfb";
    let commentId = "67bcf1bc449338919d8db283";

    beforeEach(() => {
        userService = new UserService();
        postService = new PostService();
        commentService = new CommentService();
        UserService.mockClear();
        PostService.mockClear();
        CommentService.mockClear();
        commentDeleted = false;

        mockUser = { _id: userId, ...UserCreateMock };
        mockPost = { _id: postId, author: userId, comments: [], ...PostCreateMock };
        mockComment = { _id: commentId, author: mockUser, post: mockPost, ...CommentCreateMock };

        userService.create.mockResolvedValue({ user: mockUser });
        userService.read.mockResolvedValue(mockUser);

        postService.create.mockResolvedValue(mockPost);
        postService.read.mockImplementation((id) => {
            if (id === postId) return Promise.resolve(mockPost);
            return Promise.reject(new Error('Post não encontrado.'));
        });
        postService.update.mockImplementation(async (postId, updatedPostData) => {
            if (postId === postId) {
                mockPost.comments = updatedPostData.comments;
                return mockPost;
            }
            return Promise.reject(new Error('Post não encontrado.'));
        });

        commentService.create.mockResolvedValue(mockComment);
        commentService.list.mockResolvedValue([
            { ...mockComment, content: 'Comentário 1' },
            { ...mockComment, content: 'Comentário 2', _id: '67bcf1bc449338919d8db284' },
        ]);
        commentService.read.mockImplementation((id) => {
            if (id === commentId) {
                if (commentDeleted) {
                    return Promise.resolve(null);
                }
                return Promise.resolve({
                    ...mockComment,
                    content: 'Comentário de leitura'
                });
            }
            return Promise.resolve(null);
        });

        commentService.delete.mockImplementation(async (commentId) => {
            mockPost.comments = mockPost.comments.filter(comment => comment._id !== commentId);
            commentDeleted = true;
            return null;
        });
    });

    test('Deve criar um comentário e vinculá-lo a um post', async () => {
        const commentData = { id: commentId, ...CommentCreateMock };
        const comment = await commentService.create(commentData);

        expect(comment).toBeDefined();
        expect(comment.content).toBe(commentData.content);
        expect(comment.author).toBe(mockUser._id);
        expect(comment.post).toBe(mockPost._id);
    });

    test('Deve listar os comentários de um post', async () => {
        const comments = await commentService.list(postId);

        expect(comments).toBeDefined();
        expect(comments.length).toBe(2);
        expect(comments[0].content).toBe('Comentário 1');
        expect(comments[1].content).toBe('Comentário 2');
    });

    test('Deve obter um comentário pelo ID', async () => {
        const fetchedComment = await commentService.read(commentId);

        expect(fetchedComment).toBeDefined();
        expect(fetchedComment.content).toBe('Comentário de leitura');
        expect(fetchedComment.author).toBe(mockUser._id);
        expect(fetchedComment.post).toBe(mockPost._id);
    });

    test('Deve excluir um comentário e remover a referência no post', async () => {
        await commentService.delete(commentId);

        const deletedComment = await commentService.read(commentId);
        const updatedPost = await postService.read(postId);

        expect(deletedComment).toBeNull();

        expect(updatedPost.comments).not.toContainEqual(mockComment);
    });

    test('Não deve permitir criar um comentário sem conteúdo', async () => {
        commentService.create.mockRejectedValue(new Error('Conteúdo é obrigatório'));
        await expect(commentService.create({ content: '', author: userId, post: postId }))
            .rejects.toThrow();
    });

    test('Não deve permitir criar um comentário sem um autor válido', async () => {
        commentService.create.mockRejectedValue(new Error('Autor inválido'));
        await expect(
            commentService.create({ content: 'Comentário sem autor', author: 1, post: postId })).rejects.toThrow();
        
    });
    test('Não deve permitir criar um comentário sem um post válido', async () => {
        commentService.create.mockRejectedValue(new Error('Post inválido'));
        await expect(commentService.create({ content: 'Comentário sem post', author: userId, post: 1 })).rejects.toThrow();
    });

    test('Deve retornar null ao tentar obter um comentário inexistente', async () => {
        const fetchedComment = await commentService.read('nonexistentId');
        expect(fetchedComment).toBeNull();
    });

    test('Deve retornar null ao tentar excluir um comentário inexistente', async () => {
        const result = await commentService.delete('nonexistentId');
        expect(result).toBeNull();
    });
});
