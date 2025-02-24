import PostModel from "../models/postModel.js"

class PostService {
    async list() {
        try {
            const posts = await PostModel.find();
            return posts;
        } catch (error) {
            throw new Error("Erro ao buscar os posts. " + error.message);
        }
    }

    async create(data) {
        try {
            const newPost = new PostModel(data);
            return await newPost.save();
        } catch (error) {
            throw new Error("Erro ao publicar novo post. " + error.message);
        }
    }

    async read(id) {
        try {
            const post = await PostModel.findById(id);
            if (!post) throw new Error("Post não encontrado.");
            return post;
        } catch (error) {
            throw new Error("Erro ao buscar o post. " + error.message);
        }
    }

    async update(id, data) {
        try {
            const updatedPost = await PostModel.findByIdAndUpdate(id, data, { new: true });
            if (!updatedPost) throw new Error("Post não encontrado, impossível atualizar.");
            return updatedPost;
        } catch (error) {
            throw new Error("Erro ao atualizar o post. " + error.message);
        }
    }

    async delete(id) {
        try {
            await this.read(id);
            const result = await PostModel.deleteOne({ _id: id });
            if (result.deletedCount === 0) {
                throw new Error("Falha ao exluir o post. Tente novamente mais tarde.");
            }
            return;
        } catch (error) {
            throw new Error("Erro ao exluir o post. " + error.message);
        }
    }
}

export default PostService;