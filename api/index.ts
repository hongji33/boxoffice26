import express from "express";
import dotenv from "dotenv";
import { apiRouter } from "../src/server/api";

dotenv.config();

const app = express();

// Set up the API routes
app.use("/api", apiRouter);

// Export for Vercel Serverless Functions
export default app;
