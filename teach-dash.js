// teach-dash.js  (REPLACE the entire file with this)

// ---------- Tiny helpers ----------
function $(sel) { return document.querySelector(sel); }
function API() { return window.API_BASE || ''; }
function token() { return localStorage.getItem('token'); }
function authHeaders() { return token() ? { 'Authorization': 'Bearer ' + token() } : {}; }
function jsonBody(body) { return { method: 'POST', headers: Object.assign({'Content-Type': 'application/json'}, authHeaders()), body: JSON.stringify(body) }; }
function show(el) { if (el) el.style.display = 'flex'; }
function hide(el) { if (el) el.style.display = 'none'; }

// ---------- Drive/Dropbox helpers ----------
function extractDriveId(url) {
  if (!url) return null;
  const m = url.match(/\/d\/([-\w]{25,})/) || url.match(/[?&]id=([-\w]{25,})/) || url.match(/([-\w]{25,})/);
  return m ? m[1] : null;
}
function driveToLinks(url) {
  const id = extractDriveId(url);
  if (!id) return null;
  return {
    download: `https://drive.google.com/uc?export=download&id=${id}`,
    preview:  `https://drive.google.com/file/d/${id}/preview`
  };
}
function dropboxToDirect(url) {
  if (!url) return null;
  // www.dropbox.com/... ?dl=0  -> dl.dropboxusercontent.com/... ?dl=1
  return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/\?dl=0$/, '?dl=1');
}

// ---------- Modal open/close ----------
function showModal(id) { show(document.getElementById(id)); }
function hideModal(id) { hide(document.getElementById(id)); }

// ---------- Subject selection memory ----------
let currentSubject = null;

// Try to infer subject when a card is clicked
function bindSubjectSelection() {
  document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const h3 = card.querySelector('h3');
      if (h3 && h3.textContent) {
        currentSubject = h3.textContent.trim();
        // hint to user (non-blocking)
        // console.log('Selected subject:', currentSubject);
      }
    }, true);
  });
}

// ---------- Recent Activity (API with localStorage fallback) ----------
const activityList = $('#activityList');
const activityEmpty = $('#activityEmpty');

function setActivityEmpty(isEmpty) {
  if (!activityEmpty) return;
  activityEmpty.style.display = isEmpty ? 'block' : 'none';
}

function activityItemTpl(a) {
  const subjectBadge = a.subject ? `<small class="muted">[${a.subject}]</small>` : '';
  const when = a.when || new Date().toLocaleString();
  return `
    <li data-id="${a.id}">
      <i class="fa-regular fa-file"></i>
      <div class="activity-meta">
        <div><strong>${a.title || 'New content'}</strong> ${subjectBadge}</div>
        <div class="muted">${when}</div>
      </div>
      <button class="icon-btn" title="Remove from feed" data-remove="${a.id}">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </li>`;
}

function addActivityRow(a) {
  if (!activityList) return;
  setActivityEmpty(false);
  activityList.insertAdjacentHTML('afterbegin', activityItemTpl(a));
}

async function logActivity(a) {
  // Try API
  try {
    const res = await fetch(API() + '/api/activities', jsonBody(a));
    if (!res.ok) throw new Error('Activities API not ready');
    return;
  } catch (_) {
    // Fallback to localStorage feed
    const k = 'recentActivities';
    const arr = JSON.parse(localStorage.getItem(k) || '[]');
    arr.unshift(Object.assign({ id: Date.now() }, a));
    localStorage.setItem(k, JSON.stringify(arr.slice(0, 20)));
  }
}

async function loadActivities() {
  if (!activityList) return;
  // Try API first
  try {
    const res = await fetch(API() + '/api/activities?limit=10', { headers: authHeaders() });
    if (!res.ok) throw new Error('No API');
    const data = await res.json();
    const items = data.items || data || [];
    activityList.innerHTML = items.map(it => activityItemTpl({
      id: it._id,
      title: it.title || it.metadata?.title || it.type || 'Activity',
      subject: it.subject || it.metadata?.subject,
      when: new Date(it.createdAt).toLocaleString()
    })).join('');
    setActivityEmpty(items.length === 0);
    return;
  } catch (_) {}
  // Fallback to localStorage
  const arr = JSON.parse(localStorage.getItem('recentActivities') || '[]');
  activityList.innerHTML = arr.map(activityItemTpl).join('');
  setActivityEmpty(arr.length === 0);
}

