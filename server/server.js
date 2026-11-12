import "dotenv/config";
import express from "express";
import cors from "cors";
import tramiteRoutes from "./routes/tramiteRoutes.js";
import { login, register } from "./controllers/authController.js";
import { BusinessRuleError } from "./domain/tramiteRules.js";

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((value) => value.trim()) : ["http://localhost:3000"], methods: ["GET", "POST"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json({ limit: "32kb" }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.use("/api/tramites", tramiteRoutes);
app.use((error, _req, res, _next) => {
  if (error instanceof BusinessRuleError) return res.status(error.status).json({ message: error.message });
  console.error(error.message);
  return res.status(500).json({ message: "Ocurrió un error. Intentá nuevamente." });
});

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => console.log(`API disponible en puerto ${port}`));
}

export default app;
