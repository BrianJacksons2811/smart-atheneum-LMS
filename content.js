/* Course Content JS
   - handles: save content, device/cloud uploads (simulated), voice recording with timer,
     previews (video/audio), delete items, and updating Recent Activities sidebar.
*/

// DOM references
const topicInput = document.getElementById('topicInput');
const contentInput = document.getElementById('contentInput');
const saveBtn = document.getElementById('saveBtn');
const recentList = document.getElementById('recentList');
const activityCount = document.getElementById('activityCount');

const filePicker = document.getElementById('filePicker');
const cloudModal = document.getElementById('cloudModal');
const cloudClose = document.getElementById('cloudClose');
const pickDrive = document.getElementById('pickDrive');
const pickDropbox = document.getElementById('pickDropbox');

let activities = []; // holds activity objects
let currentUploadMeta = null; // {type: 'textbook'|'exam'|'video', source: 'device'|'cloud'}

// enable save only when content has text
contentInput.addEventListener('input', () => {
  saveBtn.disabled = contentInput.value.trim().length === 0;
});

// Save content -> add to activities
saveBtn.addEventListener('click', () => {
  const topic = topicInput.value.trim() || '(no topic specified)';
  const contentPreview = contentInput.value.trim().slice(0, 120);
  const ts = new Date();
  const item = {
    id: crypto.randomUUID(),
    type: 'content',
    title: topic,
    text: contentPreview,
    time: ts.toISOString()
  };
  activities.unshift(item);
  renderActivities();
  // UI feedback
  contentInput.value = '';
  topicInput.value = '';
  saveBtn.disabled = true;
  alert('Content saved — check Recent Activities.');
});

// handle upload buttons (delegation)
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.matches('button[data-upload-type]')) {
    const type = t.dataset.uploadType; // textbook | exam | video
    const source = t.dataset.source; // device | cloud
    currentUploadMeta = { type, source };
    if (source === 'device') {
      filePicker.accept = type === 'video' ? 'video/*' : '';
      filePicker.multiple = false;
      filePicker.click();
    } else {
      // show cloud modal (simulated) - will open file picker after choice
      openCloudModal();
    }
  }
});

// file picker change -> attach file
filePicker.addEventListener('change', async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f || !currentUploadMeta) return;
  const { type } = currentUploadMeta;

  if (type === 'video') {
    await addVideoFile(f);
  } else if (type === 'textbook') {
    addGenericFile(f, 'textbookList', 'textbook');
  } else if (type === 'exam') {
    addGenericFile(f, 'examList', 'exam');
  }

  // push activity
  activities.unshift({
    id: crypto.randomUUID(),
    type: type === 'video' ? 'video' : 'file',
    title: f.name,
    time: new Date().toISOString()
  });
  renderActivities();

  // cleanup
  currentUploadMeta = null;
  filePicker.value = '';
});

// Add generic file to list (textbook/exam)
function addGenericFile(file, listId, kind) {
  const list = document.getElementById(listId);
  const li = document.createElement('li');
  li.innerHTML = `<span class="fname">${file.name}</span>
                  <div class="file-actions">
                    <button class="btn" data-download>Download</button>
                    <button class="btn-outline" data-delete>Delete</button>
                  </div>`;
  // download (create object URL)
  const url = URL.createObjectURL(file);
  li.querySelector('[data-download]').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
  });
  // delete
  li.querySelector('[data-delete]').addEventListener('click', () => {
    if (confirm('Delete this file?')) {
      li.remove();
    }
  });
  list.prepend(li);
}

// Add video file with preview + delete
async function addVideoFile(file) {
  const area = document.getElementById('videoPreviewArea');
  const container = document.createElement('div');
  container.className = 'video-container';

  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  video.width = 400;
  video.style.borderRadius = '8px';
  video.style.maxWidth = '100%';

  const controls = document.createElement('div');
  controls.className = 'video-controls';
  const del = document.createElement('button');
  del.className = 'btn-outline';
  del.textContent = 'Delete';
  del.addEventListener('click', () => {
    if (confirm('Delete this video?')) {
      URL.revokeObjectURL(url);
      container.remove();
    }
  });

  controls.appendChild(del);
  container.appendChild(video);
  container.appendChild(controls);
  area.prepend(container);
}

// Cloud choices (simulate by opening file picker)
function openCloudModal() {
  cloudModal.style.display = 'flex';
}
cloudClose.addEventListener('click', () => cloudModal.style.display = 'none');

pickDrive.addEventListener('click', () => {
  cloudModal.style.display = 'none';
  // simulate cloud selection by opening picker
  filePicker.accept = currentUploadMeta && currentUploadMeta.type === 'video' ? 'video/*' : '';
  filePicker.click();
});
pickDropbox.addEventListener('click', () => {
  cloudModal.style.display = 'none';
  filePicker.accept = currentUploadMeta && currentUploadMeta.type === 'video' ? 'video/*' : '';
  filePicker.click();
});

// ---------- Voice recording with timer, save, delete ----------
let mediaRecorder = null;
let audioChunks = [];
const recBtn = document.getElementById('recBtn');
const stopRecBtn = document.getElementById('stopRecBtn');
const recTimer = document.getElementById('recTimer');
const recordingsArea = document.getElementById('recordingsArea');

let recInterval = null;
let recSeconds = 0;

