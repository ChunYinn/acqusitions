import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "#configs/logger";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "#routes/auth.routes";
import { arcjetSecurityGuard } from "#middleware/arcjet.middleware";
import { uptime } from "process";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use(arcjetSecurityGuard);

app.use("/api/auth", authRouter);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("Hello, from acquisition!");
});

app.get("/health", (_req: Request, res: Response) => {
  res
    .status(200)
    .json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: uptime(),
    });
});

export default app;
