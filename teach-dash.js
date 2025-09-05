// DOM helper function
function $(selector) {
    return document.querySelector(selector);
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Quick action buttons
    const qaCreate = document.getElementById('qa-create');
    const qaSchedule = document.getElementById('qa-schedule');
    const qaGrade = document.getElementById('qa-grade');
    
    if (qaCreate) qaCreate.addEventListener('click', () => showModal('modal-assignment'));
    if (qaSchedule) qaSchedule.addEventListener('click', () => showModal('modal-schedule'));
    if (qaGrade) qaGrade.addEventListener('click', () => showModal('modal-grade'));
    
    // Close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    });
    
    // File upload handling
    const uploadDevice = document.getElementById('upload-device');
    const hiddenFile = document.getElementById('hidden-file');
    
    if (uploadDevice && hiddenFile) {
        uploadDevice.addEventListener('click', () => {
            hiddenFile.value = '';
            hiddenFile.click();
        });
        
        hiddenFile.addEventListener('change', () => {
            if (hiddenFile.files.length > 0) {
                alert(`Selected: ${hiddenFile.files[0].name}`);
            }
        });
    }
    
    // Cloud upload placeholder
    const uploadCloud = document.getElementById('upload-cloud');
    if (uploadCloud) {
        uploadCloud.addEventListener('click', () => showModal('modal-cloud'));
    }
    
    // Save assignment placeholder
    const saveAssignment = document.getElementById('save-assignment');
    if (saveAssignment) {
        saveAssignment.addEventListener('click', () => {
            alert('Assignment saved (placeholder).');
            hideModal('modal-assignment');
        });
    }
});

// Navigate to course page
function goToCourse(subject) {
    // For demonstration, just show an alert
    alert(`Navigating to ${subject} course page`);
    // In a real implementation:
    window.location.href = `content.html?subject=${encodeURIComponent(subject)}`;
}

function goToCourse(subject) {
  const map = {
    "Mathematics": "Mathematics-teach",
    "Maths Literacy": "Maths-lit-teach",
    "History": "history-teach",
    "Accounting": "Accounting-teach",
    "Geography": "Geography-teach",
    "Agricultural Science": "Agricultural-teach",
    "Tourism": "Tourism",
    "Physical Science": "Physical science-teach",
    "Life Sciences": "Life-sciences-teach"
  };
  if (map[subject]) {
    window.location.href = `courses/${map[subject]}/index.html`;
  }
}
