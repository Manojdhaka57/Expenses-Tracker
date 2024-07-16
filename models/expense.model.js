import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    content: {
      type: String,
      required: [true, "content is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "amount is required"],
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    expenseType: {
      type: String,
      enum: ["income", "expense"],
      default: "expense",
    },
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.model("Expense", expenseSchema);
