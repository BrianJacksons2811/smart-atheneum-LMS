// Config helpers
function API() { return window.API_BASE || ''; }
function token() { return localStorage.getItem('token'); }
function authHeaders() { return token() ? { 'Authorization': 'Bearer ' + token() } : {}; }

const SUBJECT = 'Mathematics';

document.addEventListener('DOMContentLoaded', () => {
  initDrive();
  loadContent();
  // Optional: show a saved enrol count
  try {
    const enrol = JSON.parse(localStorage.getItem('math_enrol') || '0') || 0;
    document.getElementById('enrolText').textContent = `${enrol} students enrolled`;
  } catch {}
});

// ---------- 1) Google Drive folder ----------
function initDrive(){
  const box = document.getElementById('driveBox');
  const frame = document.getElementById('driveFrame');
  const id = (box?.getAttribute('data-drive-folder') || '').trim();
  if (!id) { box.style.display='none'; return; }
  // Embedded folder view (no API key required)
  frame.src = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(id)}#list`;
}

// ---------- 2) LMS content for Mathematics ----------
function loadContent(){
  const grid = document.getElementById('contentGrid');
  const empty = document.getElementById('contentEmpty');
  if (!grid) return;

  fetch(`${API()}/api/content?subject=${encodeURIComponent(SUBJECT)}`, { headers: authHeaders() })
    .then(r => r.json())
    .then(data => {
      const items = Array.isArray(data) ? data : (data.items || []);
      if (!items.length) { empty.style.display = 'block'; return; }
      grid.innerHTML = items.map(renderCard).join('');
    })
    .catch(() => { /* API not linked yet → leave section blank; Drive still shows */ });
}

function renderCard(it){
  const url = (it.previewUrl || (it.fileUrls && it.fileUrls[0]) || '#');
  const title = it.title || 'Untitled';
  const topic = it.topic ? ` • ${it.topic}` : '';
  const ext = (url.split('.').pop() || '').toLowerCase();

  const isVideo = /mp4|mov|webm/.test(ext) || (it.tags||[]).includes('video');
  const isAudio = /mp3|wav|m4a|ogg/.test(ext) || (it.tags||[]).includes('recording');
  const isDoc   = /pdf|doc|docx|ppt|pptx/.test(ext) || (it.tags||[]).includes('textbook');

  const icon = isVideo ? 'bx bx-video' : isAudio ? 'bx bx-microphone' : 'bx bx-file';
  const kind = isVideo ? 'Video' : isAudio ? 'Audio' : isDoc ? 'Document' : 'Resource';

  return `
    <article class="resource-card">
      <div class="icon"><i class="${icon}"></i></div>
      <div>
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(it.description || kind + topic)}</p>
        <div class="meta">${kind}${it.grade ? ' • ' + escapeHtml(it.grade) : ''}</div>
        <div style="margin-top:10px;">
          <a class="back-button" style="padding:7px 10px;font-size:13px" target="_blank" href="${url}">Open</a>
        </div>
      </div>
    </article>`;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}


// Config helpers
function API() { return window.API_BASE || ''; }
function token() { return localStorage.getItem('token'); }
function authHeaders() { return token() ? { 'Authorization': 'Bearer ' + token() } : {}; }



document.addEventListener('DOMContentLoaded', () => {
  initDrive();
  loadContent();
  try {
    const enrol = JSON.parse(localStorage.getItem('maths_lit_enrol') || '0') || 0;
    document.getElementById('enrolText').textContent = `${enrol} students enrolled`;
  } catch {}
});

// ---------- 1) Google Drive folder ----------
function initDrive(){
  const box = document.getElementById('driveBox');
  const frame = document.getElementById('driveFrame');
  const id = (box?.getAttribute('data-drive-folder') || '').trim();
  if (!id) { box.style.display='none'; return; }
  // Embedded folder view (no API key required)
  frame.src = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(id)}#list`;
}

// ---------- 2) LMS content for Maths Literacy ----------
function loadContent(){
  const grid = document.getElementById('contentGrid');
  const empty = document.getElementById('contentEmpty');
  if (!grid) return;

  fetch(`${API()}/api/content?subject=${encodeURIComponent(SUBJECT)}`, { headers: authHeaders() })
    .then(r => r.json())
    .then(data => {
      const items = Array.isArray(data) ? data : (data.items || []);
      if (!items.length) { empty.style.display = 'block'; return; }
      grid.innerHTML = items.map(renderCard).join('');
    })
    .catch(() => { /* API not linked yet → show Drive only */ });
}

function renderCard(it){
  const url = (it.previewUrl || (it.fileUrls && it.fileUrls[0]) || '#');
  const title = it.title || 'Untitled';
  const topic = it.topic ? ` • ${it.topic}` : '';
  const ext = (url.split('.').pop() || '').toLowerCase();

  const isVideo = /mp4|mov|webm/.test(ext) || (it.tags||[]).includes('video');
  const isAudio = /mp3|wav|m4a|ogg/.test(ext) || (it.tags||[]).includes('recording');
  const isDoc   = /pdf|doc|docx|ppt|pptx/.test(ext) || (it.tags||[]).includes('textbook');

  const icon = isVideo ? 'bx bx-video' : isAudio ? 'bx bx-microphone' : 'bx bx-file';
  const kind = isVideo ? 'Video' : isAudio ? 'Audio' : isDoc ? 'Document' : 'Resource';

  return `
    <article class="resource-card">
      <div class="icon"><i class="${icon}"></i></div>
      <div>
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(it.description || kind + topic)}</p>
        <div class="meta">${kind}${it.grade ? ' • ' + escapeHtml(it.grade) : ''}</div>
        <div style="margin-top:10px;">
          <a class="back-button" style="padding:7px 10px;font-size:13px" target="_blank" href="${url}">Open</a>
        </div>
      </div>
    </article>`;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
