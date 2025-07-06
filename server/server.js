const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const roleRoutes = require("./Routes/route.roles");
const authRoutes = require("./Routes/route.auth");
require("dotenv").config();

const app = express();
app.use(
  session({
    name: "token",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true, // this refreshes session expiration on every request
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 30, // 30 minutes
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "PUT", "DELETE", "GET"],
    credentials:true
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/roles", roleRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB Error:", err);
  });
