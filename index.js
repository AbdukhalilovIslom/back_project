import * as dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";

// routes
import User from "./routes/user.js";
import Collection from "./routes/collection.js";
import Item from "./routes/item.js";

dotenv.config();
const corsOptions = {
  origin: "*",
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const db = mongoose.connection;

// routes
app.use("/user", User);
app.use("/collection", Collection);
app.use("/item", Item);

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check the database connection

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to the database");
});

// Start the server
const PORT = process.env.PORT || 4100;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
