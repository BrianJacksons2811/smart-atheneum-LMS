// server.js — Smart Atheneum API (MySQL Edition, Railway-safe)
console.log("[BOOT] Starting Smart Atheneum API…");
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

/* ------------ helpers ------------ */
function safeRequire(p) {
  try {
    return require(p);
  } catch (e) {
    console.warn(`[WARN] Optional module not loaded: ${p} — ${e.message}`);
    return null;
  }
}

/* ------------ db (optional) ------ */
let pool = null;
try {
  pool = safeRequire("./database"); // should export a mysql2/promise pool
  if (!pool) throw new Error("database module not found");
  console.log("✅ DB module loaded");
} catch (e) {
  console.error("❌ DB init failed (continuing without DB):", e.message);
}

/* ------------ middleware ---------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger (useful while debugging)
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on("finish", () =>
    console.log(`[REQ] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - t0}ms)`)
  );
  next();
});

/* ------------ health -------------- */
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/health/db", async (_req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not initialized" });
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: rows?.[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* ------------ routes (API FIRST) -- */
const authRouter = safeRequire("./routes/auth");
if (authRouter) app.use("/api/auth", authRouter);

const usersRouter = safeRequire("./routes/users");
if (usersRouter) app.use("/api/users", usersRouter);

const contentRouter = safeRequire("./routes/content");
if (contentRouter) app.use("/api/content", contentRouter);

const uploadsRouter = safeRequire("./routes/uploads");
if (uploadsRouter) app.use("/api/uploads", uploadsRouter);

const activitiesRouter = safeRequire("./routes/activities");
if (activitiesRouter) app.use("/api/activities", activitiesRouter);

app.use('/api/auth', require('./routes/auth')); 

app.use(express.json());                       // body parser FIRST
app.use('/api/auth', require('./routes/auth'));// API FIRST
app.use(express.static(path.join(__dirname,'..'))); // static AFTER

/* ------------ static AFTER api ---- */
const publicDir = path.join(__dirname, ".."); // adjust if needed
if (fs.existsSync(publicDir)) app.use(express.static(publicDir));

/* ------------ 404 & errors -------- */
app.use((req, res) => res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` }));
app.use((err, _req, res, _next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

/* ------------ start --------------- */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[READY] API listening on port ${PORT}`);
  console.log("Try /health and POST /api/auth/register");
});

process.on("unhandledRejection", (err) => console.error("UNHANDLED:", err));
process.on("uncaughtException", (err) => console.error("UNCAUGHT:", err));
