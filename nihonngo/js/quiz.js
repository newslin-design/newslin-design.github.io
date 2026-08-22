/* ============================================================
   quiz.js ─ 練習模式：線上作答、採點、貼紙
   ------------------------------------------------------------
   大題 2（よみかた）：括號裡變成輸入格，用ひらがな打答案。
   大題 3（かん字）：點田字格會跳出候選字，選一個填進去。
   大題 1（なぞり書き）：每一格都寫過就算完成。
   按「まるつけ」才會判對錯，寫完之前不會偷偷告訴你答案。

   配分規則：每一題平均分配該大題的分數（部分給分），
   最後換算成百分制填進「てん」欄——原教材寫「80てんいじょうで
   シールをはろう」，總分只有 40 分的話那條線會對不起來。
   想改成「ぜんぶできて才給分」，把 scoreSection() 換掉即可。
   ============================================================ */
(function () {
  "use strict";

  var PASS = 80;
  var active = false;

  /* ---------- 假名正規化：全形空白、片假名、長音都吃掉 ---------- */
  function normalize(s) {
    return String(s || "")
      .replace(/[\s　]/g, "")
      .replace(/[ァ-ヶ]/g, function (c) {
        return String.fromCharCode(c.charCodeAt(0) - 0x60);
      })
      .trim();
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function sheets() {
    return document.querySelectorAll(".sheet");
  }

  /* ---------- 大題 2：填讀音 ---------- */

  function buildReadingInputs(sheet) {
    Array.prototype.forEach.call(sheet.querySelectorAll(".q"), function (q) {
      if (q.__input) return;
      var slot = q.querySelector(".q__answer i");
      if (!slot) return;

      var input = el("input", "q__input");
      input.type = "text";
      input.autocomplete = "off";
      input.setAttribute("aria-label", "よみかた");
      input.addEventListener("input", function () { clearMark(q); });
      slot.appendChild(input);

      q.appendChild(el("span", "mark"));
      q.__input = input;
    });
  }

  /* ---------- 大題 3：選漢字 ---------- */

  /** 候選字＝這張紙上的字，再從字庫補到 5 個，順序打亂 */
  function candidates(sheet) {
    var own = [];
    Array.prototype.forEach.call(sheet.querySelectorAll("[data-write]"), function (c) {
      var ch = c.getAttribute("data-write");
      if (own.indexOf(ch) < 0) own.push(ch);
    });

    var pool = Object.keys(window.KANJI_DB || {}).filter(function (ch) {
      return own.indexOf(ch) < 0;
    });
    while (own.length < 5 && pool.length) {
      own.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return own.sort(function () { return Math.random() - 0.5; });
  }

  function buildFillPickers(sheet) {
    var choices = candidates(sheet);

    Array.prototype.forEach.call(sheet.querySelectorAll(".f"), function (f) {
      if (f.__picker) return;
      var box = f.querySelector(".f__box .cell");
      if (!box) return;

      var pick = el("div", "cell__glyph pick");
      box.appendChild(pick);

      var pop = el("div", "picker no-print");
      choices.forEach(function (ch) {
        var b = el("button", "picker__opt", ch);
        b.type = "button";
        b.addEventListener("click", function (e) {
          e.stopPropagation();
          pick.textContent = ch;
          clearMark(f);
          closePickers();
        });
        pop.appendChild(b);
      });
      var clear = el("button", "picker__opt picker__opt--clear", "けす");
      clear.type = "button";
      clear.addEventListener("click", function (e) {
        e.stopPropagation();
        pick.textContent = "";
        clearMark(f);
        closePickers();
      });
      pop.appendChild(clear);
      f.querySelector(".f__box").appendChild(pop);

      box.addEventListener("click", function (e) {
        if (!active) return;
        e.stopPropagation();
        var open = pop.classList.contains("is-open");
        closePickers();
        if (!open) pop.classList.add("is-open");
      });

      f.appendChild(el("span", "mark"));
      f.__picker = pick;
    });
  }

  function closePickers() {
    Array.prototype.forEach.call(document.querySelectorAll(".picker.is-open"), function (p) {
      p.classList.remove("is-open");
    });
  }

  /* ---------- 判對錯 ---------- */

  function clearMark(node) {
    node.classList.remove("is-right", "is-wrong");
    var m = node.querySelector(".mark");
    if (m) m.textContent = "";
  }

  function judge(node, got, want) {
    var ok = normalize(got) === normalize(want) && normalize(got) !== "";
    node.classList.toggle("is-right", ok);
    node.classList.toggle("is-wrong", !ok);
    var m = node.querySelector(".mark");
    if (m) m.textContent = ok ? "○" : "×";
    return ok;
  }

  /** 一個大題的得分：答對幾題就拿幾分（平均分配） */
  function scoreSection(correct, total, points) {
    if (!total) return 0;
    return points * correct / total;
  }

  function gradeSheet(sheet) {
    var earned = 0;
    var possible = 0;

    Array.prototype.forEach.call(sheet.querySelectorAll(".section"), function (sec) {
      var points = +sec.getAttribute("data-points") || 0;
      var type = sec.getAttribute("data-type");
      if (!points) return;

      if (type === "reading") {
        var qs = sec.querySelectorAll(".q");
        var n = 0;
        Array.prototype.forEach.call(qs, function (q) {
          if (judge(q, q.__input ? q.__input.value : "", q.getAttribute("data-answer"))) n++;
        });
        possible += points;
        earned += scoreSection(n, qs.length, points);

      } else if (type === "fill") {
        var fs = sec.querySelectorAll(".f");
        var k = 0;
        Array.prototype.forEach.call(fs, function (f) {
          if (judge(f, f.__picker ? f.__picker.textContent : "", f.getAttribute("data-answer"))) k++;
        });
        possible += points;
        earned += scoreSection(k, fs.length, points);

      } else if (type === "trace") {
        /* 每一格都寫過就算完成，沒開なぞり書き就整段不列入計分 */
        var cells = sec.querySelectorAll(".cell[data-write]");
        if (!cells.length || !cells[0].__traceCanvas) return;
        var written = 0;
        Array.prototype.forEach.call(cells, function (c) {
          if (c.__traceCanvas && c.__traceCanvas.__strokes.length) written++;
        });
        possible += points;
        earned += scoreSection(written, cells.length, points);
      }
    });

    return possible ? Math.round(earned / possible * 100) : null;
  }

  function showScore(sheet, score) {
    var slot = sheet.querySelector(".score-value");
    if (slot) slot.textContent = score == null ? "" : String(score);

    var old = sheet.querySelector(".stamp");
    if (old) old.remove();
    if (score != null && score >= PASS) {
      var stamp = el("div", "stamp no-print");
      stamp.appendChild(el("span", "stamp__main", "よくできました"));
      stamp.appendChild(el("span", "stamp__sub", score + "てん"));
      sheet.appendChild(stamp);
      stamp.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /* ---------- 對外 ---------- */

  function enable() {
    active = true;
    Array.prototype.forEach.call(sheets(), function (sheet) {
      buildReadingInputs(sheet);
      buildFillPickers(sheet);
    });
  }

  function disable() {
    active = false;
    closePickers();
  }

  function grade() {
    if (!active) return;
    Array.prototype.forEach.call(sheets(), function (sheet) {
      showScore(sheet, gradeSheet(sheet));
    });
  }

  function reset() {
    Array.prototype.forEach.call(sheets(), function (sheet) {
      Array.prototype.forEach.call(sheet.querySelectorAll(".q, .f"), function (node) {
        clearMark(node);
        if (node.__input) node.__input.value = "";
        if (node.__picker) node.__picker.textContent = "";
      });
      showScore(sheet, null);
    });
    if (window.KanjiTrace) window.KanjiTrace.clearAll();
  }

  document.addEventListener("click", closePickers);

  document.addEventListener("sheet:rendered", function () {
    if (document.body.dataset.mode === "practice") enable();
  });

  window.KanjiQuiz = {
    enable: enable,
    disable: disable,
    grade: grade,
    reset: reset
  };
})();
