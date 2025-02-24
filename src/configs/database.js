import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const { MONGO_USER, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DB } = process.env;
const mongoURI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

const connectToDatabase = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("✅ Conexão com o MongoDB realizada com sucesso!");
    } catch (error) {
        console.error("❌ Erro de conexão com o MongoDB:", error);
        process.exit(1);
    }
};

export default connectToDatabase;
