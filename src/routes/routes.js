import express from 'express';

import PostController from '../controllers/postController.js';
import UserController from '../controllers/userController.js';

const router = express.Router();
const baseApiUrl = "/api/v1"
const postController = new PostController();
const userController = new UserController();

router.get("/posts", (req, res) => postController.listPosts(req, res));
router.post("/posts", (req, res) => postController.createPost(req, res));
router.get("/posts/:id", (req, res) => postController.getPost(req, res));
router.put("/posts/:id", (req, res) => postController.updatePost(req, res));
router.delete("/posts/:id", (req, res) => postController.deletePost(req, res));

router.get("/users", (req, res) => userController.listUsers(req, res));
router.post("/users", (req, res) => userController.createUser(req, res));
router.get("/users/:id", (req, res) => userController.getUser(req, res));
router.put("/users/:id", (req, res) => userController.updateUser(req, res));
router.delete("/users/:id", (req, res) => userController.deleteUser(req, res));


export default (app) => {
    app.use(baseApiUrl, router);
}