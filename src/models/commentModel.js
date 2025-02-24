import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
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
