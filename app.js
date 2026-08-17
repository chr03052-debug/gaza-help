
const state = {
  lang: localStorage.getItem("gh-lang") || "ar",
  category: "all",
  items: []
};

const ui = {
  cards: document.getElementById("cards"),
  langBtn: document.getElementById("langBtn"),
  search: document.getElementById("searchInput"),
  lastSync: document.getElementById("lastSync"),
  offline: document.getElementById("offlineNotice"),
  refresh: document.getElementById("refreshBtn"),
  heroText: document.getElementById("heroText")
};

const labels = {
  ar: {
    search:"ابحث في المعلومات…",
    updated:"آخر تحديث محلي",
    refresh:"تحديث",
    share:"مشاركة",
    copied:"تم النسخ",
    source:"المصدر",
    verified:"تم التحقق من الرابط",
    contentDate:"تاريخ المعلومات",
    empty:"لا توجد معلومات منشورة حالياً.",
    hero:"المعلومات المنشورة هنا يجب أن تكون علنية ويمكن التحقق منها. لا يستخدم هذا التطبيق لتتبع الأشخاص أو نشر مواقع حساسة.",
    sample:"نموذج تجريبي",
    old:"قديمة — تحقق من المصدر قبل الاستخدام"
  },
  ja: {
    search:"情報を検索…",
    updated:"端末内の最終更新",
    refresh:"更新",
    share:"共有",
    copied:"コピーしました",
    source:"出典",
    verified:"リンク確認日",
    contentDate:"情報基準日",
    empty:"現在公開できる情報はありません。",
    hero:"掲載するのは公開され検証可能な情報だけです。人の追跡や機微な位置情報の公開には使用しません。",
    sample:"デモ情報",
    old:"古い情報です。利用前に出典を確認してください"
  }
};

function fmtDate(iso){
  try{
    return new Intl.DateTimeFormat(state.lang === "ar" ? "ar" : "ja-JP", {
      dateStyle:"medium", timeStyle:"short"
    }).format(new Date(iso));
  }catch{
    return iso;
  }
}

function textFor(item, key){
  return item[`${key}_${state.lang}`] || item[`${key}_ar`] || "";
}

function isStale(iso){
  const age = Date.now() - new Date(iso).getTime();
  return Number.isFinite(age) && age > 48 * 60 * 60 * 1000;
}

function allowedItem(item){
  // Only explicitly verified or sample/demo records are rendered.
  return item && (item.status === "verified" || item.status === "sample");
}

function render(){
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  ui.langBtn.textContent = state.lang === "ar" ? "日本語" : "العربية";
  ui.search.placeholder = labels[state.lang].search;
  ui.refresh.textContent = labels[state.lang].refresh;
  ui.heroText.textContent = labels[state.lang].hero;

  const q = ui.search.value.trim().toLowerCase();
  const filtered = state.items.filter(allowedItem).filter(item => {
    const catOk = state.category === "all" || item.category === state.category;
    const hay = `${textFor(item,"title")} ${textFor(item,"body")} ${item.source_name}`.toLowerCase();
    return catOk && (!q || hay.includes(q));
  });

  if(!filtered.length){
    ui.cards.innerHTML = `<div class="empty">${labels[state.lang].empty}</div>`;
    return;
  }

  ui.cards.innerHTML = filtered.map(item => {
    const badge = item.status === "sample"
      ? `<span class="badge sample">${labels[state.lang].sample}</span>`
      : (isStale(item.content_date || item.verified_at) ? `<span class="badge stale">${labels[state.lang].old}</span>` : "");
    const source = item.source_url
      ? `<a class="source-link" href="${escapeAttr(item.source_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source_name || "—")}</a>`
      : escapeHtml(item.source_name || "—");

    return `
      <article class="card">
        <div class="badge-row">${badge}</div>
        <h3>${escapeHtml(textFor(item,"title"))}</h3>
        <p>${escapeHtml(textFor(item,"body"))}</p>
        <div class="card-meta">${labels[state.lang].verified}: ${escapeHtml(fmtDate(item.verified_at))}</div>\n        ${item.content_date ? `<div class="card-meta">${labels[state.lang].contentDate}: ${escapeHtml(item.content_date)}</div>` : ""}
        <div class="source">${labels[state.lang].source}: ${source}</div>
        <div class="card-actions">
          <button class="action" data-share="${escapeAttr(item.id)}">${labels[state.lang].share}</button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-share]").forEach(btn => {
    btn.addEventListener("click", () => shareItem(btn.dataset.share, btn));
  });
}

function escapeHtml(s=""){
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function escapeAttr(s=""){
  return escapeHtml(String(s));
}

async function shareItem(id, btn){
  const item = state.items.find(x => x.id === id);
  if(!item) return;
  const text = `${textFor(item,"title")}\n${textFor(item,"body")}\n${labels[state.lang].verified}: ${fmtDate(item.verified_at)}\n${labels[state.lang].source}: ${item.source_name || "—"}${item.source_url ? "\n" + item.source_url : ""}`;
  if(navigator.share){
    try{ await navigator.share({text}); return; }catch(e){}
  }
  try{
    await navigator.clipboard.writeText(text);
    const old = btn.textContent;
    btn.textContent = labels[state.lang].copied;
    setTimeout(()=>btn.textContent=old, 1200);
  }catch(e){}
}

async function loadData(){
  try{
    const res = await fetch("./data.json", {cache:"no-store"});
    if(!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    state.items = Array.isArray(data) ? data : [];
    localStorage.setItem("gh-data", JSON.stringify(state.items));
    localStorage.setItem("gh-sync", new Date().toISOString());
  }catch(e){
    const cached = localStorage.getItem("gh-data");
    state.items = cached ? JSON.parse(cached) : [];
  }
  const sync = localStorage.getItem("gh-sync");
  ui.lastSync.textContent = `${labels[state.lang].updated}: ${sync ? fmtDate(sync) : "—"}`;
  render();
}

function setOnlineState(){
  ui.offline.hidden = navigator.onLine;
}

document.querySelectorAll(".cat").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".cat").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    state.category = btn.dataset.category;
    render();
  });
});

ui.langBtn.addEventListener("click", ()=>{
  state.lang = state.lang === "ar" ? "ja" : "ar";
  localStorage.setItem("gh-lang", state.lang);
  const sync = localStorage.getItem("gh-sync");
  ui.lastSync.textContent = `${labels[state.lang].updated}: ${sync ? fmtDate(sync) : "—"}`;
  render();
});
ui.search.addEventListener("input", render);
ui.refresh.addEventListener("click", loadData);
window.addEventListener("online", setOnlineState);
window.addEventListener("offline", setOnlineState);

if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>navigator.serviceWorker.register("./sw.js"));
}

setOnlineState();
loadData();
