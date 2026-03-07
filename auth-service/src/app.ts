import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authRouter } from "./modules/auth/index.js";
import { corsOptions } from "./config/cors.js";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(authRouter);

app.use(errorHandler);

export default app;
