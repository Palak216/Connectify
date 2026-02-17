const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('../routes/auth');
const feedRoutes = require("../routes/feed");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));


app.use(session({
  secret: "mysupersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }   // IMPORTANT for localhost
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); // ✅ FIXED

// app.use('/', authRoutes);

// module.exports = app;


// const authRoutes = require("../routes/auth");
// const feedRoutes = require("../routes/feed");

// const app = express();

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// app.use(
//   session({
//     secret: "mini-instagram-secret",
//     resave: false,
//     saveUninitialized: false
//   })
// );

// app.set("view engine", "ejs");
//  app.set("views", path.join(__dirname, "../../views"));


app.use("/", authRoutes);
app.use("/", feedRoutes);   // 🔥 THIS LINE MUST EXIST

module.exports = app;
