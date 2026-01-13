import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,   // 👈 unique column
        required: true,
        trim: true,
    },
    name: String,
    password: String,
    refreshToken: String
});
userSchema.index({email: 1}, {unique: true});
export const userModel = mongoose.model("User", userSchema);