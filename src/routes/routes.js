import express from 'express';

import authRoutes from './authRoutes.js';
import commentRoutes from './commentRoutes.js';
import postRoutes from './postRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();
const baseApiUrl = "/api/v1";

router.use(`${baseApiUrl}/posts`, postRoutes);
router.use(`${baseApiUrl}/users`, userRoutes);
router.use(`${baseApiUrl}/auth`, authRoutes);
router.use(`${baseApiUrl}/comments`, commentRoutes);

export default (app) => {
    app.use(router);
};
