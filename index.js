//Reg js

// ---------- Registration wiring (UPDATED → uses API) ----------
(function(){
  const btn = document.getElementById("registerBtn");
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

  function showErr(m){ if(regError){regError.textContent=m; regError.style.display="block";} if(successMsg) successMsg.style.display="none"; }
  function showOK(m){ if(successMsg){successMsg.textContent=m; successMsg.style.display="block";} if(regError) regError.style.display="none"; }

  btn.addEventListener("click", async () => {
    const email = regEmail.value.trim();
    const pass  = regPassword.value;
    const conf  = regConfirm.value;

    if (pass.length < 6) return showErr("Password should be at least 6 characters.");
    if (pass !== conf)   return showErr("Passwords do not match.");

    // Your backend expects (from controllers) a user payload; mapping common fields:
    const payload = {
      fullName: `${firstName.value.trim()} ${lastName.value.trim()}`.trim(),
      email,
      password: pass,
      role: "student",         // change if you add a role selector
      gradeCode: grade.value,  // maps your “grade” to backend gradeCode
      subjectMain: ""          // optional; fill if you capture a major subject
    };

    try {
      btn.disabled = true;
      await apiRegister(payload);
      showOK("✅ Account registered successfully! Redirecting to login…");
      setTimeout(() => { window.location.href = "login.html"; }, 1200);
    } catch (e) {
      showErr(e.message || "Registration failed. Please try again.");
    } finally {
      btn.disabled = false;
    }
  });
})();


  // Reset styles
  password.style.borderColor = "#3b3b4f";
  confirmPassword.style.borderColor = "#3b3b4f";

  if (password.value !== confirmPassword.value) {
    alert("❌ Passwords do not match. Please try again.");
    password.style.borderColor = "red";
    confirmPassword.style.borderColor = "red";
    return;
  }

  alert("✅ Registration successful!");
  this.submit();

   document.getElementById("registerForm").addEventListener("submit", function(event) {
      event.preventDefault(); // stop normal form action

      const successMsg = document.getElementById("successMsg");
      successMsg.style.display = "block"; // show success text

      // redirect to login after 3s
      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
    });

  // hide success message by default
  const successMsg = document.getElementById('successMsg');
  successMsg.style.display = 'none';

  function showForm(redirectUrl) {
    // prevent the form from submitting
    event.preventDefault();

    // Show the success message
    successMsg.style.display = 'block';

    // Redirect to login after 2-3 seconds
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000); // 2000ms = 2 seconds
  }


//Login js

// ---------- Login wiring (UPDATED → uses API) ----------
(function(){
  const form = document.getElementById("loginForm");
  if (!form) return;

  const email = document.getElementById("loginEmail");
  const pass  = document.getElementById("loginPassword");
  const err   = document.getElementById("loginError");

  function showErr(m){ if(err){ err.textContent = m; err.style.display = "block"; } }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (err) err.style.display = "none";

    try {
      const data = await apiLogin({ email: email.value.trim(), password: pass.value });
      // store token for authenticated pages (Authorization: Bearer <token>)
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user)  localStorage.setItem("currentUser", JSON.stringify(data.user));

      const role = data?.user?.role || "student";
      window.location.href = (role === "teacher") ? "teach-dash.html" : "Dash-student.html";
    } catch (e) {
      // If user doesn’t exist → “sign up first”; wrong password → “Incorrect…”
      showErr(e.message || "Login failed. Please try again.");
    }
  });
})();





/* ===== API glue (NEW) ===== */
const BASE = window.API_BASE;
const ENDPOINTS = window.API || { REGISTER: "/api/auth/register", LOGIN: "/api/auth/login" };

async function safeJson(res){ try { return await res.json(); } catch { return null; } }

async function apiRegister(payload){
  const r = await fetch(BASE + ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const e = await safeJson(r);
    throw new Error(e?.message || (r.status === 409 ? "Account already exists." : `Registration failed (${r.status})`));
  }
  return await safeJson(r); // { token, user }
}

async function apiLogin(payload){
  const r = await fetch(BASE + ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const e = await safeJson(r);
    // 404/400/401 → “sign up first” or invalid password
    throw new Error(e?.message || (r.status === 404 ? "No account found. Please sign up first." :
                                   r.status === 401 ? "Incorrect email or password." :
                                   `Login failed (${r.status})`));
  }
  return await safeJson(r); // { token, user }
}


document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault(); 

  const email = document.querySelector("input[type='username']");
  const password = document.querySelector("input[type='password']");

  // Reset styles
  email.style.borderColor = "rgba(255,255,255,.2)";
  password.style.borderColor = "rgba(255,255,255,.2)";

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    alert("⚠️ Please enter a valid email address (e.g., user@example.com).");
    email.style.borderColor = "red";
    return;
  }

  // Password validation 
  const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharPattern.test(password.value)) {
    alert("⚠️ Password must contain at least one special character (!@#$%^&* etc.).");
    password.style.borderColor = "red";
    return;
  }

  alert(`✅ Welcome back, ${email.value.trim()}!`);
    this.submit();
});


const togglePassword = document.getElementById("toggleLoginPassword");
const passwordInput = document.getElementById("loginPassword");

togglePassword.addEventListener("click", () => {
  // Toggle password visibility
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  // Toggle icon between eye and eye-slash
  togglePassword.classList.toggle("bx-show");
  togglePassword.classList.toggle("bx-hide");
});

// subject student dashboard js

  function redirectToSubject(subject) {
            switch(subject) {
                case 'math':
                    window.location.href = 'math.html';
                    break;
                case 'maths-lit':
                    window.location.href = 'mathlit.html';
                    break;
                case 'accountings':
                    window.location.href = 'accountings.html';
                    break;
                case 'physci':
                    window.location.href = 'physci.html';
                    break;
                case 'tourisms':
                    window.location.href = 'tourisms.html';
                    break;
                case 'agri':
                    window.location.href = 'agri.html';
                    break;
                case 'geography':
                    window.location.href = 'geography.html';
                    break;
                case 'lifesci':
                    window.location.href = 'lifesci.html';
                    break;
                case 'history':
                    window.location.href = 'history.html';
                    break;
                default:
                    alert('Subject page not found!');
            }
        }

