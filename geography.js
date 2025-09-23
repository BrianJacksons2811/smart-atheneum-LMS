const GEO_CONTENT = {
  "10": {
    textbook: {
      title: "Grade 10 Geography — Learner Book",
      href: "content/grade10/Geo-Grade10-Textbook.pdf",
      note: "Upload the Grade 10 Geography textbook to this path"
    },
    quizzes: [],
    videos: []
  },
  "11": {
    textbook: {
      title: "Grade 11 Geography — Learner Book",
      href: "content/grade11/Geo-Grade11-Textbook.pdf",
      note: "Upload the Grade 11 Geography textbook to this path"
    },
    quizzes: [],
    videos: []
  },
  "12": {
    textbook: {
      title: "Grade 12 SBA Geography English — Learner Book",
      href: "content/Geography/grade12/SBA Geography English Learner.pdf",
      note: "SBA Geography English Learner.pdf"
    },
    quizzes: [],
    videos: []
  }
};

function el(tag, attrs={}, ...children){
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else e.setAttribute(k, v);
  });
  children.forEach(c => e.append(c));
  return e;
}

function contentCard(icon, title, sub, href){
  const a = el("a", { class:"content-card", href, target:"_blank", rel:"noopener" });
  a.append(
    el("div", { class:"content-h" }, el("i", { class: icon }), el("span", {}, title)),
    el("div", { class:"content-sub" }, sub || "Open")
  );
  return a;
}

function buildGradePanel(grade, data){
  const item = el("div", { class:"acc-item" });

  const count = (data.textbook?.href ? 1 : 0) + (data.quizzes?.length || 0) + (data.videos?.length || 0);
  const btn = el("button", {
    class: "acc-btn",
    role: "tab",
    id: `tab-${grade}`,
    "aria-controls": `panel-${grade}`,
    "aria-expanded": "false"
  },
    el("span", {}, `Grade ${grade}`),
    el("span", { class:"acc-right" },
      el("span", { class:"badge" }, `<i class="fa-regular fa-folder-open"></i> ${count} item${count!==1?"s":""}`),
      el("i", { class:"fa-solid fa-chevron-down", "aria-hidden":"true" })
    )
  );

  const panel = el("div", {
    class: "acc-panel",
    id: `panel-${grade}`,
    role: "region",
    "aria-labelledby": `tab-${grade}`
  });

  const grid = el("div", { class:"content-grid" });

  if (data.textbook?.href) {
    grid.append(contentCard("fa-solid fa-book", data.textbook.title, data.textbook.note || "Textbook", data.textbook.href));
  }
  (data.quizzes || []).forEach(q => grid.append(contentCard("fa-regular fa-circle-question", q.title, "Quiz", q.href)));
  (data.videos || []).forEach(v => grid.append(contentCard("fa-solid fa-play", v.title, "Video", v.href)));

  panel.append(grid);

  btn.addEventListener("click", () => toggle(panel, btn));
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(panel, btn); }
    if (e.key === "Escape") closeAll();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const tabs = Array.from(document.querySelectorAll(".acc-btn"));
      const idx = tabs.indexOf(btn);
      const next = e.key === "ArrowDown" ? tabs[idx+1] || tabs[0] : tabs[idx-1] || tabs[tabs.length-1];
      next.focus();
    }
  });

  item.append(btn, panel);
  return item;
}

function closeAll(){
  document.querySelectorAll(".acc-panel").forEach(p => p.style.display = "none");
  document.querySelectorAll(".acc-btn").forEach(b => b.setAttribute("aria-expanded","false"));
}
function toggle(panel, btn){
  const isOpen = panel.style.display === "block";
  closeAll();
  if (!isOpen) {
    panel.style.display = "block";
    btn.setAttribute("aria-expanded","true");
  }
}

(function init(){
  const acc = document.getElementById("accordion");
  ["10","11","12"].forEach(g => acc.append(buildGradePanel(g, GEO_CONTENT[g])));
  const first = document.querySelector(".acc-btn");
  if (first) first.click();
})();