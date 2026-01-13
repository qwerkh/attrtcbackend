import mongoose from "mongoose";

const checkInSchema = mongoose.Schema({
    userId: String,
    name: String,
    date: String,
    time: String,
    type: String,
})

export const checkInModel = mongoose.model("CheckIn", checkInSchema);