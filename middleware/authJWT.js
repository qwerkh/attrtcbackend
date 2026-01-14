import jwt from "jsonwebtoken";

export const authJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({message: "No token provided"});
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log(token);
            console.log(err.name);

            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    expired: true,
                    message: 'expired',
                    code: 401
                });
            }
            return res.status(403).json({message: "Invalid token"});
        }
        req.userId = decoded.id;
        next();
    });
}
export const authSecret = (req, res, next) => {
    const token = req.headers.token;
    console.log(token);
    if (!token) {
        return res.status(401).json({message: "No token provided"});
    }
    console.log(token !== process.env.JWT_SECRET);
    if (token !== process.env.JWT_SECRET) {
        return res.status(403).json({message: "Invalid token"});
    }
    next();
}