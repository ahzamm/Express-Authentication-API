import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

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
                        const salt = await bcrypt.genSalt(
                            parseInt(process.env.SALT_VALUE)
                        );
                        const hashPasssword = await bcrypt.hash(password, salt);

                        // storing the user registeration information in to the database
                        const doc = new UserModel({
                            name: name,
                            email: email,
                            password: hashPasssword,
                            tc: tc,
                        });
                        await doc.save();

                        // Generate JWT Token
                        const user = UserModel.findOne({ email: email });
                        const token = jwt.sign(
                            { userID: user._id },
                            process.env.JWT_SECRET_KEY,
                            { expiresIn: `${process.env.JWT_EXP_TIME}30d` }
                        );

                        // store jwt token in cookie
                        res.cookie("jwt", token, {
                            expires: new Date(Date.now() + 30000),
                            httpOnly: true,
                        });

                        res.status(201).send({
                            status: "success",
                            message: "Registeration success",
                            token: token,
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
                        const token = jwt.sign(
                            { userID: user._id },
                            process.env.JWT_SECRET_KEY,
                            { expiresIn: `${process.env.JWT_EXP_TIME}30d` }
                        );

                        // store jwt token in cookie
                        res.cookie("jwt", token, {
                            expires: new Date(Date.now() + 30000),
                            httpOnly: true,
                        });

                        res.send({
                            status: "success",
                            message: "Logedin Successfully",
                            token: token,
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
    static userChangePassword = async (req, res) => {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (oldPassword && newPassword && confirmPassword) {
            if (newPassword === confirmPassword) {
                if (req.headers && req.headers.authorization) {
                    var authorization = req.headers.authorization.split(" ")[1];
                    const decoded = jwt.verify(
                        authorization,
                        process.env.JWT_SECRET_KEY
                    );
                    var userId = decoded.userID;
                    // Fetch the user by id
                    const user = await UserModel.findOne({ _id: userId });
                    const isPasswordCorrect = await bcrypt.compare(
                        oldPassword,
                        user.password
                    );

                    if (isPasswordCorrect) {
                        // hash newPassword
                        const salt = await bcrypt.genSalt(
                            parseInt(process.env.SALT_VALUE)
                        );
                        const newHashedPasssword = await bcrypt.hash(
                            newPassword,
                            salt
                        );

                        await UserModel.findByIdAndUpdate(req.user._id, {
                            $set: { password: newHashedPasssword },
                        });

                        res.send({
                            status: "success",
                            message: "Password changed successfully",
                        });
                    } else {
                        res.send({
                            status: "failed",
                            message: "Wrong old password",
                        });
                    }
                }
            } else {
                res.send({
                    status: "failed",
                    message: "New password and confirm password doesn't match",
                });
            }
        } else {
            res.send({
                status: "failed",
                message: "All fields required",
            });
        }
    };
    static userProfile = async (req, res) => {
        res.send({ status: "success", user: req.user });
    };
    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body;
        if (email) {
            // check if user for given email exists?
            const user = await UserModel.findOne({ email: email });
            if (user) {
                // generate secret by combining user_id and secret_key
                const secret = user._id + process.env.JWT_SECRET_KEY;
                // generate special token for password reset using secret which is the
                // combination of regular secret and user id and not just secret
                const token = jwt.sign({ userID: user._id }, secret, {
                    expiresIn: `${process.env.RESET_TOKEN_TIME}m`,
                });
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;

                // SEND EMAIL
                // let info = await transporter.sendMail.sendMail({
                //     from: process.env.EMAIL_FROM,
                //     to: user.email,
                //     subject: "Password Reset Link",
                //     body: `<a href=${link}>Click Here</a> to Reset your Passowrd`,
                // });
                res.send({
                    status: "success",
                    message: "Password reset email sent to your email",
                    // info: info,
                });
            } else {
                res.send({
                    status: "failed",
                    message: "Not a registered user",
                });
            }
        } else {
            res.send({
                status: "failed",
                message: "All fields are required",
            });
        }
    };
    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body;
        const { id, token } = req.params;
        const user = await UserModel.findById(id);
        const new_secret = user._id + process.env.JWT_SECRET_KEY;
        try {
            jwt.verify(token, new_secret);
            if (password && password_confirmation) {
                if (password == password_confirmation) {
                    const salt = await bcrypt.genSalt(
                        parseInt(process.env.SALT_VALUE)
                    );
                    const newHashedPasssword = await bcrypt.hash(
                        password,
                        salt
                    );

                    await UserModel.findByIdAndUpdate(user._id, {
                        $set: { password: newHashedPasssword },
                    });

                    res.send({
                        status: "success",
                        message: "Password changed successfully",
                    });
                } else {
                    res.send({
                        status: "failed",
                        message:
                            "Password and Confirmation Password doesn't match",
                    });
                }
            } else {
                res.send({
                    status: "failed",
                    message: "All fields are required",
                });
            }
        } catch {
            res.send({
                status: "failed",
                message: "Invalid Token",
            });
        }
    };
}

export default UserController;
