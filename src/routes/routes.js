import express from 'express';

import PostController from '../controllers/postController.js';

const router = express.Router();
const baseApiUrl = "/api/v1"
const postController = new PostController();

router.get("/posts", (req, res) => postController.listPosts(req, res));
router.post("/posts", (req, res) => postController.createPost(req, res));
router.get("/posts/:id", (req, res) => postController.getPost(req, res));
router.put("/posts/:id", (req, res) => postController.updatePost(req, res));
router.delete("/posts/:id", (req, res) => postController.deletePost(req, res));


export default (app) => {
    app.use(baseApiUrl, router);
}