import PostModel from '../models/postModel.js';
import UserModel from '../models/userModel.js';
import CommentService from '../services/commentService.js';


class CommentController {
    constructor() {
        this.commentService = new CommentService();
    }

    async listComments(req, res) {
        try {
            const { postId } = req.params;

            if (!postId) {
                return res.status(400).json({ message: "O ID do post é obrigatório." });
            }

            const comments = await this.commentService.list(postId);
            res.status(200).json({ comments });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createComment(req, res) {
        try {
            const { userId, postId, content } = req.body;
            if (!userId || !postId || !content) {
                return res.status(400).json({ message: "Preencha todos os campos." });
            }

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }

            const post = await PostModel.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post não encontrado." });
            }

            const newComment = await this.commentService.create({
                author: userId, post: postId, content
            });
            res.status(201).json(newComment);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteComment(req, res) {
        try {
            const comment = await this.commentService.read(req.params.id);

            if (!comment) {
                return res.status(404).json({ message: "Comentário não encontrado" });
            }

            await this.commentService.delete(req.params.id);
            res.status(204).json({ message: "Comentário excluído com sucesso!" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default CommentController;