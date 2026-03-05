import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";

import { setupMiddleware } from "./middlewares";
import { routes } from "./routes";
import { errorHandler } from "./middlewares";

dotenv.config();

const app: Application = express();

setupMiddleware(app);

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

routes.forEach(({ path, router }) => {
  app.use(path, router);
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;