function formatTime(s){
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const sec = (s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

recBtn.addEventListener('click', async () => {
  // Start recording
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      createRecordingItem(url, blob);
      audioChunks = [];
      // add activity
      activities.unshift({
        id: crypto.randomUUID(),
        type: 'recording',
        title: `Recording ${new Date().toLocaleString()}`,
        time: new Date().toISOString()
      });
      renderActivities();
    };
    mediaRecorder.start();
    recBtn.classList.add('recording');
    recBtn.textContent = 'Recording...';
    recBtn.disabled = true;
    stopRecBtn.disabled = false;

    // timer
    recSeconds = 0;
    recTimer.textContent = formatTime(recSeconds);
    recInterval = setInterval(() => {
      recSeconds++;
      recTimer.textContent = formatTime(recSeconds);
    }, 1000);
  } catch (err) {
    alert('Microphone access denied or not available.');
    console.error(err);
  }
});

stopRecBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  clearInterval(recInterval);
  recTimer.textContent = '00:00';
  recBtn.classList.remove('recording');
  recBtn.textContent = 'Record';
  recBtn.disabled = false;
  stopRecBtn.disabled = true;
});

// create recording DOM item with play/download/delete
function createRecordingItem(url, blob){
  const wrapper = document.createElement('div');
  wrapper.className = 'recording-item';

  const audio = document.createElement('audio');
  audio.src = url;
  audio.controls = true;
  audio.style.display = 'block';

  const actions = document.createElement('div');
  actions.className = 'file-actions';
  const dl = document.createElement('button');
  dl.className = 'btn';
  dl.textContent = 'Download';
  dl.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
  });

  const del = document.createElement('button');
  del.className = 'btn-outline';
  del.textContent = 'Delete';
  del.addEventListener('click', () => {
    if (confirm('Delete this recording?')) {
      URL.revokeObjectURL(url);
      wrapper.remove();
    }
  });

  actions.appendChild(dl);
  actions.appendChild(del);
  wrapper.appendChild(audio);
  wrapper.appendChild(actions);
  recordingsArea.prepend(wrapper);
}

// render recent activities
function renderActivities(){
  recentList.innerHTML = '';
  activities.forEach(act => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    const right = document.createElement('div');
    left.innerHTML = `<strong>${shortTitle(act)}</strong><div class="meta">${new Date(act.time).toLocaleString()}</div>`;
    right.innerHTML = `<span class="meta">${typeLabel(act.type)}</span>`;
    li.appendChild(left);
    li.appendChild(right);
    recentList.appendChild(li);
  });
  activityCount.textContent = activities.length;
}

function shortTitle(act){
  if (act.type === 'content') return `Saved content — ${act.title}`;
  if (act.type === 'video') return `Uploaded video — ${act.title}`;
  if (act.type === 'file') return `Uploaded file — ${act.title}`;
  if (act.type === 'recording') return `Saved recording`;
  return act.title || 'Activity';
}
function typeLabel(t){
  if (t === 'content') return 'Content';
  if (t === 'video') return 'Video';
  if (t === 'file') return 'File';
  if (t === 'recording') return 'Audio';
  return '';
}

// initial: empty
renderActivities();

// Optional: clear cloud current meta on outside click
document.addEventListener('click', (e) => {
  if (!cloudModal.contains(e.target) && e.target !== cloudModal && cloudModal.style.display === 'flex') {
    cloudModal.style.display = 'none';
  }
});
// ---------- End Voice Recording ----------
// ----- Recent Activities Sidebar -----
const recentActivities = document.getElementById("recentList");
// Function to render activities



// Load existing activities from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
  const storedActivities = JSON.parse(localStorage.getItem("activities")) || [];
  storedActivities.forEach(activity => addActivity(activity, false));
});

// Toggle Save Button
function toggleSaveButton() {
  if (contentInput.value.trim() !== "" || headingInput.value.trim() !== "") {
    saveBtn.disabled = false;
  } else {
    saveBtn.disabled = true;
  }
}

contentInput.addEventListener("input", toggleSaveButton);
headingInput.addEventListener("input", toggleSaveButton);

// Save Content
saveBtn.addEventListener("click", () => {
  const heading = headingInput.value.trim();
  const content = contentInput.value.trim();
  if (heading || content) {
    addActivity(`Saved content: ${heading || "Untitled"}`, true);
    headingInput.value = "";
    contentInput.value = "";
    saveBtn.disabled = true;
  }
});

// Upload Handlers
function handleUpload(type, fileName) {
  addActivity(`Uploaded ${type}: ${fileName}`, true);
}

document.querySelectorAll(".upload-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    const fileName = prompt(`Select a ${type} file name (simulation)`);
    if (fileName) {
      handleUpload(type, fileName);
    }
  });
});

// Voice Recording (Simulation)
const recordBtn = document.getElementById("recordBtn");
recordBtn.addEventListener("click", () => {
  const recordingName = prompt("Name this recording:");
  if (recordingName) {
    handleUpload("Voice Recording", recordingName);
  }
});

// Add activity + Save to localStorage
function addActivity(text, saveToStorage = true) {
  const li = document.createElement("li");
  li.textContent = text;

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.classList.add("delete-activity");
  delBtn.addEventListener("click", () => {
    li.remove();
    removeFromStorage(text);
  });

  li.appendChild(delBtn);
  recentActivities.appendChild(li);

  if (saveToStorage) {
    const storedActivities = JSON.parse(localStorage.getItem("activities")) || [];
    storedActivities.push(text);
    localStorage.setItem("activities", JSON.stringify(storedActivities));
  }
}

// Remove item from localStorage
function removeFromStorage(text) {
  let storedActivities = JSON.parse(localStorage.getItem("activities")) || [];
  storedActivities = storedActivities.filter(activity => activity !== text);
  localStorage.setItem("activities", JSON.stringify(storedActivities));
}
