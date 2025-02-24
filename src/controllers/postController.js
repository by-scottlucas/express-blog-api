import UserModel from '../models/userModel.js';
import PostService from '../services/postService.js';

class PostController {
    constructor() {
        this.postService = new PostService();
    }

    async listPosts(req, res) {
        try {
            const posts = await this.postService.list();
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }

    async createPost(req, res) {
        try {
            const { title, content, userId } = req.body;

            if (!title || !content || !userId) {
                return res.status(400).json({
                    message: "Preencha todos os campos."
                });
            }

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    message: "Usuário não encontrado."
                });
            }

            const newPost = await this.postService.create({ title, content, author: userId });
            res.status(201).json(newPost);
        } catch (error) {
            res.status(400).json({
                message: error.message
            });
        }
    }

    async getPost(req, res) {
        try {
            const post = await this.postService.read(req.params.id);

            if (!post) {
                return res.status(404).json({
                    message: "Post não encontrado"
                });
            }

            res.status(200).json(post);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }

    async updatePost(req, res) {
        try {
            const post = await this.postService.read(req.params.id);

            if (!post) {
                return res.status(404).json({
                    message: "Post não encontrado"
                });
            }

            const updatedFields = {};

            if (req.body.title) updatedFields.title = req.body.title;
            if (req.body.content) updatedFields.content = req.body.content;

            const updatedPost = await this.postService.update(req.params.id, updatedFields);

            res.status(201).json(updatedPost);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }

    async deletePost(req, res) {
        try {
            const post = await this.postService.read(req.params.id);

            if (!post) {
                return res.status(404).json({
                    message: "Post não encontrado"
                });
            }

            await this.postService.delete(req.params.id);
            res.status(204).json({ message: "Post excluído com sucesso!" });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
}

export default PostController;
