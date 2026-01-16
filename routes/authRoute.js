import express from "express";
import {loginUser, registerUser, refreshToken,telegramAuth} from "../controller/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/telegram", telegramAuth);
router.post("/refresh", refreshToken);

export default router;