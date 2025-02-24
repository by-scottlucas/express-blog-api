import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [
            true,
            "O título do Post é obrigatório"
        ]
    },
    author: {
        type: String,
    },
    content: {
        type: String,
        required: [
            true,
            "O post não pode ser publicado sem conteúdo"
        ]
    },
});

const PostModel = mongoose.model('Post', postSchema);

export default PostModel;