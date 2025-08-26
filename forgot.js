function sendResetLink() {
  const emailInput = document.getElementById("email").value.trim();
  const messageBox = document.getElementById("message");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(emailInput)) {
    messageBox.textContent = "Please enter a valid email address.";
    messageBox.className = "message error";
    messageBox.style.display = "block";
    return;
  }

  messageBox.textContent = `A password reset link has been sent to ${emailInput}`;
  messageBox.className = "message success";
  messageBox.style.display = "block";

  document.getElementById("email").value = "";
}
