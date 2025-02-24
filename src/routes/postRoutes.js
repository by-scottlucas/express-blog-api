import express from 'express';
import PostController from '../controllers/postController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
const postController = new PostController();

router.get("/", (req, res) => postController.listPosts(req, res));
router.post("/", authMiddleware, (req, res) => postController.createPost(req, res));
router.get("/:id", (req, res) => postController.getPost(req, res));
router.put("/:id", authMiddleware, (req, res) => postController.updatePost(req, res));
router.delete("/:id", authMiddleware, (req, res) => postController.deletePost(req, res));

export default router;