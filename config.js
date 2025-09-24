// Your public API domain (NO trailing slash)
window.API_BASE = "https://smart-atheneum-lms-production.up.railway.app";

// Your endpoints
window.API = { REGISTER: "/api/auth/register", LOGIN: "/api/auth/login" };

// Guard: fail fast if misconfigured
(function () {
  const b = (window.API_BASE || "").trim();
  if (!b || !b.startsWith("https://")) {
    alert("API_BASE is missing or invalid. Set it in config.js.");
  }
})();