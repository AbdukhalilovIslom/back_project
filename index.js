import * as dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";

// routes
import User from "./routes/user.js";
import Collection from "./routes/collection.js";
import Item from "./routes/item.js";

const app = express();
const db = mongoose.connection;
dotenv.config();

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Private-Network", true);
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  res.setHeader("Access-Control-Max-Age", 7200);

  next();
});
app.use(express.json());

// routes
app.use(User);
app.use(Collection);
app.use(Item);

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
