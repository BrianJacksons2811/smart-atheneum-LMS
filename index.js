//Reg js

document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault(); // 

  const password = document.querySelector("input[name='password']");
  const confirmPassword = document.querySelector("input[name='confirmPassword']");

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
});

//Login js

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

