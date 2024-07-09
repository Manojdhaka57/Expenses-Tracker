import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "category name is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
