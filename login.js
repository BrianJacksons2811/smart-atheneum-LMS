// ---------- Login wiring (clean + API-ready) ----------



  // Hard-lock the Sign-Up link to reg.html and bypass any global interceptors
  (function () {
    const a = document.getElementById('signupLink');
    if (!a) return;

    a.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();        // ignore any global click handlers
      window.location.assign('./reg.html');
    });
  })();


(function () {
  const form       = document.getElementById("loginForm");
  if (!form) return;

  const email      = document.getElementById("loginEmail");
  const pass       = document.getElementById("loginPassword");
  const err        = document.getElementById("loginError");
  const banner     = document.getElementById("loginBanner");          // optional <div id="loginBanner">
  const toggleIcon = document.getElementById("toggleLoginPassword");  // eye icon

  // Show banner if redirected from registration
  const params = new URLSearchParams(window.location.search);
  if (params.get("registered") === "1" && banner) banner.style.display = "block";

  // ---- API base & endpoints (do NOT overwrite window.API if it already exists)
  const DEFAULT_BASE = "https://smart-atheneum-lms-production.up.railway.app";
  const BASE = ((window.API_BASE || DEFAULT_BASE) + "").trim().replace(/\/+$/, ""); // no trailing slash
  const ENDPOINTS = window.API ? window.API : { REGISTER: "/api/auth/register", LOGIN: "/api/auth/login" };

  // Debug (remove later)
  console.log("[LOGIN] BASE =", BASE);
  console.log("[LOGIN] URL  =", BASE + ENDPOINTS.LOGIN);

  function showErr(m) { if (err) { err.textContent = m; err.style.display = "block"; } }
  function hideErr()  { if (err) err.style.display = "none"; }
  const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  async function safeJson(res) { try { return await res.json(); } catch { return null; } }

  async function apiLogin(payload) {
    if (!BASE || !BASE.startsWith("http")) throw new Error("API not configured. Set window.API_BASE in config.js.");

    const url = BASE + ENDPOINTS.LOGIN;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log("[LOGIN] status =", r.status);

      if (!r.ok) {
        const body = await safeJson(r);
        const msg =
          body?.message ||
          (r.status === 404 ? "No account found. Please register first." :
           r.status === 401 ? "Incorrect email or password." :
           `Login failed (${r.status})`);
        throw new Error(msg);
      }

      return (await safeJson(r)) || {};
    } catch (e) {
      if (e.name === "TypeError") {
        throw new Error("Could not reach the API. Check your domain, CORS, or server logs.");
      }
      throw e;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideErr();

    const mail = email.value.trim();
    const pwd  = pass.value;

    if (!validEmail(mail)) return showErr("Please enter a valid email.");
    if (!pwd || pwd.length < 6) return showErr("Password must be at least 6 characters.");

    try {
      const data = await apiLogin({ email: mail, password: pwd });

      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user)  localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Friendly confirmation — proves name is stored
      const firstName = (data?.user?.fullName || "").split(" ")[0] || "there";
      alert(`Welcome back, ${firstName}!`);

      const role = data?.user?.role || "student";
      window.location.href = role === "teacher" ? "teach-dash.html" : "Dash-student.html";
    } catch (e) {
      showErr(e.message || "Login failed. Please try again.");
    }
  });

  // Toggle password visibility
  if (toggleIcon) {
    toggleIcon.addEventListener("click", () => {
      const type = pass.getAttribute("type") === "password" ? "text" : "password";
      pass.setAttribute("type", type);
      toggleIcon.classList.toggle("bx-show");
      toggleIcon.classList.toggle("bx-hide");
    });
  }
})();
