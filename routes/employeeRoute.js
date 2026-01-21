import express from 'express';
import {
    employeeController,
    employeeListController,
    employeeApproveController
} from "../controller/employeeController.js";

const router = express.Router();

router.post('', employeeController)
router.post('/list', employeeListController)
router.post('/approve', employeeApproveController)

export default router;