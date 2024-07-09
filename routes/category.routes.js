import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.route("/addCategory").post(verifyJWT, addCategory);
router.route("/allCategories").get(verifyJWT, getAllCategories);
router
  .route("/:categoryId")
  .delete(verifyJWT, deleteCategory)
  .patch(verifyJWT, updateCategory);

export default router;
