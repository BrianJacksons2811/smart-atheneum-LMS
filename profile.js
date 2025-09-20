const profilePic = document.getElementById("profilePic");
const uploadBtn = document.getElementById("uploadBtn");
const uploadInput = document.getElementById("uploadPic");

const username = document.getElementById("username");
const email = document.getElementById("email");
const grade = document.getElementById("grade");

// Modal elements
const modal = document.getElementById("modal");
const editBtn = document.getElementById("editBtn");
const closeModal = document.getElementById("closeModal");
const profileForm = document.getElementById("profileForm");

// Form inputs
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const gradeInput = document.getElementById("gradeInput");

// === Load saved data from localStorage ===
window.addEventListener("DOMContentLoaded", () => {
  const savedPic = localStorage.getItem("profilePic");
  if (savedPic) profilePic.src = savedPic;

  const savedName = localStorage.getItem("username");
  if (savedName) username.textContent = savedName;

  const savedEmail = localStorage.getItem("email");
  if (savedEmail) email.textContent = savedEmail;

  const savedGrade = localStorage.getItem("grade");
  if (savedGrade) grade.textContent = savedGrade;
});

// === Profile Picture Upload ===
uploadBtn.addEventListener("click", () => {
  uploadInput.click();
});

uploadInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      profilePic.src = e.target.result;
      localStorage.setItem("profilePic", e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

// === Open/Close Modal ===
editBtn.addEventListener("click", () => {
  nameInput.value = username.textContent === "(No Name Yet)" ? "" : username.textContent;
  emailInput.value = email.textContent === "(No Email Yet)" ? "" : email.textContent;
  gradeInput.value = grade.textContent === "(not set)" ? "" : grade.textContent;
  modal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal if clicked outside
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// === Save Profile Data ===
profileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newName = nameInput.value.trim() || "(No Name Yet)";
  const newEmail = emailInput.value.trim() || "(No Email Yet)";
  const newGrade = gradeInput.value.trim() || "(not set)";

  username.textContent = newName;
  email.textContent = newEmail;
  grade.textContent = newGrade;

  // Save to localStorage
  localStorage.setItem("username", newName);
  localStorage.setItem("email", newEmail);
  localStorage.setItem("grade", newGrade);

  modal.style.display = "none";
});

