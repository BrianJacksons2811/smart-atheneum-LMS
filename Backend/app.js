// app.js — Express + MySQL (Railway-safe)
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

/* ------------ DB: load MySQL pool (don’t crash if missing) ------------ */
let pool = null;
try {
  pool = require("./database"); // should export a mysql2/promise pool
  console.log("✅ MySQL pool loaded");
} catch (e) {
  console.warn("⚠️  MySQL pool not loaded:", e.message);
}

/* ------------------------------- Middleware ---------------------------- */
// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// Body parsers (MUST be before routes)
app.use(express.json({ limit: "50mb" }));        // <-- your “must come BEFORE routes”
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// (Optional) request logger for debugging
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on("finish", () =>
    console.log(`[REQ] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - t0}ms)`)
  );
  next();
});

/* -------------------------------- Health -------------------------------- */
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/health/db", async (_req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not initialized" });
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: rows?.[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* ------------------------------- Routes (API FIRST — before static!) ---- */
// Your key line (plus the rest of your routers)
app.use("/api/auth", require("./routes/auth"));        // <-- ✅ this is key
app.use("/api/users", require("./routes/users"));
app.use("/api/content", require("./routes/content"));
app.use("/api/uploads", require("./routes/uploads"));
app.use("/api/activities", require("./routes/activities"));

/* -------------------------------- Static -------------------------------- */
// Serve your site (adjust if your HTML is elsewhere)
const publicDir = path.join(__dirname, "..");
if (fs.existsSync(publicDir)) app.use(express.static(publicDir));

// Uploaded assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* --------------------------- 404 + Error handlers ----------------------- */
app.use((req, res) => res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` }));
app.use((err, _req, res, _next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

/* -------------------------------- Start --------------------------------- */
// Start only if run directly (Railway will use this entry)
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, "0.0.0.0", () => console.log(`[READY] API listening on ${PORT}`));
}

module.exports = app;
