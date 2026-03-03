import { Router } from "express";
import contactController from "../controller/contactController";


const router=Router();
router.post('/identify',contactController);

export default router;
