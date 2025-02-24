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
                message: "Erro ao buscar os posts.",
                error: error.message
            })
        }
    }

    async createPost(req, res) {
        try {
            const { title, author, content } = req.body;

            if (!title || !author, !content) {
                return res.status(400).json({
                    message: "Preencha todos os campos."
                })
            }

            const newPost = await this.postService.create(req.body);
            res.status(201).json(newPost);
        } catch (error) {
            res.status(400).json({
                message: "Erro ao criar o post.",
                error: error.message
            })
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
                message: "Erro ao buscar o post.",
                error: error.message
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

            const updatedFiles = {};

            if (req.body.title) updatedFiles.title = req.body.title;
            if (req.body.author) updatedFiles.author = req.body.author;
            if (req.body.content) updatedFiles.content = req.body.content;

            const updatedPost = await this.postService.update(
                req.params.id, updatedFiles
            );

            res.status(201).json(updatedPost);
        } catch (error) {
            res.status(500).json({
                message: "Erro ao atualizar post",
                error: error.message
            })
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
                message: "Erro ao excluir post",
                error: error.message
            })
        }
    }

}

export default PostController;