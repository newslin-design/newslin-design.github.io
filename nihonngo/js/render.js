/* ============================================================
   render.js ─ 把 data/ 裡的資料畫成練習單
   ------------------------------------------------------------
   這個檔案不認識任何一個漢字或題目，全部從 window.KANJI_DB 與
   window.SHEETS 讀。要加題型，就在 RENDERERS 裡多寫一個函式。
   ============================================================ */
(function () {
  "use strict";

  var CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

  /* ---------- 小工具 ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function cell(extraCls) {
    return el("div", "cell" + (extraCls ? " " + extraCls : ""));
  }

  function glyph(ch, cls) {
    return el("div", "cell__glyph" + (cls ? " " + cls : ""), ch);
  }

  /** grade 是數字就是日本小學年級，是字串（"N3"）就照原樣顯示 */
  function gradeLabel(grade) {
    return typeof grade === "number" ? grade + "年生" : String(grade || "");
  }

  function kanjiInfo(ch) {
    var info = window.KANJI_DB && window.KANJI_DB[ch];
    if (!info) {
      console.warn("[render] kanji.js 裡找不到「" + ch + "」，請先補進字庫");
      info = { yomi: "", examples: [] };
    }
    /* 畫數沒填就拿筆順資料的筆數，兩邊不會對不起來 */
    if (info.strokes == null) {
      var sd = window.STROKES && window.STROKES[ch];
      info = Object.assign({}, info, { strokes: sd ? sd.paths.length : "" });
    }
    return info;
  }

  /**
   * 把題目字串裡的標記展開成節點。
   *   {字}  → 紅色底線的目標字
   *   {}    → 田字格空格（fill 題用）
   * 其餘照原樣輸出。
   */
  function parseText(text, onBlank) {
    var frag = document.createDocumentFragment();
    var re = /\{([^}]*)\}/g;
    var last = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) {
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      }
      if (m[1] === "") {
        frag.appendChild(onBlank ? onBlank() : el("span", "q__target", "□"));
      } else {
        frag.appendChild(el("span", "q__target", m[1]));
      }
      last = re.lastIndex;
    }
    if (last < text.length) {
      frag.appendChild(document.createTextNode(text.slice(last)));
    }
    return frag;
  }

  function sectionShell(no, section) {
    var box = el("section", "section");
    var head = el("div", "section__head");
    head.appendChild(el("div", "section__no", String(no)));
    head.appendChild(el("div", "section__title", section.heading || ""));
    if (section.points) {
      head.appendChild(
        el("div", "section__points", "ぜんぶできて" + section.points + "てん")
      );
    }
    box.appendChild(head);
    return box;
  }

  /* ---------- 各題型 ---------- */

  var RENDERERS = {

    /* 大題 1：範字 + 畫數 + 描紅格 + よみかた／つかいかた 卡 */
    trace: function (section, sheet) {
      var frag = document.createDocumentFragment();
      sheet.kanji.forEach(function (ch) {
        var info = kanjiInfo(ch);
        var row = el("div", "trace-row");

        var model = cell("trace-row__model");
        model.setAttribute("data-kanji", ch);
        model.appendChild(glyph(ch));
        row.appendChild(model);

        row.appendChild(el("div", "trace-row__strokes", info.strokes + "かく"));

        var cells = el("div", "trace-row__cells");
        var total = section.cells || 5;
        var guides = section.guides || 0;
        for (var i = 0; i < total; i++) {
          var c = cell(i < guides ? "cell--guide" : null);
          c.setAttribute("data-write", ch);
          if (i < guides) c.appendChild(glyph(ch));
          cells.appendChild(c);
        }
        row.appendChild(cells);

        row.appendChild(infoCard(info));
        frag.appendChild(row);
      });
      return frag;
    },

    /* 大題 2：讀音題 */
    reading: function (section) {
      var grid = el("div", "qgrid");
      (section.items || []).forEach(function (item, i) {
        var q = el("div", "q");
        q.setAttribute("data-answer", item.answer || "");
        q.appendChild(el("span", "q__no", CIRCLED[i] || i + 1 + "."));

        var t = el("span", "q__text");
        t.appendChild(parseText(item.text));
        q.appendChild(t);

        var ans = el("span", "q__answer");
        ans.appendChild(document.createTextNode("（"));
        var line = el("i");
        line.appendChild(el("span", "fill-in", item.answer || ""));
        ans.appendChild(line);
        ans.appendChild(document.createTextNode("）"));
        q.appendChild(ans);

        grid.appendChild(q);
      });
      return grid;
    },

    /* 大題 3：填字題 */
    fill: function (section) {
      var grid = el("div", "fgrid");
      (section.items || []).forEach(function (item) {
        var f = el("div", "f");
        f.setAttribute("data-answer", item.answer || "");

        var boxWrap = el("div", "f__box");
        if (item.hint) boxWrap.appendChild(el("div", "f__hint", item.hint));
        var c = cell();
        if (item.answer) c.appendChild(glyph(item.answer, "answer"));
        boxWrap.appendChild(c);

        var text = el("span", "f__text");
        var placed = false;
        text.appendChild(parseText(item.text, function () {
          placed = true;
          return boxWrap;
        }));

        if (!placed) f.appendChild(boxWrap);
        f.appendChild(text);
        grid.appendChild(f);
      });
      return grid;
    },

    /* 大題 4：自由練習 */
    free: function (section, sheet) {
      var frag = document.createDocumentFragment();
      sheet.kanji.forEach(function (ch) {
        var row = el("div", "free-row");
        var label = el("div", "free-row__label", ch);
        label.setAttribute("data-kanji", ch);
        row.appendChild(label);
        var cells = el("div", "free-row__cells");
        for (var i = 0; i < (section.cells || 9); i++) {
          var c = cell();
          c.setAttribute("data-write", ch);
          cells.appendChild(c);
        }
        row.appendChild(cells);
        frag.appendChild(row);
      });
      return frag;
    }
  };

  /* よみかた／つかいかた 卡片 */
  function infoCard(info) {
    var card = el("div", "info");

    var r1 = el("div", "info__row info__row--yomi");
    r1.appendChild(el("div", "info__label", "よみかた"));
    r1.appendChild(el("div", "info__body info__body--yomi", info.yomi || ""));
    card.appendChild(r1);

    var r2 = el("div", "info__row");
    r2.appendChild(el("div", "info__label", "つかいかた"));
    var body = el("div", "info__body");
    (info.examples || []).forEach(function (ex) {
      var w = el("span", "info__word", ex.w);
      if (ex.r) w.appendChild(el("small", null, "(" + ex.r + ")"));
      body.appendChild(w);
    });
    r2.appendChild(body);
    card.appendChild(r2);

    return card;
  }

  /* ---------- 組一整張紙 ---------- */

  function renderSheet(sheet) {
    var page = el("article", "sheet");

    /* 頁首橫幅 */
    var banner = el("div", "banner");
    banner.appendChild(el("div", "banner__pill", sheet.label || ""));
    var title = el("div", "banner__title");
    sheet.kanji.forEach(function (ch, i) {
      if (i) title.appendChild(el("span", "dot", " ● "));
      title.appendChild(document.createTextNode(ch));
    });
    banner.appendChild(title);
    banner.appendChild(el("div", "banner__brand", sheet.brand || ""));
    page.appendChild(banner);

    /* 姓名／分數 */
    var meta = el("div", "meta");
    var name = el("div", "meta__name");
    name.appendChild(document.createTextNode("なまえ："));
    name.appendChild(el("i"));
    meta.appendChild(name);
    meta.appendChild(el("div", "meta__spacer"));

    var score = el("div", "meta__score");
    var line = el("div", "meta__score-line");
    var slot = el("i");
    slot.appendChild(el("span", "score-value"));
    line.appendChild(slot);
    line.appendChild(document.createTextNode("てん"));
    score.appendChild(line);
    if (sheet.scoreNote) score.appendChild(el("div", "meta__score-note", sheet.scoreNote));
    meta.appendChild(score);
    page.appendChild(meta);

    /* 各大題 */
    (sheet.sections || []).forEach(function (section, i) {
      var fn = RENDERERS[section.type];
      if (!fn) {
        console.warn("[render] 不認識的題型：" + section.type);
        return;
      }
      var box = sectionShell(i + 1, section);
      box.setAttribute("data-type", section.type);
      if (section.points) box.setAttribute("data-points", section.points);
      /* 一頁放 4 個字時要縮，所以列高與格子大小可以由資料覆寫 */
      if (section.rowHeight) box.style.setProperty("--row", section.rowHeight + "px");
      if (section.cellSize) box.style.setProperty("--cell", section.cellSize + "px");
      box.appendChild(fn(section, sheet));
      page.appendChild(box);
    });

    page.appendChild(el("div", "sheet__footer", sheet.footer || ""));
    return page;
  }

  /* ---------- 載入 ---------- */

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("載入失敗：" + src)); };
      document.head.appendChild(s);
    });
  }

  function ensureSheet(id) {
    if (window.SHEETS && window.SHEETS[id]) return Promise.resolve(window.SHEETS[id]);
    return loadScript("data/sheets/" + id + ".js").then(function () {
      return window.SHEETS && window.SHEETS[id];
    });
  }

  function requestedIds() {
    var q = new URLSearchParams(location.search).get("id");
    if (q) return q.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var m = window.SHEET_MANIFEST || [];
    return m.length ? [m[0].id] : [];
  }

  /* ---------- 工具列 ---------- */

  function buildToolbar(ids) {
    var bar = document.querySelector(".sidebar");
    if (!bar) return;

    /* 手機版：漢堡按鈕拉出／收起側欄 */
    var toggle = document.getElementById("nav-toggle");
    var scrim = document.getElementById("nav-scrim");
    function setNav(open) {
      document.body.classList.toggle("nav-open", open);
      if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (toggle) toggle.addEventListener("click", function () {
      setNav(!document.body.classList.contains("nav-open"));
    });
    if (scrim) scrim.addEventListener("click", function () { setNav(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
    /* 手機上選完一項就把側欄收起來，免得擋住紙 */
    bar.addEventListener("click", function (e) {
      if (window.matchMedia("(max-width: 980px)").matches &&
          e.target.tagName === "BUTTON") setNav(false);
    });

    var picker = bar.querySelector("#sheet-picker");
    if (picker) {
      (window.SHEET_MANIFEST || []).forEach(function (s) {
        var o = document.createElement("option");
        o.value = s.id;
        o.textContent = gradeLabel(s.grade) + " ／ " + s.label + " ／ " + s.kanji.join("・");
        if (ids.indexOf(s.id) >= 0) o.selected = true;
        picker.appendChild(o);
      });
      picker.addEventListener("change", function () {
        location.search = "?id=" + picker.value;
      });
    }

    var mode = bar.querySelector("#mode-picker");
    if (mode) {
      mode.addEventListener("change", function () { setMode(mode.value); });
    }

    var guide = bar.querySelector("#guide-level");
    if (guide) {
      guide.addEventListener("change", function () {
        document.documentElement.style.setProperty("--guide-opacity", guide.value);
      });
    }

    var undo = bar.querySelector("#btn-undo");
    if (undo) undo.addEventListener("click", function () {
      if (window.KanjiTrace) window.KanjiTrace.undo();
    });

    var clear = bar.querySelector("#btn-clear");
    if (clear) clear.addEventListener("click", function () {
      if (window.KanjiTrace) window.KanjiTrace.clearAll();
    });

    var mark = bar.querySelector("#btn-mark");
    if (mark) mark.addEventListener("click", function () {
      if (window.KanjiQuiz) window.KanjiQuiz.grade();
    });

    var retry = bar.querySelector("#btn-retry");
    if (retry) retry.addEventListener("click", function () {
      if (window.KanjiQuiz) window.KanjiQuiz.reset();
    });

    var print = bar.querySelector("#btn-print");
    if (print) print.addEventListener("click", function () { window.print(); });
  }

  /**
   * 三種模式：
   *   print    印刷用，什麼都不互動（預設）
   *   practice 學生自己作答：可以寫字、填答案、採點
   *   answer   解答版，答案直接印在上面
   */
  function setMode(next) {
    document.body.dataset.mode = next;
    if (next === "practice") {
      if (window.KanjiTrace) window.KanjiTrace.enable();
      if (window.KanjiQuiz) window.KanjiQuiz.enable();
    } else if (window.KanjiQuiz) {
      window.KanjiQuiz.disable();
    }
  }

  /* ---------- 啟動 ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    var stage = document.querySelector(".stage");
    var ids = requestedIds();

    if (!ids.length) {
      stage.appendChild(el("p", "no-print", "找不到練習單，請確認 data/manifest.js。"));
      return;
    }

    buildToolbar(ids);

    Promise.all(ids.map(ensureSheet)).then(function (sheets) {
      sheets.forEach(function (sheet, i) {
        if (!sheet) {
          stage.appendChild(el("p", "no-print", "讀不到練習單：" + ids[i]));
          return;
        }
        stage.appendChild(renderSheet(sheet));
      });
      var first = sheets.find(Boolean);
      if (first) {
        document.title = "かん字れんしゅう " + first.kanji.join("・");
      }
      document.dispatchEvent(new CustomEvent("sheet:rendered"));
    }).catch(function (err) {
      stage.appendChild(el("p", "no-print", err.message));
    });
  });
})();
