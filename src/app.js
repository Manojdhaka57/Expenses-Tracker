import express from "express";
import cors from "cors";
import userRouter from "../routes/user.routes.js";
import categoryRouter from "../routes/category.routes.js";
import expenseRouter from "../routes/expense.routes.js";
import personRouter from "../routes/person.routes.js";
import transactionRouter from "../routes/transaction.routes.js";
const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/expense", expenseRouter);
app.use("/api/v1/person", personRouter);
app.use("/api/v1/transaction", transactionRouter);
export { app };
