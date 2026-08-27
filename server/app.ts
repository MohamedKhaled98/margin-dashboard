import express from "express";
import importRoutes from "./routes/import.routes.js";

const app = express();

app.use(express.json());

app.use("/api/import", importRoutes);

export default app;