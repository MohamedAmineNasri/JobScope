const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");

// import routues
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobtypeRoutes = require("./routes/jobtypeRoutes");
const jobRoutes = require("./routes/jobtRoutes");

app.use(cors());
app.use(express.json()); // Use built-in middleware for parsing JSON data
app.use(express.urlencoded({ extended: true })); // Use built-in middleware for parsing URL-encoded data
app.use(cookieParser());

const PORT = process.env.PORT || 8000;

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", jobtypeRoutes);
app.use("/api", jobRoutes);

// error middleware
app.use(errorHandler);

//MongoDB connection + server
mongoose
  .connect("mongodb://127.0.0.1:27017/JOBSCOPE")
  .then(() => {
    console.log("Connected To DB");
    app.listen(PORT, () => console.log("Server is running"));
  })
  .catch((err) => console.log(err));
