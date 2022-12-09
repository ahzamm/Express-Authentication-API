import express, { Router } from "express";
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middleware/auth-middleware.js";

const routes = express.Router();

// Route level Middleware
routes.use("/change-password", checkUserAuth);
routes.use("/user-profile", checkUserAuth);

// Public Routes
// the routes which can be accessed without authentication (eg. login, signup,..)
routes.post("/registeration", UserController.userRegistration);
routes.post("/login", UserController.userLogin);
routes.post("/password-reset-email", UserController.sendUserPasswordResetEmail);
routes.post("/reset-password/:id/:token", UserController.userPasswordReset);

// Private Routes
// the routes which can not be accessed without authentication (eg. dashboard,..)
routes.post("/change-password", UserController.userChangePassword);
routes.get("/user-profile", UserController.userProfile);

export default routes;
