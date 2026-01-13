import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
    return jwt.sign(
        {id: userId},
        process.env.JWT_SECRET,
        {expiresIn: "1m"}
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        {id: userId},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "31d"}
    );
};

