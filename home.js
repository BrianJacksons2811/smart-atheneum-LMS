// ------- Router for "Enter Classroom" -------
function toSlug(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function goToCourse(subjectName) {
  const slug = toSlug(subjectName);
  window.location.href = `course.html?subject=${encodeURIComponent(slug)}`;
}

// Attach click handlers (works for all buttons)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".enter-classroom");
  if (!btn) return;
  const subject = btn.dataset.subject || btn.closest("[data-subject]")?.dataset.subject;
  if (subject) goToCourse(subject);
});
// ------- End of Router -------

// ------- Profile Dropdown ------- -------
const profileCircle = document.querySelector(".profile-circle");
const dropdownMenu = document.querySelector(".dropdown-menu");      
profileCircle.addEventListener("click", () => {
  dropdownMenu.classList.toggle("show");
});

// Close the dropdown if the user clicks outside of it
window.addEventListener("click", (event) => {
  if (!event.target.matches('.profile-circle') && !event.target.closest('.dropdown-menu')) {
    if (dropdownMenu.classList.contains('show')) {
      dropdownMenu.classList.remove('show');
    }
  }
});
// ------- End of Profile Dropdown -------      

z

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

