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
    throw new ApiError(500, "Something went wrong while adding expense");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, expense, "Expense added successfully"));
});

const allExpenses = asyncHandler(async (req, res) => {
  const { page = 0, size = 10, fromDate, endDate, categoryId } = req.body;
  let queryString = { userId: new mongoose.Types.ObjectId(req.user?._id) };
  if (fromDate) {
    queryString.createdAt = {
      $gte: new Date(fromDate),
    };
  }
  if (endDate) {
    queryString.createdAt = {
      ...queryString?.createdAt,
      $lte: new Date(endDate),
    };
  }

  if (categoryId) {
    queryString.categoryId = new mongoose.Types.ObjectId(categoryId);
  }
  const pagination = await Expense.aggregate([
    {
      $match: queryString,
    },
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
      $match: queryString,
    },
    {
      $sort: {
        updatedAt: -1,
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
      },
    },
    {
      $project: {
        userId: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { expenses, pagination: pagination[0] || {} },
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
  const { fromDate, endDate } = req.body;
  let queryString = { userId: new mongoose.Types.ObjectId(req.user?._id) };
  if (fromDate) {
    queryString.createdAt = {
      $gte: new Date(fromDate),
    };
  }
  if (endDate) {
    queryString.createdAt = {
      ...queryString?.createdAt,
      $lte: new Date(endDate),
    };
  }
  const expenses = await Expense.aggregate([
    {
      $match: queryString,
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
  const { fromDate, endDate } = req.body;
  let queryString = { userId: new mongoose.Types.ObjectId(req.user?._id) };
  if (fromDate) {
    queryString.createdAt = {
      $gte: new Date(fromDate),
    };
  }
  if (endDate) {
    queryString.createdAt = {
      ...queryString?.createdAt,
      $lte: new Date(endDate),
    };
  }

  const monthWiseExpenses = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user?._id),
        expenseType: "expense",
      },
    },
    {
      $group: {
        _id: {
          expenseType: "$expenseType",
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalExpense: {
          $sum: "$amount",
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $addFields: {
        totalExpense: {
          $round: ["$totalExpense", 2],
        },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);
  const expenses = await Expense.aggregate([
    {
      $match: queryString,
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
      new ApiResponse(
        200,
        { expenses, monthWiseExpenses },
        "expenses summary fetched successfully"
      )
    );
});

const dayWiseExpense = asyncHandler(async (req, res) => {
  const { fromDate, endDate } = req.body;
  let queryString = {
    userId: new mongoose.Types.ObjectId(req.user?._id),
    expenseType: "expense",
  };
  if (fromDate) {
    queryString.createdAt = {
      $gte: new Date(fromDate),
    };
  }
  if (endDate) {
    queryString.createdAt = {
      ...queryString?.createdAt,
      $lte: new Date(endDate),
    };
  }

  const expenses = await Expense.aggregate([
    {
      $match: queryString,
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalExpense: {
          $sum: "$amount",
        },
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        expenses,
        "expenses summary by days fetched successfully"
      )
    );
});
export {
  addExpenses,
  allExpenses,
  deleteExpense,
  categoryWiseExpense,
  expenseSummary,
  dayWiseExpense,
};
