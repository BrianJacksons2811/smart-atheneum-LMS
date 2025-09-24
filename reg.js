// ---------- Registration wiring (clean + API-ready) ----------
(function () {
  const btn         = document.getElementById("registerBtn");
  if (!btn) return;

  const firstName   = document.getElementById("firstName");
  const lastName    = document.getElementById("lastName");
  const regEmail    = document.getElementById("regEmail");
  const grade       = document.getElementById("grade");
  const dob         = document.getElementById("dob");
  const regPassword = document.getElementById("regPassword");
  const regConfirm  = document.getElementById("regConfirm");
  const regError    = document.getElementById("regError");
  const successMsg  = document.getElementById("successMsg");

  // ---- API base & endpoints (don’t overwrite window.API if already set in config.js)
  const DEFAULT_BASE = "https://smart-atheneum-lms-production.up.railway.app";
  const BASE = ((window.API_BASE || DEFAULT_BASE) + "").trim().replace(/\/+$/, ""); // no trailing slash
  const ENDPOINTS = window.API ? window.API : { REGISTER: "/api/auth/register", LOGIN: "/api/auth/login" };

  function showErr(m) {
    if (regError) { regError.textContent = m; regError.style.display = "block"; }
    if (successMsg) successMsg.style.display = "none";
  }
  function showOK(m) {
    if (successMsg) { successMsg.textContent = m; successMsg.style.display = "block"; }
    if (regError) regError.style.display = "none";
  }
  const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  async function safeJson(res) { try { return await res.json(); } catch { return null; } }

  async function apiRegister(payload) {
    if (!BASE || !BASE.startsWith("http")) throw new Error("API not configured. Set window.API_BASE in config.js.");
    const url = BASE + ENDPOINTS.REGISTER;

    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const body = await safeJson(r);
        const msg =
          body?.message ||
          (r.status === 409 ? "Account already exists." : `Registration failed (${r.status})`);
        throw new Error(msg);
      }

      return (await safeJson(r)) || {};
    } catch (e) {
      if (e.name === "TypeError") {
        throw new Error("Could not reach the API. Check your API domain, CORS, or server logs.");
      }
      throw e;
    }
  }

  btn.addEventListener("click", async () => {
    const email = regEmail.value.trim();
    const pass  = regPassword.value;
    const conf  = regConfirm.value;

    if (!firstName.value.trim() || !lastName.value.trim()) return showErr("Please enter your first and last name.");
    if (!validEmail(email)) return showErr("Please enter a valid email address.");
    if (!grade.value) return showErr("Please select your grade level.");
    if (!dob.value) return showErr("Please select your date of birth.");
    if (pass.length < 6) return showErr("Password should be at least 6 characters.");
    if (pass !== conf)   return showErr("Passwords do not match.");

    const payload = {
      fullName: `${firstName.value.trim()} ${lastName.value.trim()}`.trim(),
      email,
      password: pass,
      role: "student",
      gradeCode: grade.value,
      dob: dob.value
    };

    btn.disabled = true;
    btn.textContent = "Creating…";
    // inside try { ... } after the fetch call:
     if (!r.ok) {
  const txt = await r.text().catch(()=>"");
  return showErr(txt || `Registration failed (${r.status})`);
   }

   // ✅ redirect on any 2xx – don’t wait for JSON
   showOK("✅ Account registered! Redirecting…");
   setTimeout(() => { window.location.href = "login.html?registered=1"; }, 800);
    return;

  });
})();

console.log("[REG] BASE =", BASE);
console.log("[REG] REGISTER URL =", BASE + ENDPOINTS.REGISTER);
console.log("[REG] status =", r.status);
        