import express from 'express';

import connectToDatabase from './src/configs/database.js';
import router from './src/routes/routes.js';

const app = express();
const port = 3000;

app.use(express.json());
router(app);

connectToDatabase();

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
})