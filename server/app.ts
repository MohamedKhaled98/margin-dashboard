import express from "express";
import importRoutes from "./routes/import.routes.js";
import { ErrorHandler, notFoundHandler } from "./middleware/error-handler.middleware.js";

const app = express();

app.use(express.json());

app.use("/api/import", importRoutes);

// ✅ Handle 404 Not Found routes
app.use(notFoundHandler);

// ✅ Error handling
app.use(ErrorHandler);

export default app;