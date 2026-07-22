import express from "express";
import cors from "cors";
import router from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.route.js";
import applicationRoutes from "./routes/application.route.js";
import adminRoutes from './routes/admin.route.js'
import { getDBStatus } from "./config/db.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ApplyFlow API is running...",
  });
});



app.get("/health", (req, res) => {
  const dbStatus = getDBStatus();
  res.status(dbStatus.connected ? 200 : 503).json({
    success: dbStatus.connected,
    message: dbStatus.connected ? "Database connected" : "Database unavailable",
    database: dbStatus,
  });
});

app.use("/api", (req, res, next) => {
  const dbStatus = getDBStatus();

  if (!dbStatus.connected) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Please check your MongoDB connection.",
    });
  }

  next();
});

app.use("/api/auth", router);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);

export default app;