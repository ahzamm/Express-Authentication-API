import express, { Router } from "express";
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middleware/auth-middleware.js";

const routes = express.Router();

// Route level Middleware
routes.use("/changepassword", checkUserAuth);

// Public Routes
// the routes which can be accessed without authentication (eg. login, signup,..)
routes.post("/registeration", UserController.userRegistration);
routes.post("/login", UserController.userLogin);

// Private Routes
// the routes which can not be accessed without authentication (eg. dashboard,..)
routes.post("/changepassword", UserController.userChangePassword);

export default routes;
