import express from "express";
import importRoutes from "./routes/import.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import { ErrorHandler, notFoundHandler } from "./middleware/error-handler.middleware.js";

const app = express();

app.use(express.json());

app.use("/api/import", importRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

// ✅ Handle 404 Not Found routes
app.use(notFoundHandler);

// ✅ Error handling
app.use(ErrorHandler);

export default app;