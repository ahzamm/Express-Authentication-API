import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UserController {
    // static methods are called without class object
    static userRegistration = async (req, res) => {
        // we got this data from front end when user submit registeration form
        const { name, email, password, password_confirmation, tc } = req.body;
        // check if user with email already exists in database
        const user = await UserModel.findOne({ email: email });

        // if user with this email already exists in database then we send this response
        if (user) {
            res.send({
                status: "failed",
                message: "User with this email already exists",
            });
        } else {
            // check if user fill all the fields
            if (name && email && password && password_confirmation && tc) {
                if (password === password_confirmation) {
                    try {
                        // hashing the password
                        const salt = await bcrypt.genSalt(12);
                        const hashPasssword = await bcrypt.hash(password, salt);

                        // storing the user registeration information in to the database
                        const doc = new UserModel({
                            name: name,
                            email: email,
                            password: hashPasssword,
                            tc: tc,
                        });
                        await doc.save();
                        res.status(201).send({
                            status: "success",
                            message: "Registeration success",
                        });
                    } catch {
                        res.send({
                            status: "failed",
                            message: "Coudlnt Register",
                        });
                    }
                } else {
                    res.send({
                        status: "failed",
                        message:
                            "Password and Confirmation password doesn't match",
                    });
                }
            } else {
                // if any of the field left unfilled
                res.send({
                    status: "failed",
                    message: "All fields are required",
                });
            }
        }
    };
    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await UserModel.findOne({ email: email });
                if (user) {
                    const isPasswordCorrect = await bcrypt.compare(
                        password,
                        user.password
                    );
                    if (isPasswordCorrect) {
                        res.send({
                            status: "success",
                            message: "Logedin Successfully",
                        });
                    } else {
                        res.send({
                            status: "failed",
                            message: "Email or Password not match",
                        });
                    }
                } else {
                    res.send({
                        status: "failed",
                        message: "Email or Password not match",
                    });
                }
            } else {
                res.send({
                    status: "failed",
                    message: "All fields are required",
                });
            }
        } catch {
            res.send({ status: "failed", message: "Something went wrong" });
        }
    };
}

export default UserController;
