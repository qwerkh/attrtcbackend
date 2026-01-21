import {employeeModel} from "../model/employee_model.js";
import {userModel} from "../model/user_model.js";

export const employeeController = async (req, res) => {
    const {name, email, password} = req.body;
    if (!name || !email) {
        return res.status(400).json({error: "Please enter valid email"});
    } else {
        const emp = new employeeModel({
            name: name,
            email: email,
            password: password,
        });
        const id = await emp.save();

        return res.status(200).json({
            code: "201",
            message: id
        })
    }

}
export const employeeListController = async (req, res) => {
    try {
        let {search, page, limit} = req.body;
        page = parseInt(page) || 1
        limit = parseInt(limit) || 10
        const skip = (page - 1) * limit
        const filter = search
            ? {
                $or: [
                    {name: {$regex: search, $options: 'i'}},
                    {email: {$regex: search, $options: 'i'}}
                ]
            }
            : {};
        const [users, total] = await Promise.all([
            userModel.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({createdAt: -1}),

            userModel.find(filter).countDocuments()
        ])

        res.status(200).json({
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

export const employeeApproveController = async (req, res) => {
    try {
        let {userId} = req.body;
        const result = await userModel.updateOne({_id: userId}, {status: true});

        res.status(200).json({
            data: result,
        })

    } catch (err) {
        res.status(500).json({message: err.message})
    }
}