import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Person } from "../models/person.modal.js";
import { Transaction } from "../models/transaction.modal.js";

const addTransaction = asyncHandler(async (req, res) => {
  const { personId, amount, date, description, transactionType } = req.body;
  if (!personId?.trim()) {
    throw new ApiError(400, "personId is required");
  }
  if (!amount) {
    throw new ApiError(400, "amount is required");
  }

  if (!date) {
    throw new ApiError(400, "date is required");
  }
  const existedPerson = await Person.findById(personId);
  if (!existedPerson) {
    throw new ApiError(400, "personId is wrong please provide right person id");
  }
  const transaction = await Transaction.create({
    userId: req.user._id,
    personId,
    date,
    amount,
    description,
    transactionType,
  });
  if (!transaction) {
    throw new ApiError(500, "Something went wrong while adding transaction");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, transaction, "transaction added successfully"));
});

const editTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { personId, amount, date, description, transactionType } = req.body;
  if (!transactionId) {
    throw new ApiError(400, "transactionId is required");
  }
  if (!personId?.trim()) {
    throw new ApiError(400, "personId is required");
  }
  if (!amount) {
    throw new ApiError(400, "amount is required");
  }

  if (!date) {
    throw new ApiError(400, "date is required");
  }
  const existedPerson = await Person.findById(personId);
  if (!existedPerson) {
    throw new ApiError(400, "personId is wrong please provide right person id");
  }
  const updatedTransaction = await Transaction.findOneAndUpdate(
    {
      $and: [
        { _id: transactionId },
        { personId: new mongoose.Types.ObjectId(personId) },
        { userId: new mongoose.Types.ObjectId(req.user?._id) },
      ],
    },
    {
      $set: {
        amount,
        date,
        description,
        transactionType,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedTransaction) {
    throw new ApiError(400, "something went wrong while updating transaction");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedTransaction, "editTransaction controller")
    );
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  if (!transactionId) {
    throw new ApiError(400, "transactionId is required");
  }
  const existedTransaction = await Transaction.findOneAndDelete({
    $and: [
      {
        _id: transactionId,
      },
      {
        userId: req.user?._id,
      },
    ],
  });
  if (!existedTransaction) {
    throw new ApiError(
      400,
      "transactionId is wrong please provide a valid transaction"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existedTransaction,
        "delete transaction successfully"
      )
    );
});

const personTransactionsHistory = asyncHandler(async (req, res) => {
  const { personId } = req.body;
  const transactionHistories = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user?._id),
        personId: new mongoose.Types.ObjectId(personId),
      },
    },
    {
      $sort: {
        createAt: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transactionHistories,
        "personTransactionsHistory fetched successfully"
      )
    );
});

const personTransactionsSummary = asyncHandler(async (req, res) => {
  const { personId } = req.body;
  const transactionSummary = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user?._id),
        personId: new mongoose.Types.ObjectId(personId),
      },
    },
    {
      $group: {
        _id: "$transactionType",
        totalTransaction: {
          $sum: "$amount",
        },
      },
    },
    {
      $addFields: {
        transactionType: "$_id",
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transactionSummary,
        "personTransactionsSummary fetched sucessfully"
      )
    );
});

const userTransactionsSummary = asyncHandler(async (req, res) => {
  const transactionSummary = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $group: {
        _id: "$transactionType",
        totalTransactionAmount: {
          $sum: "$amount",
        },
      },
    },
    {
      $addFields: {
        transactionType: "$_id",
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { useTransactionSummary: transactionSummary },
        "userTransactionsSummary fetched successfully"
      )
    );
});

const transactionDetails = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  if (!transactionId) {
    throw new ApiError(400, "transactionId is required");
  }
  const existedTransaction = await Transaction.findOne({
    $and: [
      {
        _id: transactionId,
      },
      {
        userId: req.user?._id,
      },
    ],
  });
  if (!existedTransaction) {
    throw new ApiError(
      400,
      "transactionId is wrong please provide a valid transaction"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existedTransaction,
        "transactionDetails fetched successfully"
      )
    );
});

export {
  addTransaction,
  editTransaction,
  deleteTransaction,
  personTransactionsHistory,
  personTransactionsSummary,
  userTransactionsSummary,
  transactionDetails,
};
