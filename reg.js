// /js/reg.js
// ---------- Registration wiring (clean + API-ready) ----------

// Base URL: same-origin by default; override by defining window.API_BASE (no trailing slash)
const DEFAULT_BASE = window.location.origin;
const BASE = String((window.API_BASE || DEFAULT_BASE)).trim().replace(/\/+$/, "");

// API endpoints (override by defining window.API = { REGISTER: "...", LOGIN: "..." })
const ENDPOINTS = window.API || {
  REGISTER: "/api/auth/register",
  LOGIN: "/login.html"
};

const form = document.getElementById("regForm");
const btn  = document.getElementById("registerBtn");
const msg  = document.getElementById("msg");       // optional single message area
const regError   = document.getElementById("regError");   // optional
const successMsg = document.getElementById("successMsg"); // optional

// Inputs (ids must exist in reg.html)
const firstName   = document.getElementById("firstName");
const lastName    = document.getElementById("lastName");
const regEmail    = document.getElementById("regEmail");
const grade       = document.getElementById("grade");
const genderEl    = document.getElementById("gender");
const dob         = document.getElementById("dob");
const regPassword = document.getElementById("regPassword");
const regConfirm  = document.getElementById("regConfirm");

// ---- helpers ----
function setMsg(el, text, kind) {
  if (!el) return;
  el.textContent = text;
  el.style.display = text ? "block" : "none";
  el.className = kind ? `msg ${kind}` : "msg";
}
function showErr(text) {
  if (msg) setMsg(msg, text, "error");
  if (regError) setMsg(regError, text, "error");
  if (successMsg) setMsg(successMsg, "", "");
}
function showOK(text) {
  if (msg) setMsg(msg, text, "success");
  if (successMsg) setMsg(successMsg, text, "success");
  if (regError) setMsg(regError, "", "");
}
const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
async function safeJson(res) { try { return await res.json(); } catch { return null; } }

async function apiRegister(payload) {
  if (!BASE || !/^https?:\/\//.test(BASE)) {
    throw new Error("API base not configured correctly.");
  }
  const url = BASE + ENDPOINTS.REGISTER;

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Try to parse response (even on non-2xx)
  const data = await safeJson(r);

  if (!r.ok) {
    // If backend sends {error/message}, surface it; handle 409 separately
    const msg =
      data?.message ||
      data?.error ||
      (r.status === 409 ? "Account already exists." : `Registration failed (${r.status})`);
    throw new Error(msg);
  }
  return data || {};
}

function collectAndValidate() {
  const fn = (firstName?.value || "").trim();
  const ln = (lastName?.value || "").trim();
  const email = (regEmail?.value || "").trim();
  const pass  = regPassword?.value || "";
  const conf  = regConfirm?.value || "";

  if (!fn || !ln)                 return { error: "Please enter your first and last name." };
  if (!validEmail(email))         return { error: "Please enter a valid email address." };
  if (!grade?.value)              return { error: "Please select your grade level." };
  if (!dob?.value)                return { error: "Please select your date of birth." };
  if (pass.length < 6)            return { error: "Password should be at least 6 characters." };
  if (pass !== conf)              return { error: "Passwords do not match." };

  // IMPORTANT: backend expects full_name, email, password
  const payload = {
    full_name: `${fn} ${ln}`.trim(),
    email,
    password: pass,

    // Optional extras (only used if your backend stores them)
    role: "student",
    gradeCode: grade.value,
    gender: genderEl ? (genderEl.value || null) : null,
    dob: dob.value
  };

  return { payload };
}

async function handleSubmit(e) {
  e?.preventDefault?.();

  const { error, payload } = collectAndValidate();
  if (error) return showErr(error);

  if (btn) { btn.disabled = true; btn.dataset._txt = btn.textContent; btn.textContent = "Creating…"; }
  showOK("Creating your account…");

  try {
    await apiRegister(payload);
    showOK("✅ Account created! Redirecting to sign in…");
    setTimeout(() => {
      // If you need to pass a flag:
      window.location.href = ENDPOINTS.LOGIN + "?registered=1";
    }, 700);
  } catch (err) {
    showErr(err?.message || "Registration failed. Please try again.");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset._txt || "Create Account"; }
  }
}

// Bind both button click and form submit (better accessibility)
if (btn)   btn.addEventListener("click", handleSubmit);
if (form)  form.addEventListener("submit", handleSubmit);

// Debug prints (optional)
console.log("[REG] BASE =", BASE);
console.log("[REG] REGISTER URL =", BASE + ENDPOINTS.REGISTER);
