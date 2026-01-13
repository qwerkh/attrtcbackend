import express from 'express';
import {checkIn} from "../controller/checkInController.js";

const router = express.Router();

router.post('', checkIn)

export default router;