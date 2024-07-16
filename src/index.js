import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "../db/index.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 5050;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is listening on port: ${port}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error: " + error);
  });