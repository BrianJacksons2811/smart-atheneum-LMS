
async function sendResetLink() {
  const emailInput = document.getElementById("email").value.trim();
  const messageBox = document.getElementById("message");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(emailInput)) {
    messageBox.textContent = "Please enter a valid email address.";
    messageBox.className = "message error";
    messageBox.style.display = "block";
    return;
  }

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to send');

    messageBox.textContent = `If an account exists for ${emailInput}, a reset link has been sent.`;
    messageBox.className = "message success";
  } catch (e) {
    messageBox.textContent = e.message || 'Something went wrong.';
    messageBox.className = "message error";
  }
  messageBox.style.display = "block";
  document.getElementById("email").value = "";
}

