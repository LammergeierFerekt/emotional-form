require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const formRoutes = require("./routes/formRoutes");

const app = express();


let mongoConnected = false;

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      mongoConnected = true;
      console.log("Connected to MongoDB");
    })
    .catch((err) => console.error("MongoDB connection error:", err));
} else {
  console.warn("MongoDB URI is not defined in the environment variables.");
}

// make it available to controllers
app.locals.mongoConnected = () => mongoConnected;





app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
} else {
  console.warn("MongoDB URI is not defined in the environment variables.");
}

app.use("/api", formRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));




