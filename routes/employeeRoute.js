import express from 'express';
import {employeeController} from "../controller/employeeController.js";

const router = express.Router();

router.post('', employeeController)

export default router;