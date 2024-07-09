import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.aggregate([
    {
      $match: {
        userId: req.user?._id,
      },
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
      $addFields: {
        userInfo: {
          $first: "$userInfo",
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, categories, "fetched all categories"));
});

const addCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, "category name is required");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "user does not exist");
  }

  const existedCategory = await Category.findOne({
    $and: [{ name }, { userId: req.user?._id }],
  });
  if (existedCategory) {
    throw new ApiError(400, "Category alredy exist");
  }

  const createdCategory = await Category.create({
    userId: user._id,
    name,
  });

  if (!createdCategory) {
    throw new ApiError(400, "Something went wrong while creatating category");
  }

  user.categories.unshift(createdCategory._id);
  await user.save({ validateBeforeSave: false });
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdCategory, "category created successfully")
    );
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!categoryId) {
    throw new ApiError(400, "categoryId is required");
  }
  const existingCategory = await Category.findByIdAndDelete(categoryId);
  if (!existingCategory) {
    throw new ApiError(
      400,
      "categoryId is wrong please provide a valid category"
    );
  }
  if (existingCategory && req.user?._id !== existingCategory.userId) {
    throw new ApiError(400, "you are not allowed to delete this category");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingCategory,
        `category: ${existingCategory.name} is deleted successfully`
      )
    );
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;
  if (!categoryId) {
    throw new ApiError(400, "categoryId is required");
  }

  if (typeof name === "string" && !name?.trim()) {
    throw new ApiError(400, "category name is required");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "user does not exist");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(
      400,
      "categoryId is wrong please provide a valid category"
    );
  }
  if (category && req.user?._id !== category.userId) {
    throw new ApiError(400, "you are not allowed to update this category");
  }
  const existingCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      $set: {
        name,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingCategory,
        `category: ${existingCategory.name} is update successfully`
      )
    );
});
export { addCategory, getAllCategories, deleteCategory, updateCategory };
