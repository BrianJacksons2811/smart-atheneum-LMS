// server.js — Smart Atheneum API (MySQL Edition, Railway-safe)
console.log("[BOOT] Starting Smart Atheneum API…");
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

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

/* ------------ mailer ------------- */
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true", // true for 465
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

/* ------------ middleware ---------- */
app.use(
  cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : "*",
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
// Optional modular routers (if these files exist)
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

/* ------------ BUILT-IN AUTH endpoints (forgot/reset) ---- */
/** Request password reset: user submits email */
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ ok: false, error: "Email required" });
    if (!pool) return res.status(500).json({ ok: false, error: "DB not initialized" });

    const [users] = await pool.query("SELECT id, full_name FROM users WHERE email = ?", [email]);
    if (!users || users.length === 0) {
      // Do not reveal whether email exists
      return res.json({ ok: true });
    }
    const user = users[0];

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      "INSERT INTO password_resets (user_id, token_hash, expires_at, used) VALUES (?, ?, ?, 0)",
      [user.id, tokenHash, expiresAt]
    );

    const base = process.env.FRONTEND_URL || "https://smart-atheneum-lms-production.up.railway.app"; // e.g., https://<your-app>.railway.app
    const resetUrl = `${base}/reset-forgot.html?token=${token}&id=${user.id}`;

    await mailer.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your password",
      html: `
        <p>Hi ${user.full_name || "there"},</p>
        <p>Click the link below to reset your password (valid 1 hour):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("Email error:", e);
    res.status(500).json({ ok: false, error: "Failed to send reset email" });
  }
});

/** Reset password: user posts new password with token */
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;
    if (!userId || !token || !newPassword)
      return res.status(400).json({ ok: false, error: "Missing fields" });
    if (!pool) return res.status(500).json({ ok: false, error: "DB not initialized" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const [rows] = await pool.query(
      "SELECT id, expires_at, used FROM password_resets WHERE user_id = ? AND token_hash = ? ORDER BY id DESC LIMIT 1",
      [userId, tokenHash]
    );
    if (!rows || rows.length === 0) return res.status(400).json({ ok: false, error: "Invalid link" });

    const rec = rows[0];
    if (rec.used) return res.status(400).json({ ok: false, error: "Link already used" });
    if (new Date(rec.expires_at) < new Date()) return res.status(400).json({ ok: false, error: "Link expired" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, userId]);
    await pool.query("UPDATE password_resets SET used = 1 WHERE id = ?", [rec.id]);

    res.json({ ok: true });
  } catch (e) {
    console.error("Reset error:", e);
    res.status(500).json({ ok: false, error: "Failed to reset password" });
  }
});

/* ------------ STATIC AFTER API ---- */
/** Block sensitive folders/files from being served */
const BLOCKED_PREFIXES = ["/Backend", "/node_modules"];
app.use((req, res, next) => {
  if (BLOCKED_PREFIXES.some((p) => req.path.startsWith(p)) || req.path === "/.env") {
    return res.status(404).end();
  }
  next();
});

/** Public asset folders you actually use */
app.use("/Images", express.static(path.join(__dirname, "Images")));
app.use("/content", express.static(path.join(__dirname, "content"))); // keep if you reference /content/*

/** Serve root-level HTML pages (NO moving needed) */
// Change to 'index.html' if that’s your landing file
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// Allow /something.html to load root files safely
app.get("/:page.html", (req, res, next) => {
  if (BLOCKED_PREFIXES.some((p) => req.params.page.startsWith(p.slice(1)))) return res.status(404).end();
  res.sendFile(path.join(__dirname, `${req.params.page}.html`), (err) => (err ? next() : null));
});

/* ------------ 404 & errors -------- */
app.use((req, res) =>
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` })
);
app.use((err, _req, res, _next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

/* ------------ start --------------- */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[READY] API listening on port ${PORT}`);
  console.log("Try GET /health and POST /api/auth/forgot-password");
});

process.on("unhandledRejection", (err) => console.error("UNHANDLED:", err));
process.on("uncaughtException", (err) => console.error("UNCAUGHT:", err));
