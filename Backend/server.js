// server.js — Smart Atheneum API (MySQL Edition, Railway-safe)
console.log("[BOOT] Starting Smart Atheneum API…");

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

/* ------------------------- helpers ------------------------- */
function safeRequire(p) {
  try {
    return require(p);
  } catch (e) {
    console.warn(`[WARN] Optional module not loaded: ${p} — ${e.message}`);
    return null;
  }
}

/* ------------------------- database ------------------------ */
// Don’t crash the app if DB init fails — still serve /health
let pool = null;
try {
  pool = safeRequire("./database"); // your module should export a mysql2/promise pool
  if (!pool) throw new Error("database module not found");
  console.log("✅ DB module loaded");
} catch (e) {
  console.error("❌ DB init failed (continuing without DB):", e.message);
}

/* ------------------------- middleware ---------------------- */
// CORS (allow all while testing; restrict origin later)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors()); // handle preflight

app.use(express.json({ limit: "2mb" }));

// Static files (serve only if the folder exists)
const publicDir = path.join(__dirname, "..");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

/* ------------------------- health -------------------------- */
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

/* ------------------------- routes -------------------------- */
// Load each router only if the file exists; don’t crash the server
const authRouter = safeRequire("./routes/auth");
if (authRouter) app.use("/api/auth", authRouter);

const contentRouter = safeRequire("./routes/content");
if (contentRouter) app.use("/api/content", contentRouter);

const activitiesRouter = safeRequire("./routes/activities");
if (activitiesRouter) app.use("/api/activities", activitiesRouter);

const uploadsRouter = safeRequire("./routes/uploads");
if (uploadsRouter) app.use("/api/uploads", uploadsRouter);

const usersRouter = safeRequire("./routes/users");
if (usersRouter) app.use("/api/users", usersRouter);

/* ------------------------- start --------------------------- */
// IMPORTANT: bind to 0.0.0.0 so Railway can reach it
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[READY] API listening on port ${PORT}`);
  console.log("Try /health and /health/db");
});

/* ------------------------- safety -------------------------- */
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

app.use("/api/auth", require("./routes/auth"));
