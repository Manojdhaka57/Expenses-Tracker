import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addExpenses,
  allExpenses,
  categoryWiseExpense,
  dayWiseExpense,
  deleteExpense,
  expenseSummary,
} from "../controllers/expense.controller.js";

const router = Router();

router.route("/addExpenses").post(verifyJWT, addExpenses);
router.route("/allExpenses").post(verifyJWT, allExpenses);
router.route("/:expenseId").delete(verifyJWT, deleteExpense);
router.route("/categoryWiseExpense").post(verifyJWT, categoryWiseExpense);
router.route("/expenseSummary").post(verifyJWT, expenseSummary);
router.route("/dayWiseExpense").post(verifyJWT, dayWiseExpense);

export default router;
