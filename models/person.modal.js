import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "person name is required"],
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Person = mongoose.model("Person", personSchema);
