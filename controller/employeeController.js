import {employeeModel} from "../model/employee_model.js";

export const employeeController =async (req, res) => {
    const {name, email, password} = req.body;
    if (!name || !email) {
        return res.status(400).json({error: "Please enter valid email"});
    } else {
        const emp = new employeeModel({
            name: name,
            email: email,
            password: password,
        });
        const id =await emp.save();

        return res.status(200).json({
            code: "201",
            message: id
        })
    }

}