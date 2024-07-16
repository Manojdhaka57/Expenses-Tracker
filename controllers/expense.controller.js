import { Expense } from "../models/expense.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
const addExpenses = asyncHandler(async (req, res) => {
  const { categoryId, content, amount, date } = req.body;
  if (!categoryId) {
    throw new ApiError(400, "categoryId is required");
  }
  if (!date) {
    throw new ApiError(400, "date is required");
  }
  if (!amount) {
    throw new ApiError(400, "amount is required");
  }
  if (!content?.trim()) {
    throw new ApiError(400, "content is required");
  }

  const expense = await Expense.create({
    userId: req.user._id,
    categoryId,
    content,
    date,
    amount,
  });
  if (!expense) {
    throw new Error(500, "Something went wrong while adding expense");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, expense, "Expense added successfully"));
});

const allExpenses = asyncHandler(async (req, res) => {
  const { page = 0, size = 10 } = req.body;

  const pagination = await Expense.aggregate([
    {
      $count: "totalRecords",
    },
    {
      $addFields: {
        page: page,
        size: size,
      },
    },
  ]);
  const expenses = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $skip: page * size,
    },
    {
      $limit: size,
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        category: {
          $cond: {
            if: {
              $eq: [{ $size: "$category" }, 0],
            },
            then: null,
            else: {
              $first: "$category.name",
            },
          },
        },
        userInfo: {
          $cond: {
            if: {
              $eq: [{ $size: "$userInfo" }, 0],
            },
            then: {},
            else: {
              $first: "$userInfo",
            },
          },
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { expenses, pagination: pagination[0] },
        "fetched all expenses"
      )
    );
});

const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  if (!expenseId) {
    throw new ApiError(400, "expenseId is required");
  }
  const existingExpense = await Expense.findOneAndDelete({
    $and: [{ _id: expenseId }, { userId: req.user?._id }],
  });
  if (!existingExpense) {
    throw new ApiError(
      400,
      "expenseId is wrong please provide a valid expense"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, existingExpense, `expense is deleted successfully`)
    );
});

const categoryWiseExpense = asyncHandler(async (req, res) => {
  const expenses = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $group: {
        _id: "$categoryId",
        count: {
          $sum: 1,
        },
        totalExpenses: {
          $sum: "$amount",
        },
        averageExpensesByCategory: {
          $avg: "$amount",
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        category: {
          $cond: {
            if: {
              $eq: [{ $size: "$category" }, 0],
            },
            then: null,
            else: {
              $first: "$category.name",
            },
          },
        },
        totalExpenses: {
          $round: ["$totalExpenses", 2],
        },
        averageExpensesByCategory: {
          $round: ["$averageExpensesByCategory", 2],
        },
      },
    },
    {
      $sort: {
        totalExpenses: -1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "all expenses according category"));
});

const expenseSummary = asyncHandler(async (req, res) => {
  const expenses = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $group: {
        _id: "$expenseType",
        count: {
          $sum: 1,
        },
        totalExpenses: {
          $sum: "$amount",
        },
      },
    },

    {
      $addFields: {
        totalExpenses: {
          $round: ["$totalExpenses", 2],
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, expenses, "expenses summary fetched successfully")
    );
});
export {
  addExpenses,
  allExpenses,
  deleteExpense,
  categoryWiseExpense,
  expenseSummary,
};