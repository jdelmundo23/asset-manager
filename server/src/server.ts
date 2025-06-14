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
import assetRouter from "./routes/api/assets/assets";
import assetBulkRouter from "./routes/api/assets/assets_bulk";
import ipBulkRouter from "./routes/api/network/ips_bulk";
import usersRouter from "./routes/api/users";
import ipsRouter from "./routes/api/network/ips";
import subnetRouter from "./routes/api/network/subnets";

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/api", apiRouter);
app.use("/api/presets", presetRouter);
app.use("/api/assets/bulk", assetBulkRouter);
app.use("/api/ips/bulk", ipBulkRouter);
app.use("/api/assets", assetRouter);
app.use("/api/ips", ipsRouter);
app.use("/api/subnets", subnetRouter);
app.use("/api/users", usersRouter);
app.get("/", function (req, res) {
  res.json("API for asset manager");
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
