import express from 'express';

import authRoutes from './authRoutes.js';
import postRoutes from './postRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();
const baseApiUrl = "/api/v1";

router.use(`${baseApiUrl}/posts`, postRoutes);
router.use(`${baseApiUrl}/users`, userRoutes);
router.use(`${baseApiUrl}/auth`, authRoutes);

export default (app) => {
    app.use(router);
};
