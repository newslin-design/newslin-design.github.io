/* ============================================================
   text.js ─ 文字標記與顯示切換
   ------------------------------------------------------------
   {漢字|かな} → <ruby>漢字<rt>かな</rt></ruby>
   顯示方式（全部顯示／只看日文）掛在 <body> 的 class 上，
   拼音和中文要不要出現，由 CSS 決定。
   ============================================================ */
(function () {
  "use strict";

  var RUBY = /\{([^|{}]+)\|([^{}]+)\}/g;
  var MODE_KEY = "travel.mode";
  var mode = "all";

  try {
    mode = localStorage.getItem(MODE_KEY) === "ja" ? "ja" : "all";
  } catch (e) { /* 私密瀏覽等情況讀不到，用預設值 */ }

  /** 把 {漢字|かな} 展開成 <ruby>，其餘照原樣輸出 */
  function ruby(text) {
    var frag = document.createDocumentFragment();
    var s = String(text || "");
    var last = 0;
    var m;
    RUBY.lastIndex = 0;
    while ((m = RUBY.exec(s)) !== null) {
      if (m.index > last) {
        frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      }
      var r = document.createElement("ruby");
      r.appendChild(document.createTextNode(m[1]));
      var rt = document.createElement("rt");
      rt.textContent = m[2];
      r.appendChild(rt);
      frag.appendChild(r);
      last = RUBY.lastIndex;
    }
    if (last < s.length) {
      frag.appendChild(document.createTextNode(s.slice(last)));
    }
    return frag;
  }

  /** 拿掉讀音，只留漢字原文（招牌、念給語音用） */
  function plain(text) {
    return String(text || "").replace(RUBY, "$1");
  }

  /** 只留讀音（全假名） */
  function reading(text) {
    return String(text || "").replace(RUBY, "$2");
  }

  /**
   * 一句話的標準排法：日文（ルビ）／羅馬拼音／中文。
   * o = { ja, romaji?, zh? }，沒有的欄位就不畫。
   */
  function line(o, cls) {
    var box = document.createElement("div");
    box.className = "t" + (cls ? " " + cls : "");
    var ja = document.createElement("p");
    ja.className = "t-ja";
    ja.lang = "ja";
    ja.appendChild(ruby(o.ja));
    box.appendChild(ja);
    if (o.romaji) {
      var r = document.createElement("p");
      r.className = "t-romaji";
      r.textContent = o.romaji;
      box.appendChild(r);
    }
    if (o.zh) {
      var z = document.createElement("p");
      z.className = "t-zh";
      z.textContent = o.zh;
      box.appendChild(z);
    }
    return box;
  }

  function getMode() {
    return mode;
  }

  function setMode(m) {
    mode = m === "ja" ? "ja" : "all";
    document.body.classList.toggle("mode-ja", mode === "ja");
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch (e) { /* 存不了也沒關係，只是下次要重選 */ }
  }

  window.TravelText = {
    ruby: ruby,
    plain: plain,
    reading: reading,
    line: line,
    getMode: getMode,
    setMode: setMode
  };
})();
