import CommentModel from '../models/commentModel.js';
import PostModel from '../models/postModel.js';

class CommentService {
    async list(postId) {
        try {
            return await CommentModel.find({ post: postId })
                .populate('author', 'name email')
                .populate('post', 'title');
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async create(data) {
        try {
            const comment = await CommentModel.create(data);

            await PostModel.findByIdAndUpdate(data.post, {
                $push: { comments: comment._id }
            });

            return comment;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async read(id) {
        try {
            return await CommentModel.findById(id)
                .populate('author', 'name email')
                .populate('post', 'title');
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async delete(id) {
        try {
            const comment = await CommentModel.findByIdAndDelete(id);

            if (comment) {
                await PostModel.findByIdAndUpdate(comment.post, {
                    $pull: { comments: comment._id }
                });
            }

            return comment;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default CommentService;