activityList?.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-remove]');
  if (!btn) return;
  const id = btn.getAttribute('data-remove');
  // Try API delete
  let removedRemotely = false;
  try {
    const res = await fetch(API() + '/api/activities/' + encodeURIComponent(id), { method: 'DELETE', headers: authHeaders() });
    removedRemotely = res.ok;
  } catch (_) {}
  // Fallback localStorage
  if (!removedRemotely) {
    const k = 'recentActivities';
    const arr = JSON.parse(localStorage.getItem(k) || '[]').filter(x => String(x.id) !== String(id));
    localStorage.setItem(k, JSON.stringify(arr));
  }
  const li = activityList.querySelector(`li[data-id="${id}"]`);
  if (li) li.remove();
  setActivityEmpty(!activityList.children.length);
});

// ---------- Content creation helpers ----------
async function createContentFromDevice(file, meta) {
  // 1) upload file to server
  const fd = new FormData();
  fd.append('file', file);
  const upRes = await fetch(API() + '/api/uploads', { method: 'POST', headers: authHeaders(), body: fd });
  const upData = await upRes.json();
  if (!upRes.ok || !upData.url) throw new Error(upData.message || 'Upload failed');

  // 2) create content pointing to uploaded URL
  const payload = {
    title: meta.title || file.name,
    subject: meta.subject || 'General',
    topic: meta.topic || '',
    description: meta.description || '',
    fileUrls: [upData.url]
  };
  const cRes = await fetch(API() + '/api/content', jsonBody(payload));
  const cData = await cRes.json();
  if (!cRes.ok) throw new Error(cData.message || 'Create content failed');

  // 3) log activity
  await logActivity({ type: 'upload', subject: payload.subject, title: payload.title, resourceType: 'content', resourceId: cData._id || (cData.content && cData.content._id) });

  // 4) UI feed
  addActivityRow({ id: cData._id || Date.now(), title: payload.title, subject: payload.subject, when: 'Just now' });
}

async function createContentFromDrive(link, meta) {
  // Use the server route that stores proper preview/download
  const payload = { subject: meta.subject || 'General', topic: meta.topic || '', title: meta.title || 'Drive File', url: link, description: meta.description || '' };
  const res = await fetch(API() + '/api/content/drive', jsonBody(payload));
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Save from Drive failed');

  await logActivity({ type: 'upload', subject: payload.subject, title: payload.title, resourceType: 'content', resourceId: data.content && data.content._id });
  addActivityRow({ id: (data.content && data.content._id) || Date.now(), title: payload.title, subject: payload.subject, when: 'Just now' });
}

