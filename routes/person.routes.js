import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addPerson,
  allPersons,
  personDetails,
  updatedPerson,
  deletePerson,
} from "../controllers/person.controller.js";
const router = new Router();

router.route("/addPerson").post(verifyJWT, addPerson);
router.route("/all/persons").get(verifyJWT, allPersons);
router
  .route("/:personId")
  .get(verifyJWT, personDetails)
  .patch(verifyJWT, updatedPerson)
  .delete(verifyJWT, deletePerson);
export default router;
