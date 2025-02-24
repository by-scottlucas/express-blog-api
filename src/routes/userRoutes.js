import express from 'express';
import UserController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
const userController = new UserController();

router.get("/", authMiddleware, (req, res) => userController.listUsers(req, res));
router.post("/", (req, res) => userController.createUser(req, res));
router.get("/:id", authMiddleware, (req, res) => userController.getUser(req, res));
router.put("/:id", authMiddleware, (req, res) => userController.updateUser(req, res));
router.delete("/:id", authMiddleware, (req, res) => userController.deleteUser(req, res));

export default router;