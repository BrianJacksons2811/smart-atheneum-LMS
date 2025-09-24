
        let currentUser = null;

    
        function updateWelcomeMessage() {
            if (currentUser) {
                const welcomeMessages = [
                    `Welcome back, ${currentUser}`,
                    `Great to see you again, ${currentUser}`,
                    `${currentUser}, ready to learn today?`,
                    `Hi ${currentUser}, let's continue your journey`,
                    `${currentUser}, your progress looks great!`
                ];
                
                const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
                document.getElementById('welcomeMessage').textContent = randomMessage;
            } else {
                
                const genericMessages = [
                    "Welcome Back to Smart Atheneum LMS",
                    "Ready to learn today?",
                    "Your learning journey starts here",
                    "Let's achieve your academic goals",
                    "Smart learning for bright futures"
                ];
                
                const randomMessage = genericMessages[Math.floor(Math.random() * genericMessages.length)];
                document.getElementById('welcomeMessage').textContent = randomMessage;
            }
        }
        
        function initDashboard() {
            
            updateWelcomeMessage();
            checkNotifications();
            
            document.getElementById('coursesCount').textContent = '0';
            document.getElementById('assignmentsCount').textContent = '0';
            document.getElementById('gpaCount').textContent = '0.0';
            document.getElementById('attendanceCount').textContent = '0%';
        }

    
        window.onload = initDashboard;

        // Profile Circle dropdown toggle
const profileCircle = document.getElementById("profileCircle");
const dropdownMenu = document.getElementById("dropdownMenu");

// Toggle dropdown on click
profileCircle.addEventListener("click", () => {
  dropdownMenu.style.display =
    dropdownMenu.style.display === "block" ? "none" : "block";
});

// Close dropdown if clicked outside
document.addEventListener("click", (event) => {
  if (!profileCircle.contains(event.target) && !dropdownMenu.contains(event.target)) {
    dropdownMenu.style.display = "none";
  }
});

// Handle Profile and Logout actions
document.getElementById("goProfile").addEventListener("click", () => {
  alert("Profile page will open here once users are registered.");
  // Later: window.location.href = "/profile.html";
});

document.getElementById("logout").addEventListener("click", () => {
  alert("User logged out (placeholder).");
});

// Placeholder for initials when user registers
function setUserInitials(initials) {
  profileCircle.textContent = initials;
}


        // Run once the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  
  // Handle Enter Classroom buttons
  const classroomButtons = document.querySelectorAll(".enter-btn");
  classroomButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const subject = btn.parentElement.querySelector(".subject-title").textContent;
      alert(`Entering ${subject} classroom...`);
      
    });
  });

  // Quick Actions
  document.getElementById("viewSchedule").addEventListener("click", () => {
    alert("Schedule page will be available soon!");
  });

  document.getElementById("submitAssignment").addEventListener("click", () => {
    alert("Assignment submission page will be available soon!");
  });

  document.getElementById("messageTeacher").addEventListener("click", () => {
    alert("Messaging system coming soon!");
  });

  // Placeholder: No assignments yet
  const dueSoon = document.getElementById("dueSoon");
  dueSoon.querySelector("p").textContent = "No assignments yet 🎉";

  // Placeholder: No progress data yet
  const progress = document.getElementById("progress");
  progress.querySelector("p").textContent = "Your progress will appear here once you start.";
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

