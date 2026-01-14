import express from 'express';
import * as dotenv from "dotenv";
import {authJWT, authSecret} from "./middleware/authJWT.js"
import cors from "cors";

const app = express();
dotenv.config();
const port = process.env.PORT || 3000;
import connectDB from "./config/db.js";
// Connect DB
connectDB();
import employeeRoute from "./routes/employeeRoute.js";
import authRoute from "./routes/authRoute.js";
import checkInRoute from "./routes/checkInRoute.js";

app.use(cors());
const allowedOrigins = [
    "https://rtcbtb-a447c.web.app",
    "http://localhost:8080"
];
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        const origin = req.headers.origin;
        if (allowedOrigins.includes(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
        res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,token");
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.use(process.env.API_VERSION + "/auth", authSecret, authRoute);
app.use(process.env.API_VERSION + "/employee", authJWT, employeeRoute);
app.use(process.env.API_VERSION + "/scan", authJWT, checkInRoute);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})