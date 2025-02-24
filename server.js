import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';

import connectToDatabase from './src/configs/database.js';
import router from './src/routes/routes.js';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

router(app);

connectToDatabase();

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
