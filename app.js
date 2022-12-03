import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// this line of code handle a error
// which we will encountered in frontend
app.use(cors());
connectDB(DATABASE_URL);

// Json
app.use(express.json());

// Load Routes
app.use("/api/user", userRoutes);

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
