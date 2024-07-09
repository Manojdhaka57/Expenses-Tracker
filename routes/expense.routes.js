import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addExpenses, allExpenses } from "../controllers/expense.controller.js";

const router = Router();

router.route("/addExpenses").post(verifyJWT, addExpenses);
router.route("/allExpenses").post(verifyJWT, allExpenses);

export default router;
