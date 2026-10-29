/* ============================================================
   app.js ─ 首頁、語言切換、打開主題
   ------------------------------------------------------------
   網址 #<主題id> 就是那個主題（例：index.html#hizuke），上一頁可以回首頁。
   打開主題時才載入 data/themes/<id>.js 和 js/templates/<模板>.js，
   再呼叫模板的 mount(容器, 主題資料, ctx, 目錄那一行)。
   ctx 是模板能用的共用工具：文字、發音、音效、存進度。
   ============================================================ */
(function () {
  "use strict";

  var I = window.VocabI18n, S = window.VocabSpeech, X = window.VocabSfx;
  var LIST = window.VOCAB_THEME_LIST || [];
  var GROUPS = window.VOCAB_THEME_GROUPS || [];
  var TPLS = window.VOCAB_TEMPLATES || {};
  var PREF_KEY = "vocab.prefs";
  var prefs = { lang: null, voice: "f", slow: false, se: true, theme: null };   // theme：null = 跟裝置
  var DARK_Q = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var BGS = [["auto", "bgAuto"], ["light", "bgLight"], ["dark", "bgDark"]];
  var current = null;   // 目前打開的主題 { meta, theme, mod }
  var loaded = {};
  var welcome = false;  // 設定對話框是不是「第一次來，問母語」那一種

  function $(s) { return document.querySelector(s); }

  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || "{}")); } catch (e) { /* 用預設 */ }
  var firstVisit = !prefs.lang;   // 沒存過母語 = 第一次來；先照裝置的語言顯示，再問一次
  function savePrefs() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* 存不了也沒關係 */ }
  }

  /** 每個主題自己的進度（卡片權重、最佳紀錄），存在這台裝置的瀏覽器裡 */
  function store(id) {
    var key = "vocab." + id;
    return {
      get: function () { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; } },
      set: function (v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* 存不了也沒關係 */ } }
    };
  }

  var ctx = {
    t: I.t,
    loc: I.loc,
    rich: I.rich,
    store: store,
    say: function (x) { return S.say(x, { slow: prefs.slow }); },
    canHear: S.canHear,
    sfx: X
  };

  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { delete loaded[src]; reject(new Error(src)); };
      document.head.appendChild(s);
    });
    return loaded[src];
  }

  /* ---------- 首頁 ---------- */
  /** 主題的整體熟悉度 %（跟 js/deck.js 同一套算法：熟悉度加總 ÷ 字數 × 3） */
  function famPct(th) {
    var fam = (store(th.id).get() || {}).fam || {}, sum = 0;
    Object.keys(fam).forEach(function (k) { sum += fam[k]; });
    var max = (th.cards || 0) * window.VocabDeck.GOAL;
    return max ? Math.min(100, Math.round(sum / max * 100)) : 0;
  }

  /** 首頁照組排：每組一個小標題；沒分到組的放最後，標題用「主題」 */
  function renderHome() {
    var ids = GROUPS.map(function (g) { return g.id; });
    var sections = GROUPS.map(function (g) {
      return { title: I.loc(g.title), list: LIST.filter(function (th) { return th.group === g.id; }) };
    }).concat([{ title: I.t("themes"), list: LIST.filter(function (th) { return ids.indexOf(th.group) < 0; }) }]);
    $("#themeList").innerHTML = sections.filter(function (s) { return s.list.length; }).map(function (s) {
      return '<h2 class="sec-h">' + s.title + '</h2><div class="themes">' + s.list.map(themeCard).join("") + "</div>";
    }).join("");

    $("#tplList").innerHTML = Object.keys(TPLS).map(function (id) {
      var tp = TPLS[id];
      return '<button class="tpl" data-tpl="' + id + '"><span class="thumb sm">' + tp.svg + "</span><span><b>" + I.loc(tp.name) + "</b><small>" + I.loc(tp.desc) + "</small></span></button>";
    }).join("");
  }

  function themeCard(th) {
    var tp = TPLS[th.template] || { name: {}, svg: "" };
    var p = th.ready ? famPct(th) : 0;
    var meta = th.ready
      ? "<span>" + I.t("cardsCount", { n: th.cards, g: th.games }) + "</span>"
      : '<span class="soon">' + I.t("soon") + "</span>";
    var prog = th.ready
      ? '<span class="tprog"><span class="pbar"><i style="width:' + p + '%"></i></span>' + I.t("famPct", { p: p }) + "</span>"
      : "";
    var inner =
      (th.img
        ? '<span class="thumb pic"><img src="' + th.img + '" alt="" loading="lazy"></span>'
        : '<span class="thumb">' + tp.svg + "</span>") +
      '<span class="tbody">' +
        '<span class="tja"><span class="kana">' + th.ja + "</span>" + (th.kana ? '<small class="kana">' + th.kana + "</small>" : "") + "</span>" +
        '<span class="tname">' + I.loc(th.title) + "</span>" +
        (th.desc ? '<span class="tdesc">' + I.loc(th.desc) + "</span>" : "") +
        '<span class="tmeta"><span class="badge">' + I.loc(tp.name) + "</span>" + meta + "</span>" +
        prog +
      "</span>";
    return th.ready
      ? '<button class="theme" data-theme="' + th.id + '">' + inner + '<span class="go" aria-hidden="true">›</span></button>'
      : '<div class="theme soon-card">' + inner + "<span></span></div>";
  }

  /* 「新增單字主題」：先只有按鈕和模板選項，選了只顯示「準備中」 */
  function openAdd() {
    var dlg = $("#addDlg");
    $("#addSoon").textContent = "";
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function closeAdd() {
    var dlg = $("#addDlg");
    if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
  }

  /** 寫死在 index.html 裡的文字：data-t 換內容、data-ta 換 aria-label */
  function applyStatic() {
    document.querySelectorAll("[data-t]").forEach(function (el) { el.innerHTML = I.t(el.dataset.t); });
    document.querySelectorAll("[data-ta]").forEach(function (el) { el.setAttribute("aria-label", I.t(el.dataset.ta)); });
  }

  function setLang(l) {
    I.setLang(l);
    prefs.lang = I.getLang();
    savePrefs();
    document.documentElement.lang = I.htmlLang();
    applyStatic();
    syncPrefs();
    renderSettings();
    renderHome();
    if (current) mountCurrent();
  }

  function syncPrefs() {
    $("#btnVoice").textContent = I.t(prefs.voice === "m" ? "voiceM" : "voiceF");
    S.setVoice(prefs.voice);
    $("#btnSlow").setAttribute("aria-pressed", String(prefs.slow));
    $("#btnSe").setAttribute("aria-pressed", String(prefs.se));
    X.setEnabled(prefs.se);
  }

  /** 深色／淺色：prefs.theme 沒設就跟裝置；<html data-theme> 一開始由 index.html 設好，這裡負責切換 */
  function applyTheme() {
    var dark = (prefs.theme || (DARK_Q && DARK_Q.matches ? "dark" : "light")) === "dark";
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }

  /* ---------- 設定：母語、背景 ---------- */
  function renderSettings() {
    $("#setDlgTitle").textContent = I.t(welcome ? "welcomeTitle" : "settings");
    $("#setNote").hidden = !welcome;
    $("#bgSet").hidden = welcome;
    $("#langChoices").innerHTML = I.LANGS.map(function (l) {
      return '<button class="choice" data-lang="' + l[0] + '" lang="' + l[2] + '" aria-pressed="' + (prefs.lang === l[0]) + '">' + l[1] + "</button>";
    }).join("");
    $("#bgSeg").innerHTML = BGS.map(function (b) {
      return '<button data-bg="' + b[0] + '" aria-pressed="' + ((prefs.theme || "auto") === b[0]) + '">' + I.t(b[1]) + "</button>";
    }).join("");
  }
  function openSettings(isWelcome) {
    welcome = !!isWelcome;
    renderSettings();
    var dlg = $("#setDlg");
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function closeSettings() {
    var dlg = $("#setDlg");
    if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
  }

  function updateNotice() {
    $("#voiceNotice").hidden = S.hasJapanese() || S.hasFiles();
  }

  /* ---------- 主題 ---------- */
  function showHome() {
    if (current) { current.mod.unmount(); current = null; }
    S.stop();
    renderHome();   // 回首頁時熟悉度 % 要更新
    $("#homeView").hidden = false;
    $("#themeView").hidden = true;
    $("#brand").hidden = false;
    $("#titleBar").hidden = true;
  }

  /** 標題列換成這個主題：日文、讀法、母語的翻譯 */
  function setTitle(meta) {
    $("#themeJa").textContent = meta.ja;
    $("#themeKana").textContent = meta.kana || "";
    $("#themeName").textContent = I.loc(meta.title);
  }

  function mountCurrent() {
    setTitle(current.meta);
    current.mod.mount($("#themeBody"), current.theme, ctx, current.meta);
  }

  function openTheme(meta) {
    $("#homeView").hidden = true;
    $("#themeView").hidden = false;
    $("#brand").hidden = true;
    $("#titleBar").hidden = false;
    setTitle(meta);
    window.scrollTo(0, 0);
    Promise.all([
      loadScript("data/themes/" + meta.id + ".js"),
      loadScript("js/templates/" + meta.template + ".js")
    ]).then(function () {
      var theme = (window.VOCAB_THEMES || {})[meta.id];
      var mod = (window.VocabTemplates || {})[meta.template];
      if (!theme || !mod) throw new Error("missing " + meta.id);
      if (current) current.mod.unmount();
      current = { meta: meta, theme: theme, mod: mod };
      mountCurrent();
    }).catch(function (err) {
      if (window.console) console.error(err);   // 模板 mount 出錯也會到這裡，主控台看得到是哪一行
      $("#themeBody").innerHTML = '<p class="notice">' + I.t("loadError") + "</p>";
    });
  }

  function route() {
    var id = decodeURIComponent((location.hash || "").slice(1));
    var meta = LIST.filter(function (x) { return x.ready && x.id === id; })[0];
    if (meta) openTheme(meta);
    else showHome();
  }

  /* ---------- 啟動 ---------- */
  $("#setBtn").addEventListener("click", function () { openSettings(false); });
  $("#setDlgClose").addEventListener("click", closeSettings);
  $("#setDlg").addEventListener("click", function (e) {
    if (e.target === e.currentTarget) { closeSettings(); return; }   // 點到對話框外面的暗處就關掉
    var l = e.target.closest("[data-lang]"), b = e.target.closest("[data-bg]");
    if (l) {
      setLang(l.dataset.lang);
      if (welcome) closeSettings();   // 第一次問母語：選了就開始用
    }
    if (b) {
      prefs.theme = b.dataset.bg === "auto" ? null : b.dataset.bg;
      savePrefs();
      applyTheme();
      renderSettings();
    }
  });

  $("#themeList").addEventListener("click", function (e) {
    var b = e.target.closest("[data-theme]");
    if (!b) return;
    S.unlock();
    location.hash = b.dataset.theme;
  });
  $("#backBtn").addEventListener("click", function () { location.hash = ""; });

  $("#addThemeBtn").addEventListener("click", openAdd);
  $("#addDlgClose").addEventListener("click", closeAdd);
  $("#addDlg").addEventListener("click", function (e) {
    if (e.target === e.currentTarget) { closeAdd(); return; }   // 點到對話框外面的暗處就關掉
    var b = e.target.closest("[data-tpl]");
    if (b) $("#addSoon").textContent = I.t("addThemeSoon");
  });

  $("#btnVoice").addEventListener("click", function () { prefs.voice = prefs.voice === "m" ? "f" : "m"; syncPrefs(); savePrefs(); });
  $("#btnSlow").addEventListener("click", function () { prefs.slow = !prefs.slow; syncPrefs(); savePrefs(); });
  $("#btnSe").addEventListener("click", function () { prefs.se = !prefs.se; syncPrefs(); savePrefs(); X.ok(); });
  if (DARK_Q && DARK_Q.addEventListener) DARK_Q.addEventListener("change", function () { if (!prefs.theme) applyTheme(); });

  window.addEventListener("hashchange", route);

  syncPrefs();
  setLang(prefs.lang || I.detect());
  applyTheme();
  S.ready().then(updateNotice);
  route();
  if (firstVisit) openSettings(true);
})();
