const state = {
  lang: localStorage.getItem("gh-lang") || "ar",
  category: "all",
  items: [],
  usingCachedData: false
};

const ui = {
  cards: document.getElementById("cards"),
  langBtn: document.getElementById("langBtn"),
  search: document.getElementById("searchInput"),
  lastSync: document.getElementById("lastSync"),
  offline: document.getElementById("offlineNotice"),
  refresh: document.getElementById("refreshBtn"),
  heroText: document.getElementById("heroText"),

  title: document.querySelector(".topbar h1"),
  subtitle: document.querySelector(".subtitle"),
  offlineTitle: document.querySelector("#offlineNotice strong"),
  offlineText: document.querySelector("#offlineNotice span"),
  categories: document.querySelector(".categories"),
  safetyTitle: document.querySelector(".safety h2"),
  safetyText: document.querySelector(".safety p"),
  footerText: document.querySelector("footer p")
};

const labels = {
  ar: {
    pageTitle: "مساعدة غزة",
    title: "مساعدة غزة",
    subtitle: "معلومات خفيفة • بدون تسجيل • تعمل دون اتصال",

    search: "ابحث في المعلومات…",
    updated: "آخر تحديث محفوظ على هذا الجهاز",
    refresh: "تحديث",
    share: "مشاركة",
    copied: "تم النسخ",
    source: "المصدر",
    verified: "تاريخ التحقق من الرابط",
    contentDate: "تاريخ المعلومات",
    empty: "لا توجد معلومات منشورة حالياً.",

    hero:
      "المعلومات المنشورة هنا يجب أن تكون علنية ويمكن التحقق منها. لا يستخدم هذا التطبيق لتتبع الأشخاص أو نشر مواقع حساسة.",

    sample: "نموذج تجريبي",
    old: "قديمة — تحقق من المصدر قبل الاستخدام",

    offlineTitle: "وضع عدم الاتصال:",
    offlineText:
      "يتم عرض آخر معلومات محفوظة على هذا الجهاز. قد تكون المعلومات قديمة، لذا تحقق من المصدر الرسمي عند عودة الاتصال.",

    cachedTitle: "تعذر الحصول على أحدث البيانات:",
    cachedText:
      "يتم عرض المعلومات المحفوظة سابقاً على هذا الجهاز. تحقق من المصدر الرسمي قبل الاعتماد عليها.",

    categoriesLabel: "الفئات",
    categoryAll: "الكل",
    categoryMedical: "🏥 الرعاية الطبية",
    categoryFood: "💧 الغذاء والماء",
    categoryAid: "🤝 المساعدة",
    categoryImportant: "⚠️ معلومات مهمة",

    safetyTitle: "مهم",
    safetyText:
      "لا يجمع هذا التطبيق اسمك أو رقم هاتفك أو موقعك الجغرافي، ولا توجد خريطة لتتبع الأشخاص أو حسابات مستخدمين. يتم عرض معلومات من مصادر عامة، وقد تتغير الخدمات الميدانية بسرعة. تاريخ التحقق يعني أن الرابط والمصدر تمت مراجعتهما في ذلك التاريخ، ولا يعني أن الخدمة لا تزال متاحة الآن. تحقق دائماً من أحدث المعلومات الرسمية والظروف على الأرض قبل اتخاذ قرار أو التوجه إلى موقع.",

    shareWarning:
      "تنبيه: قد تتغير الخدمات والظروف بسرعة. تاريخ التحقق من الرابط لا يعني أن الخدمة متاحة الآن. تحقق من أحدث المعلومات الرسمية قبل اتخاذ قرار أو التوجه إلى موقع.",

    site: "موقع معلومات مساعدة غزة",

    footer:
      "نسخة أولية مستقلة ومفتوحة وبسيطة للاستخدام منخفض البيانات. هذا الموقع غير تابع لـ OCHA أو WHO أو WFP أو UNRWA ولا تديره أو تعتمده أي منها."
  },

  ja: {
    pageTitle: "ガザ支援情報",
    title: "ガザ支援情報",
    subtitle: "軽量な情報 • 登録不要 • オフライン対応",

    search: "情報を検索…",
    updated: "この端末に保存された最終更新",
    refresh: "更新",
    share: "共有",
    copied: "コピーしました",
    source: "出典",
    verified: "リンク確認日",
    contentDate: "情報基準日",
    empty: "現在公開できる情報はありません。",

    hero:
      "掲載するのは公開され、確認可能な情報です。人の追跡や機微な位置情報の公開には使用しません。",

    sample: "デモ情報",
    old: "古い情報です。利用前に出典を確認してください",

    offlineTitle: "オフラインモード:",
    offlineText:
      "この端末に最後に保存された情報を表示しています。情報が古い可能性があるため、通信が戻ったら公式情報を再確認してください。",

    cachedTitle: "最新データを取得できませんでした:",
    cachedText:
      "この端末に以前保存された情報を表示しています。利用前に必ず公式情報源を確認してください。",

    categoriesLabel: "カテゴリー",
    categoryAll: "すべて",
    categoryMedical: "🏥 医療",
    categoryFood: "💧 食料・水",
    categoryAid: "🤝 支援",
    categoryImportant: "⚠️ 重要情報",

    safetyTitle: "重要",
    safetyText:
      "このサイトは氏名・電話番号・現在地の入力を求めず、人を追跡する地図やユーザーアカウントもありません。公開情報源からの情報を表示していますが、現地のサービス状況は急に変化する可能性があります。リンク確認日は、その日にリンクと情報源を確認したことを示すもので、現在もサービスが利用できることを意味しません。判断や移動の前には、必ず最新の公式情報と現地状況を確認してください。詳しくはプライバシーページをご確認ください。",
  

    shareWarning:
      "注意：サービスや現地状況は急に変化する可能性があります。リンク確認日は現在のサービス提供を保証するものではありません。判断や移動の前に、必ず最新の公式情報を確認してください。",

    site: "ガザ支援情報サイト",

    footer:
      "低データ通信での利用を想定した独立・非公式のシンプルな試作版です。OCHA・WHO・WFP・UNRWAが運営、承認するものではありません。"
  }
};

