import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

var checkUserAuth = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;

    // check if there is authorization token is present in header
    if (authorization && authorization.startsWith("Bearer")) {
        try {
            token = authorization.split(" ")[1];

            // verify token
            // jwt.verify method taken token and secret key as input return the userid
            // because we only encode user id at the time of token geneation in user
            // registeration and user login
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // get user from token
            // .select(-password) will ignore password(all user info except password)
            req.user = await UserModel.findById(userID);

            // to shift the program execution flow
            next();
        } catch (e) {
            console.log("=======>" + e);
            res.status(401).send({
                status: "failed",
                message: "Unauthorized User",
            });
        }
    }
};

export default checkUserAuth;