async function createContentFromDropbox(link, meta) {
  const direct = dropboxToDirect(link);
  if (!direct) throw new Error('Invalid Dropbox link');
  const payload = {
    title: meta.title || 'Dropbox File',
    subject: meta.subject || 'General',
    topic: meta.topic || '',
    description: meta.description || '',
    fileUrls: [direct],
    previewUrl: direct
  };
  const cRes = await fetch(API() + '/api/content', jsonBody(payload));
  const cData = await cRes.json();
  if (!cRes.ok) throw new Error(cData.message || 'Create content failed');

  await logActivity({ type: 'upload', subject: payload.subject, title: payload.title, resourceType: 'content', resourceId: cData._id || (cData.content && cData.content._id) });
  addActivityRow({ id: cData._id || Date.now(), title: payload.title, subject: payload.subject, when: 'Just now' });
}

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', () => {
  // Quick actions
  $('#qa-create')?.addEventListener('click', () => showModal('modal-assignment'));
  $('#qa-schedule')?.addEventListener('click', () => showModal('modal-schedule'));
  $('#qa-grade')?.addEventListener('click', () => showModal('modal-grade'));

  // Close buttons + click outside
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => hide(e.target.closest('.modal')?.id));
  });
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => { if (e.target === modal) hide(modal.id); });
  });

  // Remember subject when a card is clicked
  bindSubjectSelection();

  // Device upload
  const hiddenFile = $('#hidden-file');
  $('#upload-device')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentSubject) {
      alert('Select a subject card first (click it), then add content.');
      return;
    }
    hiddenFile.value = '';
    hiddenFile.click();
  });

  hiddenFile?.addEventListener('change', async () => {
    if (!hiddenFile.files.length) return;
    const file = hiddenFile.files[0];

    // Pull extra meta from the modal inputs (if present)
    const title = $('#as-title')?.value.trim() || file.name;
    const topic = $('#as-topic')?.value?.trim() || '';
    const description = $('#as-desc')?.value?.trim() || '';

    try {
      await createContentFromDevice(file, { subject: currentSubject, title, topic, description });
      hideModal('modal-assignment');
      hiddenFile.value = '';
      alert('Uploaded and saved ✔');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Upload failed');
    }
  });

  // Cloud uploads (open modal)
  $('#upload-cloud')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentSubject) {
      alert('Select a subject card first (click it), then add content.');
      return;
    }
    showModal('modal-cloud');
  });

  // In the cloud modal we still have placeholder buttons in your HTML.
  // We’ll prompt for a link to keep HTML unchanged.
  document.querySelector('#modal-cloud .cloud:nth-child(1)')?.addEventListener('click', async () => {
    // Google Drive
    const link = prompt('Paste Google Drive link (…/file/d/<ID>/view)');
    if (!link) return;
    const title = $('#as-title')?.value.trim() || 'Drive File';
    const topic = $('#as-topic')?.value?.trim() || '';
    const description = $('#as-desc')?.value?.trim() || '';
    try {
      await createContentFromDrive(link, { subject: currentSubject, title, topic, description });
      hideModal('modal-cloud'); hideModal('modal-assignment');
      alert('Saved from Drive ✔');
    } catch (err) { alert(err.message || 'Save failed'); }
  });

  document.querySelector('#modal-cloud .cloud:nth-child(2)')?.addEventListener('click', async () => {
    // Dropbox
    const link = prompt('Paste Dropbox share link');
    if (!link) return;
    const title = $('#as-title')?.value.trim() || 'Dropbox File';
    const topic = $('#as-topic')?.value?.trim() || '';
    const description = $('#as-desc')?.value?.trim() || '';
    try {
      await createContentFromDropbox(link, { subject: currentSubject, title, topic, description });
      hideModal('modal-cloud'); hideModal('modal-assignment');
      alert('Saved from Dropbox ✔');
    } catch (err) { alert(err.message || 'Save failed'); }
  });

  // Save button simply closes the modal now (content is created by the upload actions)
  $('#save-assignment')?.addEventListener('click', () => hideModal('modal-assignment'));

  // Load recent activity on boot
  loadActivities();
});

// ---------- Navigation ----------
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
  currentSubject = subject; // remember selection for uploads
  if (map[subject]) {
    window.location.href = `courses/${map[subject]}/index.html`;
  } else {
    // fallback to generic content page if mapping missing
    window.location.href = `content.html?subject=${encodeURIComponent(subject)}`;
  }
}


// try to resolve a subject from either the clicked card or the Subject dropdown
function getSubject() {
  const fromDropdown = document.getElementById('as-subject');
  if (currentSubject) return currentSubject;
  if (fromDropdown && fromDropdown.value.trim()) return fromDropdown.value.trim();
  return null;
}

// remember the subject when a card is clicked (also fills the Subject dropdown)
document.querySelectorAll('.subject-card').forEach(card => {
  card.addEventListener('click', () => {
    const h3 = card.querySelector('h3');
    if (h3) {
      currentSubject = h3.textContent.trim();
      const dd = document.getElementById('as-subject');
      if (dd) dd.value = currentSubject;
    }
  }, true);
});

// if the Subject dropdown changes, keep currentSubject in sync
const dd = document.getElementById('as-subject');
if (dd) {
  if (!currentSubject && dd.value) currentSubject = dd.value.trim();
  dd.addEventListener('change', () => { currentSubject = dd.value.trim(); });
}
