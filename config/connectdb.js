import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
    try {
        // db options like db name and db password
        // are stored in this object
        const DB_OPTION = {
            dbName: "myshop",
        };

        // await will helps to run the other code outside
        // the function until the database is connecting
        await mongoose.connect(DATABASE_URL, DB_OPTION);

        // as this line of code run after the
        // database is connected so we will know
        console.log("Connected Successfully...");
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;
