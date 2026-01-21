import express from 'express';
import {checkIn, checkInByDay} from "../controller/checkInController.js";

const router = express.Router();

router.post('', checkIn)
router.post('/byDay', checkInByDay)

export default router;