import mongoose from "mongoose";

const employeeSchema = mongoose.Schema({
        name: String,
        email: String,
    },
    {
        timestamps: true   // 👈 adds createdAt & updatedAt
    })

export const employeeModel = mongoose.model("Employee", employeeSchema);