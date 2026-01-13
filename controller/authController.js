import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {userModel} from "../model/user_model.js";
import crypto from "crypto";

import {generateRefreshToken, generateAccessToken} from "../config/token.js";

export const loginUser = async (req, res) => {
    const user = await userModel.findOne({email: req.body.email});
    console.log(user);
    if (!user) return res.status(400).json({error: "Invalid credentials"});

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(400).json({error: "Invalid credentials"});

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // save refresh token (hashed recommended)
    user.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await user.save();
    res.json({token, id: user._id, name: user.name, email: user.email, refreshToken: refreshToken});
};

export const registerUser = async (req, res) => {
    const {email, password, name} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = await userModel.create({
        email,
        name,
        password: hashedPassword
    });

    res.json({message: "User registered", data});
}

export const refreshToken = async (req, res) => {
    const {token} = req.body;
    if (!token) return res.sendStatus(401);
    // Hash incoming token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel.findOne({refreshToken: hashedToken});
    if (!user) return res.sendStatus(403);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);
        const newAccessToken = generateAccessToken(user._id);
        res.json({accessToken: newAccessToken, refreshToken: token});
    });
};