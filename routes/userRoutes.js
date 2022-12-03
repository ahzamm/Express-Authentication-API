import express from "express";
import UserController from "../controllers/userController.js";

const routes = express.Router();

// Public Routes
// the routes which can be accessed without authentication (eg. login, signup,..)
routes.post("/registeration", UserController.userRegistration);
routes.post("/login", UserController.userLogin);
// Private Routes
// the routes which can not be accessed without authentication (eg. dashboard,..)

export default routes;
