/* ============================================================
   builder.js ─ 出題器
   ------------------------------------------------------------
   老師填表 → 即時預覽 → 下載資料檔。預覽用的是 render.js 的
   renderSheet()，所以「看到的」就是「印出來的」，不會有兩套排版。

   產出的檔案：
     data/sheets/<id>.js  這張練習單
     data/kanji.js        只有在加了新字時才需要換
     data/strokes.js      同上（新字的筆順）
   ============================================================ */
(function () {
  "use strict";

  var A4_W = 793.7;
  var A4_H = 1123;
  var KVG = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";

  /* 加進來但還不在 data/ 裡的東西，匯出時要一起吐出來 */
  var newKanji = {};
  var newStrokes = {};

  var draft = {
    id: "n3-03",
    grade: "N3",
    label: "N3 ③",
    brand: "JLPT N3 漢字ドリル",
    scoreNote: "80点以上で合格。まちがえた漢字はもう一度書いてみましょう。",
    footer: "漢字れんしゅうシート ／ JLPT N3 ／ ",
    kanji: [],
    sections: {
      trace:   { on: true, points: 20, heading: "なぞってから、じぶんで書きましょう。",
                 cells: 5, guides: 2, rowHeight: 86 },
      reading: { on: true, points: 10, heading: "―の読み方をひらがなで書きましょう。",
                 items: [{ text: "", answer: "" }] },
      fill:    { on: true, points: 10, heading: "□に漢字を書きましょう。",
                 items: [{ text: "", hint: "", answer: "" }] },
      free:    { on: false, heading: "じぶんで なんかい も 書いてみましょう。", cells: 9 }
    }
  };

  var $ = function (id) { return document.getElementById(id); };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function allKanji() {
    var db = {};
    Object.keys(window.KANJI_DB || {}).forEach(function (k) { db[k] = window.KANJI_DB[k]; });
    Object.keys(newKanji).forEach(function (k) { db[k] = newKanji[k]; });
    return db;
  }

  /* ---------- 表單 → 練習單物件 ---------- */

  function toSheet() {
    var s = draft.sections;
    var sections = [];

    if (s.trace.on) sections.push({
      type: "trace", points: +s.trace.points || 0, heading: s.trace.heading,
      cells: +s.trace.cells || 5, guides: +s.trace.guides || 0,
      rowHeight: +s.trace.rowHeight || 86
    });

    if (s.reading.on) sections.push({
      type: "reading", points: +s.reading.points || 0, heading: s.reading.heading,
      items: s.reading.items.filter(function (i) { return i.text; })
    });

    if (s.fill.on) sections.push({
      type: "fill", points: +s.fill.points || 0, heading: s.fill.heading,
      items: s.fill.items.filter(function (i) { return i.text; })
    });

    if (s.free.on) sections.push({
      type: "free", heading: s.free.heading, cells: +s.free.cells || 9
    });

    return {
      id: draft.id,
      grade: /^\d+$/.test(draft.grade) ? +draft.grade : draft.grade,
      label: draft.label,
      brand: draft.brand,
      kanji: draft.kanji.slice(),
      scoreNote: draft.scoreNote,
      footer: draft.footer,
      sections: sections
    };
  }

  /* ---------- 預覽 ---------- */

  function renderPreview() {
    var paper = $("bd-paper");
    paper.innerHTML = "";

    var sheet = toSheet();
    if (!sheet.kanji.length) {
      paper.appendChild(el("p", "bd-hint", "漢字をえらぶと、ここにプレビューが出ます。"));
      $("f-fitwarn").textContent = "";
      return;
    }

    /* 字庫暫時併入新字，renderSheet 才查得到 */
    var backup = window.KANJI_DB;
    window.KANJI_DB = allKanji();
    var node = window.KanjiRender.renderSheet(sheet);
    paper.appendChild(node);
    window.KANJI_DB = backup;

    fitPreview();
    checkFit(node);
    $("f-manifest").textContent = manifestLine(sheet);
    $("bd-open").href = "sheet.html?id=" + encodeURIComponent(sheet.id);
  }

  function fitPreview() {
    var paper = $("bd-paper");
    var avail = paper.clientWidth;
    var k = Math.min(1, avail / A4_W);
    paper.style.setProperty("--pv", k.toFixed(4));
    $("bd-scale").textContent = "プレビュー " + Math.round(k * 100) + "%";
  }

  /** A4 是 overflow:hidden，超出的內容會被無聲裁掉，所以一定要主動檢查 */
  function checkFit(sheetNode) {
    var over = sheetNode.scrollHeight - sheetNode.clientHeight;
    var warn = $("f-fitwarn");
    if (over > 0) {
      warn.className = "bd-hint bd-warn";
      warn.textContent = "⚠ A4 に " + over + "px はみ出しています。漢字をへらすか、"
                       + "大問をオフにするか、なぞり書きの「1行の高さ」を下げてください。";
    } else {
      warn.className = "bd-hint bd-ok";
      warn.textContent = "✓ A4 1ページにおさまっています。";
    }
  }

  function manifestLine(sheet) {
    return "{ id: " + JSON.stringify(sheet.id) +
           ", grade: " + JSON.stringify(sheet.grade) +
           ", label: " + JSON.stringify(sheet.label) +
           ", kanji: " + JSON.stringify(sheet.kanji) + " },";
  }

  /* ---------- 產生檔案 ---------- */

  function q(v) { return JSON.stringify(v); }

  function sheetSource(sheet) {
    var lines = [];
    lines.push("/* ============================================================");
    lines.push("   練習單：" + sheet.label + " / " + sheet.kanji.join("・"));
    lines.push("   ------------------------------------------------------------");
    lines.push("   出題器（builder.html）で作成。手で直しても大丈夫です。");
    lines.push("   ============================================================ */");
    lines.push("window.SHEETS = window.SHEETS || {};");
    lines.push("window.SHEETS[" + q(sheet.id) + "] = {");
    lines.push("  id: " + q(sheet.id) + ",");
    lines.push("  grade: " + q(sheet.grade) + ",");
    lines.push("  label: " + q(sheet.label) + ",");
    lines.push("  brand: " + q(sheet.brand) + ",");
    lines.push("  kanji: " + q(sheet.kanji) + ",");
    lines.push("  scoreNote: " + q(sheet.scoreNote) + ",");
    lines.push("  footer: " + q(sheet.footer) + ",");
    lines.push("");
    lines.push("  sections: [");

    sheet.sections.forEach(function (sec, i) {
      var tail = i === sheet.sections.length - 1 ? "" : ",";
      lines.push("    {");
      lines.push("      type: " + q(sec.type) + ",");
      if (sec.points) lines.push("      points: " + sec.points + ",");
      lines.push("      heading: " + q(sec.heading) + (sec.items ? "," : ","));
      if (sec.type === "trace") {
        lines.push("      cells: " + sec.cells + ",");
        lines.push("      guides: " + sec.guides + ",");
        lines.push("      rowHeight: " + sec.rowHeight);
      } else if (sec.type === "free") {
        lines.push("      cells: " + sec.cells);
      } else {
        lines.push("      items: [");
        sec.items.forEach(function (it, j) {
          var t = j === sec.items.length - 1 ? "" : ",";
          var parts = ["text: " + q(it.text)];
          if (it.hint != null && it.hint !== "") parts.push("hint: " + q(it.hint));
          parts.push("answer: " + q(it.answer));
          lines.push("        { " + parts.join(", ") + " }" + t);
        });
        lines.push("      ]");
      }
      lines.push("    }" + tail);
    });

    lines.push("  ]");
    lines.push("};");
    return lines.join("\n") + "\n";
  }

  function kanjiSource() {
    var db = allKanji();
    var body = Object.keys(db).map(function (ch) {
      var d = db[ch];
      var ex = (d.examples || []).map(function (e) {
        return "      { w: " + q(e.w) + ", r: " + q(e.r) + " }";
      }).join(",\n");
      return "  " + q(ch) + ": {\n" +
             "    strokes: " + d.strokes + ",\n" +
             "    yomi: " + q(d.yomi) + ",\n" +
             "    examples: [\n" + ex + "\n    ]\n" +
             "  }";
    }).join(",\n");

    return "/* ============================================================\n" +
           "   かん字れんしゅうシート ─ 漢字字庫（全練習單共用）\n" +
           "   出題器（builder.html）で更新。\n" +
           "   ============================================================ */\n" +
           "window.KANJI_DB = {\n" + body + "\n};\n";
  }

  function strokesSource() {
    var db = {};
    Object.keys(window.STROKES || {}).forEach(function (k) { db[k] = window.STROKES[k]; });
    Object.keys(newStrokes).forEach(function (k) { db[k] = newStrokes[k]; });

    var body = Object.keys(db).sort().map(function (ch) {
      var d = db[ch];
      return "  " + q(ch) + ": {\n" +
             "    size: " + d.size + ",\n" +
             "    paths: [\n" +
             d.paths.map(function (p) { return "      " + q(p); }).join(",\n") + "\n" +
             "    ],\n" +
             "    nums: " + JSON.stringify(d.nums) + "\n" +
             "  }";
    }).join(",\n");

    return "/* 筆順資料（KanjiVG, CC BY-SA 3.0 / https://kanjivg.tagaini.net/）\n" +
           "   出題器または tools/fetch-kanjivg.js で生成。手で直さないでください。 */\n" +
           "window.STROKES = {\n" + body + "\n};\n";
  }

  function download(name, text) {
    var blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- 漢字選擇 ---------- */

  function paintPool() {
    var pool = $("f-pool");
    pool.innerHTML = "";
    var db = allKanji();
    Object.keys(db).forEach(function (ch) {
      var b = el("button", "bd-chip" + (draft.kanji.indexOf(ch) >= 0 ? " is-on" : ""));
      b.type = "button";
      b.appendChild(document.createTextNode(ch));
      b.appendChild(el("small", null, db[ch].strokes + "画"));
      b.addEventListener("click", function () {
        var i = draft.kanji.indexOf(ch);
        if (i >= 0) draft.kanji.splice(i, 1); else draft.kanji.push(ch);
        syncFooter();
        paintPool();
        paintPicked();
        renderPreview();
      });
      pool.appendChild(b);
    });
  }

  function paintPicked() {
    var box = $("f-picked");
    box.innerHTML = "";
    if (!draft.kanji.length) {
      box.appendChild(el("span", "bd-empty", "まだありません"));
      return;
    }
    draft.kanji.forEach(function (ch, i) {
      var b = el("button", "bd-chip is-on");
      b.type = "button";
      b.title = "クリックではずす";
      b.appendChild(document.createTextNode(ch));
      b.appendChild(el("small", null, String(i + 1) + "番目"));
      b.addEventListener("click", function () {
        draft.kanji.splice(i, 1);
        syncFooter();
        paintPool();
        paintPicked();
        renderPreview();
      });
      box.appendChild(b);
    });
  }

  /** footer 尾巴自動跟著選到的字跑，老師少打一次字 */
  function syncFooter() {
    var base = draft.footer.split(" ／ ").slice(0, 2).join(" ／ ");
    draft.footer = base + " ／ " + draft.kanji.join("・");
    $("f-footer").value = draft.footer;
  }

  /* ---------- 新字：從 KanjiVG 抓筆順 ---------- */

  function fetchStrokes(ch) {
    var code = ch.codePointAt(0).toString(16).padStart(5, "0");
    return fetch(KVG + code + ".svg").then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    }).then(function (svg) {
      var paths = [];
      var re = /<path[^>]*\sd="([^"]+)"/g, m;
      while ((m = re.exec(svg)) !== null) paths.push(m[1].trim());
      var nums = [];
      var rn = /<text transform="matrix\(1 0 0 1 ([\d.-]+) ([\d.-]+)\)">/g;
      while ((m = rn.exec(svg)) !== null) nums.push([+(+m[1]).toFixed(2), +(+m[2]).toFixed(2)]);
      var vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
      if (!paths.length) throw new Error("筆畫が見つかりません");
      return { size: vb ? +vb[1] : 109, paths: paths, nums: nums };
    });
  }

  function wireNewKanji() {
    var charInput = $("n-char");
    var status = $("n-status");
    var pending = null;

    charInput.addEventListener("input", function () {
      var ch = charInput.value.trim().charAt(0);
      pending = null;
      if (!ch) { status.textContent = "漢字を入れると、かくすうと筆順を KanjiVG から取ってきます。"; return; }
      status.className = "bd-hint";
      status.textContent = "KanjiVG から取得中…";
      fetchStrokes(ch).then(function (d) {
        pending = d;
        $("n-strokes").value = d.paths.length;
        status.className = "bd-hint bd-ok";
        status.textContent = "✓ " + ch + " ＝ " + d.paths.length + "画（筆順データも取れました）";
      }).catch(function (e) {
        status.className = "bd-hint bd-warn";
        status.textContent = "筆順は取れませんでした（" + e.message + "）。かくすうは手で入れてください。";
      });
    });

    $("n-add").addEventListener("click", function () {
      var ch = charInput.value.trim().charAt(0);
      if (!ch) { status.textContent = "漢字を入れてください。"; return; }
      var ex = [];
      if ($("n-w1").value) ex.push({ w: $("n-w1").value, r: $("n-r1").value });
      if ($("n-w2").value) ex.push({ w: $("n-w2").value, r: $("n-r2").value });

      newKanji[ch] = {
        strokes: +$("n-strokes").value || (pending ? pending.paths.length : 0),
        yomi: $("n-yomi").value,
        examples: ex
      };
      if (pending) newStrokes[ch] = pending;

      if (draft.kanji.indexOf(ch) < 0) draft.kanji.push(ch);
      ["n-char", "n-strokes", "n-yomi", "n-w1", "n-r1", "n-w2", "n-r2"].forEach(function (id) { $(id).value = ""; });
      status.className = "bd-hint bd-ok";
      status.textContent = "✓ " + ch + " を字庫にたしました。";
      pending = null;

      syncFooter();
      paintPool();
      paintPicked();
      renderPreview();
    });
  }

  /* ---------- 大題表單 ---------- */

  var SECTION_LABEL = {
    trace:   "1. なぞり書き",
    reading: "2. 読み方（ひらがなで答える）",
    fill:    "3. 漢字を書く（□にあてはめる）",
    free:    "4. 自由練習"
  };

  function numField(label, obj, key, min, max) {
    var l = el("label", "bd-f");
    l.appendChild(el("span", null, label));
    var i = document.createElement("input");
    i.type = "number";
    i.value = obj[key];
    if (min != null) i.min = min;
    if (max != null) i.max = max;
    i.addEventListener("input", function () { obj[key] = i.value; renderPreview(); });
    l.appendChild(i);
    return l;
  }

  function textField(label, obj, key) {
    var l = el("label", "bd-f");
    l.appendChild(el("span", null, label));
    var i = document.createElement("input");
    i.value = obj[key] || "";
    i.addEventListener("input", function () { obj[key] = i.value; renderPreview(); });
    l.appendChild(i);
    return l;
  }

  function itemRows(sec, type) {
    var wrap = el("div");

    function paint() {
      wrap.innerHTML = "";
      sec.items.forEach(function (item, idx) {
        var row = el("div", "bd-item" + (type === "fill" ? " bd-item--fill" : ""));

        var t = document.createElement("input");
        t.value = item.text;
        t.placeholder = type === "fill" ? "{}験を つむ。" : "貴重な{経験}をする。";
        t.addEventListener("input", function () { item.text = t.value; renderPreview(); });
        row.appendChild(t);

        if (type === "fill") {
          var h = document.createElement("input");
          h.value = item.hint || "";
          h.placeholder = "けい";
          h.addEventListener("input", function () { item.hint = h.value; renderPreview(); });
          row.appendChild(h);
        }

        var a = document.createElement("input");
        a.value = item.answer;
        a.placeholder = type === "fill" ? "経" : "けいけん";
        a.addEventListener("input", function () { item.answer = a.value; renderPreview(); });
        row.appendChild(a);

        var del = el("button", "bd-del", "×");
        del.type = "button";
        del.title = "この行を消す";
        del.addEventListener("click", function () {
          sec.items.splice(idx, 1);
          paint();
          renderPreview();
        });
        row.appendChild(del);

        wrap.appendChild(row);
      });

      var add = el("button", "btn-plain bd-add", "＋ 1行たす");
      add.type = "button";
      add.addEventListener("click", function () {
        sec.items.push(type === "fill" ? { text: "", hint: "", answer: "" } : { text: "", answer: "" });
        paint();
        renderPreview();
      });
      wrap.appendChild(add);
    }

    paint();
    return wrap;
  }

  function buildSectionForms() {
    var host = $("f-sections");
    host.innerHTML = "";

    ["trace", "reading", "fill", "free"].forEach(function (type) {
      var sec = draft.sections[type];
      var box = el("div", "bd-sec" + (sec.on ? "" : " is-off"));

      var head = el("div", "bd-sec__head");
      var lab = el("label");
      var chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = sec.on;
      chk.addEventListener("change", function () {
        sec.on = chk.checked;
        box.classList.toggle("is-off", !sec.on);
        renderPreview();
      });
      lab.appendChild(chk);
      lab.appendChild(document.createTextNode(SECTION_LABEL[type]));
      head.appendChild(lab);
      box.appendChild(head);

      var body = el("div", "bd-sec__body");
      body.appendChild(textField("といのぶん", sec, "heading"));

      if (type === "trace") {
        var g = el("div", "bd-grid2");
        g.appendChild(numField("点数", sec, "points", 0, 100));
        g.appendChild(numField("マスの数", sec, "cells", 1, 8));
        body.appendChild(g);
        var g2 = el("div", "bd-grid2");
        g2.appendChild(numField("なぞる数", sec, "guides", 0, 8));
        g2.appendChild(numField("1行の高さ", sec, "rowHeight", 60, 120));
        body.appendChild(g2);
      } else if (type === "free") {
        body.appendChild(numField("マスの数", sec, "cells", 1, 12));
      } else {
        body.appendChild(numField("点数", sec, "points", 0, 100));
        body.appendChild(el("p", "bd-hint",
          type === "fill"
            ? "ぶん / ふりがな / こたえ。{} が田字格になります。"
            : "ぶん / こたえ。{ } でかこんだところに赤い下線がつきます。"));
        body.appendChild(itemRows(sec, type));
      }

      box.appendChild(body);
      host.appendChild(box);
    });
  }

  /* ---------- 基本資料欄位 ---------- */

  function wireMeta() {
    [["f-id", "id"], ["f-grade", "grade"], ["f-label", "label"],
     ["f-brand", "brand"], ["f-note", "scoreNote"], ["f-footer", "footer"]]
      .forEach(function (pair) {
        var input = $(pair[0]);
        input.value = draft[pair[1]];
        input.addEventListener("input", function () {
          draft[pair[1]] = input.value;
          renderPreview();
        });
      });
  }

  function wireDownload() {
    $("f-download").addEventListener("click", function () {
      var sheet = toSheet();
      if (!sheet.kanji.length) { alert("漢字をえらんでください。"); return; }
      download(sheet.id + ".js", sheetSource(sheet));
      if (Object.keys(newKanji).length) download("kanji.js", kanjiSource());
      if (Object.keys(newStrokes).length) download("strokes.js", strokesSource());
    });
  }

  function wireNav() {
    var toggle = $("nav-toggle");
    var scrim = $("nav-scrim");
    function setNav(open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    toggle.addEventListener("click", function () {
      setNav(!document.body.classList.contains("nav-open"));
    });
    scrim.addEventListener("click", function () { setNav(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
  }

  /* ---------- 啟動 ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    wireMeta();
    wireNewKanji();
    wireNav();
    wireDownload();
    buildSectionForms();
    paintPool();
    paintPicked();
    renderPreview();
    window.addEventListener("resize", function () {
      fitPreview();
    });
  });
})();
