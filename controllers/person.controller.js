import { Person } from "../models/person.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addPerson = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    throw new ApiError(400, "Person name is required");
  }
  const existedPerson = await Person.findOne({
    $and: [{ name: name.trim() }, { userId: req.user?._id }],
  });

  if (existedPerson) {
    throw new ApiError(400, "Person already exists");
  }
  const createdPerson = await Person.create({
    userId: req.user?._id,
    name: name.trim(),
  });
  if (!createdPerson) {
    throw new ApiError(400, "Something went wrong while adding person");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdPerson, "Person added successfully"));
});

const allPersons = asyncHandler(async (req, res) => {
  const persons = await Person.aggregate([
    {
      $match: {
        userId: req.user?._id,
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, persons, "all persons fetched successfully"));
});

const personDetails = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Person details fetched successfully"));
});

const updatedPerson = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    throw new ApiError(400, "Person name is required");
  }
  const { personId } = req.params;
  if (!personId) {
    throw new ApiError(400, "personId is required");
  }

  const existingPerson = await Person.findOneAndUpdate(
    {
      $and: [{ _id: personId }, { userId: req.user?._id }],
    },
    {
      $set: {
        name,
      },
    },
    { new: true }
  );
  if (!existingPerson) {
    throw new ApiError(
      400,
      "personId is wrong please provide a valid personId"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Person details updated successfully"));
});

const deletePerson = asyncHandler(async (req, res) => {
  const { personId } = req.params;
  if (!personId) {
    throw new ApiError(400, "personId is required");
  }
  const existingPerson = await Person.findOneAndDelete({
    $and: [{ _id: personId }, { userId: req.user?._id }],
  });
  if (!existingPerson) {
    throw new ApiError(
      400,
      "personId is wrong please provide a valid personId"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingPerson,
        `person : ${existingPerson.name} is deleted successfully`
      )
    );
});
export { addPerson, allPersons, personDetails, updatedPerson, deletePerson };