function fmtDate(iso) {
  if (!iso) return "—";

  const date = new Date(iso);

  if (!Number.isFinite(date.getTime())) {
    return String(iso);
  }

  try {
    return new Intl.DateTimeFormat(
      state.lang === "ar" ? "ar" : "ja-JP",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    ).format(date);
  } catch {
    return String(iso);
  }
}

function textFor(item, key) {
  return (
    item[`${key}_${state.lang}`] ||
    item[`${key}_ar`] ||
    ""
  );
}

function isStale(iso) {
  if (!iso) return false;

  const time = new Date(iso).getTime();

  if (!Number.isFinite(time)) {
    return false;
  }

  const age = Date.now() - time;

  return age > 48 * 60 * 60 * 1000;
}

function allowedItem(item) {
  return (
    item &&
    (item.status === "verified" ||
      item.status === "sample")
  );
}

function updateStaticText() {
  const t = labels[state.lang];

  document.documentElement.lang = state.lang;
  document.documentElement.dir =
    state.lang === "ar" ? "rtl" : "ltr";

  document.title = t.pageTitle;

  if (ui.title) ui.title.textContent = t.title;
  if (ui.subtitle) ui.subtitle.textContent = t.subtitle;

  if (ui.langBtn) {
    ui.langBtn.textContent =
      state.lang === "ar" ? "日本語" : "العربية";

    ui.langBtn.setAttribute(
      "aria-label",
      state.lang === "ar"
        ? "تغيير اللغة"
        : "言語を切り替える"
    );
  }

  if (ui.search) {
    ui.search.placeholder = t.search;
  }

  if (ui.refresh) {
    ui.refresh.textContent = t.refresh;
  }

  if (ui.heroText) {
    ui.heroText.textContent = t.hero;
  }

  updateNotice();

  if (ui.categories) {
    ui.categories.setAttribute(
      "aria-label",
      t.categoriesLabel
    );
  }

  const categoryLabels = {
    all: t.categoryAll,
    medical: t.categoryMedical,
    food: t.categoryFood,
    aid: t.categoryAid,
    important: t.categoryImportant
  };

  document.querySelectorAll(".cat").forEach(btn => {
    const category = btn.dataset.category;

    if (categoryLabels[category]) {
      btn.textContent = categoryLabels[category];
    }
  });

  if (ui.safetyTitle) {
    ui.safetyTitle.textContent = t.safetyTitle;
  }

  if (ui.safetyText) {
    ui.safetyText.textContent = t.safetyText;
  }

  if (ui.footerText) {
    ui.footerText.textContent = t.footer;
  }
}

