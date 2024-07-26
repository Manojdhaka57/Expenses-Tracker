import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
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
    description: {
      type: String,
      trim: true,
    },
    transactionType: {
      type: String,
      enum: ["send", "received"],
      default: "send",
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.pre("findOneAndUpdate", function (next) {
  this.options.runValidators = true;
  next();
});

export const Transaction = mongoose.model("Transcation", transactionSchema);
