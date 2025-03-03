import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'O autor é obrigatório']
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'O post é obrigatório']
    },
    content: {
        type: String,
        required: [true, "O comentário não pode ser publicado sem conteúdo"]
    },
}, {
    timestamps: true,
});

const CommentModel = mongoose.model('Comment', commentSchema);

export default CommentModel;
