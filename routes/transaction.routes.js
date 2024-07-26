import { Router } from "express";
import {
  addTransaction,
  editTransaction,
  deleteTransaction,
  personTransactionsHistory,
  personTransactionsSummary,
  userTransactionsSummary,
  transactionDetails,
} from "../controllers/transaction.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/addTransaction").post(verifyJWT, addTransaction);
router
  .route("/:transactionId")
  .get(verifyJWT, transactionDetails)
  .patch(verifyJWT, editTransaction)
  .delete(verifyJWT, deleteTransaction);
router
  .route("/personTransactionsHistory")
  .post(verifyJWT, personTransactionsHistory);
router
  .route("/personTransactionsSummary")
  .post(verifyJWT, personTransactionsSummary);
router
  .route("/userTransactionsSummary")
  .post(verifyJWT, userTransactionsSummary);

export default router;
