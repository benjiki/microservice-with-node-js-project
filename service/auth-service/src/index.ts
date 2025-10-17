import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRouter from "./routes";
import { error } from "console";
import { errorHandler } from "../../../shared/middleware";
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

//setup middleware
app.use(cors());
app.use(helmet());

//  parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// setup api routes
app.use("/api/auth", authRouter);

// error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});

export default app;
