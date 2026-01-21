import mongoose from "mongoose";

const checkInSchema = mongoose.Schema({
    userId: String,
    name: String,
    date: String,
    time: String,
    type: String,
    latitude: String,
    longitude: String,
    late: Number,
    distance: Number,
},
    {
        timestamps: true   // 👈 adds createdAt & updatedAt
    })

export const checkInModel = mongoose.model("CheckIn", checkInSchema);