function updateNotice() {
  if (!ui.offline) return;

  const t = labels[state.lang];

  const offline = !navigator.onLine;
  const showNotice = offline || state.usingCachedData;

  ui.offline.hidden = !showNotice;

  if (!showNotice) return;

  if (ui.offlineTitle) {
    ui.offlineTitle.textContent =
      offline ? t.offlineTitle : t.cachedTitle;
  }

  if (ui.offlineText) {
    ui.offlineText.textContent =
      offline ? t.offlineText : t.cachedText;
  }
}

function render() {
  updateStaticText();

  const t = labels[state.lang];

  const q = ui.search
    ? ui.search.value.trim().toLowerCase()
    : "";

  const filtered = state.items
    .filter(allowedItem)
    .filter(item => {
      const catOk =
        state.category === "all" ||
        item.category === state.category;

      const hay =
        `${textFor(item, "title")} ` +
        `${textFor(item, "body")} ` +
        `${item.source_name || ""}`;

      return (
        catOk &&
        (!q || hay.toLowerCase().includes(q))
      );
    });

  if (!ui.cards) return;

  if (!filtered.length) {
    ui.cards.innerHTML =
      `<div class="empty">${escapeHtml(t.empty)}</div>`;
    return;
  }

  ui.cards.innerHTML = filtered
    .map(item => {
      const badge =
        item.status === "sample"
          ? `<span class="badge sample">${escapeHtml(
              t.sample
            )}</span>`
          : isStale(
              item.content_date ||
                item.verified_at
            )
          ? `<span class="badge stale">${escapeHtml(
              t.old
            )}</span>`
          : "";

      const source = item.source_url
        ? `<a class="source-link"
             href="${escapeAttr(item.source_url)}"
             target="_blank"
             rel="noopener noreferrer">
             ${escapeHtml(item.source_name || "—")}
           </a>`
        : escapeHtml(item.source_name || "—");

      return `
        <article class="card">
          <div class="badge-row">${badge}</div>

          <h3>${escapeHtml(
            textFor(item, "title")
          )}</h3>

          <p>${escapeHtml(
            textFor(item, "body")
          )}</p>

          <div class="card-meta">
            ${escapeHtml(t.verified)}:
            ${escapeHtml(fmtDate(item.verified_at))}
          </div>

          ${
            item.content_date
              ? `<div class="card-meta">
                   ${escapeHtml(t.contentDate)}:
                   ${escapeHtml(item.content_date)}
                 </div>`
              : ""
          }

          <div class="source">
            ${escapeHtml(t.source)}:
            ${source}
          </div>

          <div class="card-actions">
            <button
              class="action"
              type="button"
              data-share="${escapeAttr(item.id)}">
              ${escapeHtml(t.share)}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  document
    .querySelectorAll("[data-share]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        shareItem(btn.dataset.share, btn);
      });
    });
}

function escapeHtml(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    c =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[c])
  );
}

function escapeAttr(s = "") {
  return escapeHtml(String(s));
}

async function shareItem(id, btn) {
  const item = state.items.find(
    x => String(x.id) === String(id)
  );

  if (!item) return;

  const t = labels[state.lang];

  const siteUrl =
    "https://chr03052-debug.github.io/gaza-help/";

  const parts = [
    textFor(item, "title"),
    textFor(item, "body"),
    `${t.verified}: ${fmtDate(item.verified_at)}`
  ];

  if (item.content_date) {
    parts.push(
      `${t.contentDate}: ${item.content_date}`
    );
  }

  parts.push(
    `${t.source}: ${item.source_name || "—"}`
  );

  if (item.source_url) {
    parts.push(item.source_url);
  }

  parts.push("");
  parts.push(t.shareWarning);
  parts.push("");
  parts.push(`${t.site}: ${siteUrl}`);

  const text = parts.join("\n");

  if (navigator.share) {
    try {
      await navigator.share({
        title: textFor(item, "title"),
        text
      });

      return;
    } catch (e) {
      if (e && e.name === "AbortError") {
        return;
      }
    }
  }

  try {
    await navigator.clipboard.writeText(text);

    if (!btn) return;

    const old = btn.textContent;
    btn.textContent = t.copied;

    setTimeout(() => {
      btn.textContent = old;
    }, 1200);
  } catch (e) {
    console.warn("Share/copy failed", e);
  }
}

async function loadData() {
  if (ui.refresh) {
    ui.refresh.disabled = true;
  }

  try {
    const res = await fetch(
      "./data.json",
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status}`
      );
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error(
        "Invalid data format"
      );
    }

    state.items = data;
    state.usingCachedData = false;

    localStorage.setItem(
      "gh-data",
      JSON.stringify(state.items)
    );

    localStorage.setItem(
      "gh-sync",
      new Date().toISOString()
    );
  } catch (e) {
    const cached =
      localStorage.getItem("gh-data");

    try {
      const parsed = cached
        ? JSON.parse(cached)
        : [];

      state.items =
        Array.isArray(parsed)
          ? parsed
          : [];
    } catch {
      state.items = [];
    }

    state.usingCachedData = true;

    console.warn(
      "Latest data could not be loaded. Using saved data.",
      e
    );
  } finally {
    if (ui.refresh) {
      ui.refresh.disabled = false;
    }
  }

  updateLastSync();
  render();
}

