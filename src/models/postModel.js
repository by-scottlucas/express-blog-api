import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "O título é obrigatório"]
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "O author é obrigatório"]
    },
    content: {
        type: String,
        required: [true, "O conteúdo é obrigatório"]
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true,
});

const PostModel = mongoose.model('Post', postSchema);

export default PostModel;
