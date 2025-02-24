import PostModel from '../models/postModel.js';
import UserModel from '../models/userModel.js';

class PostService {
    async list() {
        try {
            const posts = await PostModel.find().populate('author', 'name email');
            return posts;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async create(data) {
        try {
            const { title, content, author } = data;
            const user = await UserModel.findById(author);

            if (!user) {
                throw new Error("Usuário não encontrado.");
            }

            const newPost = new PostModel({
                title,
                content,
                author,
            });

            return await newPost.save();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async read(id) {
        try {
            const post = await PostModel.findById(id).populate('author', 'name email');

            if (!post) {
                throw new Error("Post não encontrado.");
            }

            return post;
        } catch (error) {
            throw new Error("Erro ao buscar o post: " + error.message);
        }
    }

    async update(id, data) {
        try {
            const updatedPost = await PostModel.findByIdAndUpdate(
                id, data, { new: true }
            ).populate('author', 'name email');

            if (!updatedPost) {
                throw new Error("Post não encontrado, impossível atualizar.");
            }

            return updatedPost;
        } catch (error) {
            throw new Error("Erro ao atualizar o post: " + error.message);
        }
    }

    async delete(id) {
        try {
            await this.read(id);
            const result = await PostModel.deleteOne({ _id: id });
            if (result.deletedCount === 0) {
                throw new Error("Falha ao excluir o post. Tente novamente mais tarde.");
            }
            return;
        } catch (error) {
            throw new Error("Erro ao excluir o post: " + error.message);
        }
    }
}

export default PostService;