function updateLastSync() {
  if (!ui.lastSync) return;

  const sync =
    localStorage.getItem("gh-sync");

  ui.lastSync.textContent =
    `${labels[state.lang].updated}: ` +
    `${sync ? fmtDate(sync) : "—"}`;
}

function setOnlineState() {
  updateNotice();
}

document
  .querySelectorAll(".cat")
  .forEach(btn => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".cat")
        .forEach(x =>
          x.classList.remove("active")
        );

      btn.classList.add("active");

      state.category =
        btn.dataset.category;

      render();
    });
  });

if (ui.langBtn) {
  ui.langBtn.addEventListener(
    "click",
    () => {
      state.lang =
        state.lang === "ar"
          ? "ja"
          : "ar";

      localStorage.setItem(
        "gh-lang",
        state.lang
      );

      updateLastSync();
      render();
    }
  );
}

if (ui.search) {
  ui.search.addEventListener(
    "input",
    render
  );
}

if (ui.refresh) {
  ui.refresh.addEventListener(
    "click",
    loadData
  );
}

window.addEventListener(
  "online",
  () => {
    setOnlineState();
    loadData();
  }
);

window.addEventListener(
  "offline",
  setOnlineState
);

if ("serviceWorker" in navigator) {
  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker
        .register("./sw.js")
        .catch(error => {
          console.warn(
            "Service worker registration failed",
            error
          );
        });
    }
  );
}

setOnlineState();
updateStaticText();
loadData();
