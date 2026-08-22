/* ============================================================
   trace.js ─ 在田字格上直接寫字
   ------------------------------------------------------------
   工具列打開「なぞり書き」之後，每個空格會蓋一層 canvas，
   滑鼠、觸控、Apple Pencil / 觸控筆都能寫（有壓感的筆會有粗細變化）。
   寫過的字會留在畫面上，列印時也會印出來。
   ============================================================ */
(function () {
  "use strict";

  var INK = "#1f3b63";
  var history = [];        // 全域筆畫順序，給「ひとつ もどす」用

  function ratio() { return window.devicePixelRatio || 1; }

  /**
   * 筆尖粗細。畫數多的字（経 11 畫、験 18 畫）用原本的粗細會整片黏在一起，
   * 所以線寬要隨畫數縮。查不到筆順資料時當作 5 畫處理。
   */
  function penWidth(ch, cellSize) {
    var d = window.STROKES && window.STROKES[ch];
    var strokes = d ? d.paths.length : 5;
    return Math.max(1.5, cellSize / (7 + strokes * 0.7));
  }

  function setup(cell) {
    if (cell.__traceCanvas) return cell.__traceCanvas;

    var w = cell.clientWidth;
    var h = cell.clientHeight;
    if (!w || !h) return null;

    var cv = document.createElement("canvas");
    cv.className = "cell__canvas";
    var dpr = ratio();
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.width = w + "px";
    cv.style.height = h + "px";

    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;

    cv.__strokes = [];
    cv.__ctx = ctx;
    cv.__box = { w: w, h: h };
    cv.__cell = cell;
    cv.__write = cell.getAttribute("data-write") || "";
    cv.__pen = penWidth(cv.__write, w);

    cell.appendChild(cv);
    cell.appendChild(clearButton(cv));
    cell.__traceCanvas = cv;

    bind(cv);
    return cv;
  }

  function clearButton(cv) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "cell__clear no-print";
    b.textContent = "×";
    b.setAttribute("aria-label", "けす");
    b.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      cv.__strokes.length = 0;
      history = history.filter(function (c) { return c !== cv; });
      redraw(cv);
    });
    return b;
  }

  function redraw(cv) {
    var ctx = cv.__ctx;
    ctx.clearRect(0, 0, cv.__box.w, cv.__box.h);
    cv.__strokes.forEach(function (stroke) { drawStroke(ctx, stroke); });
  }

  function drawStroke(ctx, pts) {
    if (pts.length < 2) {
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, pts[0].w / 2, 0, Math.PI * 2);
        ctx.fillStyle = INK;
        ctx.fill();
      }
      return;
    }
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1];
      var b = pts[i];
      ctx.beginPath();
      ctx.lineWidth = (a.w + b.w) / 2;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  function bind(cv) {
    var drawing = false;
    var pts = null;

    function point(e) {
      var r = cv.getBoundingClientRect();
      /* 有壓感的筆才用壓力，滑鼠固定粗細 */
      var base = cv.__pen;
      var p = (e.pointerType === "pen" && e.pressure > 0) ? e.pressure : 0.5;
      return {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        w: base * (0.55 + p * 0.9)
      };
    }

    cv.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      drawing = true;
      pts = [point(e)];
      pts.__box = cv.__box.w;
      cv.__strokes.push(pts);
      history.push(cv);
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* 沒抓到就算了 */ }
      redraw(cv);
      e.preventDefault();
    });

    cv.addEventListener("pointermove", function (e) {
      if (!drawing) return;
      /* 觸控筆一個 frame 可能吐好幾個點，全部撿起來線條才會順；
         拿不到（或是合成事件）時就用事件本身 */
      var events = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      if (!events || !events.length) events = [e];
      var ctx = cv.__ctx;
      for (var i = 0; i < events.length; i++) {
        var p = point(events[i]);
        var prev = pts[pts.length - 1];
        pts.push(p);
        ctx.beginPath();
        ctx.lineWidth = (prev.w + p.w) / 2;
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      e.preventDefault();
    });

    function end() {
      if (drawing && pts && cv.__write && window.KanjiOrderCheck) {
        var msg = window.KanjiOrderCheck.check(cv.__write, cv.__strokes);
        if (msg) window.KanjiOrderCheck.hint(cv.__cell, msg);
      }
      drawing = false;
      pts = null;
    }
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
    cv.addEventListener("pointerleave", end);
  }

  /* ---------- 對外 ---------- */

  function enable(root) {
    var cells = (root || document).querySelectorAll(".cell[data-write]");
    Array.prototype.forEach.call(cells, setup);
  }

  function clearAll() {
    Array.prototype.forEach.call(document.querySelectorAll(".cell__canvas"), function (cv) {
      cv.__strokes.length = 0;
      redraw(cv);
    });
    history = [];
  }

  function undo() {
    var cv = history.pop();
    if (!cv) return;
    cv.__strokes.pop();
    redraw(cv);
  }

  function isEmpty() {
    return !history.length;
  }

  document.addEventListener("sheet:rendered", function () {
    if (document.body.dataset.mode === "practice") enable();
  });

  window.KanjiTrace = {
    enable: enable,
    clearAll: clearAll,
    undo: undo,
    isEmpty: isEmpty
  };
})();
