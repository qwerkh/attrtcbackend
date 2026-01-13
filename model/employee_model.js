import mongoose from "mongoose";

const employeeSchema = mongoose.Schema({
    name: String,
    email: String,
})

export const employeeModel = mongoose.model("Employee", employeeSchema);