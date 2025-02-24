import express from 'express';

import CommentController from '../controllers/commentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
const commentController = new CommentController();

router.get("/:postId", (req, res) => commentController.listComments(req, res));
router.post("/", authMiddleware, (req, res) => commentController.createComment(req, res));
router.delete("/:id", authMiddleware, (req, res) => commentController.deleteComment(req, res));

export default router;