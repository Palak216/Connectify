// require("dotenv").config();
require("dotenv").config({ path: "./.env" });
const express = require("express");
const session = require("express-session");
const path = require("path");
const { connectDb } = require("./src/config/db"); // ✅ ADD THIS

const app = express();

// ✅ CONNECT DB HERE
connectDb();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());