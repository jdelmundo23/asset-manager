import * as dotenv from "dotenv";
import express, { ErrorRequestHandler } from "express";
import session from "express-session";
import path from "path";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import "module-alias/register";

dotenv.config({ path: path.resolve(__dirname, "../.env.dev") });

import { getPool } from "./sql";

import authRouter from "./routes/auth";
import apiRouter from "./routes/api/middleware";
import presetRouter from "./routes/api/presets";
import assetRouter from "./routes/api/assets";
import usersRouter from "./routes/api/users";
import ipsRouter from "./routes/api/ips";

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/api", apiRouter);
app.use("/api/presets", presetRouter);
app.use("/api/assets", assetRouter);
app.use("/api/users", usersRouter);
app.use("/api/ips", ipsRouter);
app.get("/", function (req, res) {
  res.json("API for inventory management");
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(((err, req, res) => {
  res.status(err.status || 500);
  res.send(err.stack);
}) as ErrorRequestHandler);

getPool()
  .then(() => {
    console.log("Connection pool inititialized");
  })
  .catch((error) => {
    console.error("Error initializing connection pool", error);
  });

app.listen(5000, () => console.log("Server started on Port 5000"));
