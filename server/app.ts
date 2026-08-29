import express from "express";
import importRoutes from "./routes/import.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import productivityRoutes from "./routes/productivity.routes.js";
import projectRoutes from "./routes/project.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import { ErrorHandler, notFoundHandler } from "./middleware/error-handler.middleware.js";

const app = express();

app.use(express.json());

app.use("/api/import", importRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/productivity", productivityRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/settings", settingsRoutes);

// ✅ Handle 404 Not Found routes
app.use(notFoundHandler);

// ✅ Error handling
app.use(ErrorHandler);

export default app;