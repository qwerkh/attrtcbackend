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
        if (decoded.id !== user._id.toString()) {
            return res.sendStatus(403);
        }
        if (err) return res.sendStatus(403);
        // 🔄 Rotate refresh token
        const newRefreshToken = jwt.sign(
            {userId: user._id},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: "7d"}
        );

        const newHashedToken = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        user.refreshToken = newHashedToken;
        user.save();


        const newAccessToken = generateAccessToken(user._id.toString());
        res.json({accessToken: newAccessToken, refreshToken: newRefreshToken});
    });
};

export const telegramAuth = async (req, res) => {
    const telegramData = req.body;

    if (!verifyTelegramLogin(telegramData)) {
        return res.status(401).json({error: "Invalid Telegram login"});
    }

    // Example user object
    const user = {
        telegramId: telegramData.id,
        username: telegramData.username,
        firstName: telegramData.first_name,
        lastName: telegramData.last_name,
        photo: telegramData.photo_url,
    };

    // TODO: save/find user in DB
    // TODO: issue JWT or session

    res.json({
        success: true,
        user,
    });
};


function verifyTelegramLogin(data) {
    const {hash, ...userData} = data;
    // Step 1: sort keys
    const sorted = Object.keys(userData)
        .sort()
        .map(key => `${key}=${userData[key]}`)
        .join("\n");

    // Step 2: create secret key
    const secretKey = crypto
        .createHash("sha256")
        .update(process.env.TELEGRAM_BOT_TOKEN)
        .digest();

    // Step 3: calculate hash
    const computedHash = crypto
        .createHmac("sha256", secretKey)
        .update(sorted)
        .digest("hex");

    return computedHash === hash;
}