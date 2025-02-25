import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "O nome é obrigatório"]
    },
    email: {
        type: String,
        required: [true, "O e-mail é obrigatório"],
        match: [/\S+@\S+\.\S+/, 'E-mail inválido']
    },
    password: {
        type: String,
        required: [true, "A senha é obrigatória"]
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
