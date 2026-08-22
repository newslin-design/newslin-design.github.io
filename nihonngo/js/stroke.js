/* ============================================================
   stroke.js ─ 筆順動畫
   ------------------------------------------------------------
   點大題 1 的紅色範字（或大題 4 的字），跳出一個視窗一筆一筆畫給你看，
   下面附「一畫一格」的筆順表。資料來自 window.STROKES（data/strokes.js）。
   沒有該字的筆順資料時，範字就只是普通的字，不會有任何互動。
   ============================================================ */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var GRID = 109;          // KanjiVG 的 viewBox 邊長，資料裡也帶著
  var timers = [];
  var raf = null;
  var modal = null;

  function svgEl(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function data(ch) {
    return (window.STROKES && window.STROKES[ch]) || null;
  }

  /* 田字格底線（虛線十字），畫在 SVG 裡才能跟著縮放 */
  function guides(size) {
    var g = svgEl("g", {
      stroke: "var(--box-grid)", "stroke-width": "1", "stroke-dasharray": "4 4"
    });
    g.appendChild(svgEl("line", { x1: size / 2, y1: 2, x2: size / 2, y2: size - 2 }));
    g.appendChild(svgEl("line", { x1: 2, y1: size / 2, x2: size - 2, y2: size / 2 }));
    return g;
  }

  /**
   * 畫一個字。
   * @param {object} d      window.STROKES 裡的資料
   * @param {number} upTo   只畫到第幾筆（-1 = 全部隱藏，等動畫填）
   * @param {boolean} ghost 是否要墊一層淡色的完整字
   */
  function buildSvg(d, opts) {
    opts = opts || {};
    var size = d.size || GRID;
    var svg = svgEl("svg", { viewBox: "0 0 " + size + " " + size });
    svg.appendChild(guides(size));

    var common = {
      fill: "none",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": opts.width || 4.5
    };

    if (opts.ghost) {
      var gh = svgEl("g", Object.assign({ stroke: "#e4e9ef" }, common));
      d.paths.forEach(function (p) { gh.appendChild(svgEl("path", { d: p })); });
      svg.appendChild(gh);
    }

    var live = svgEl("g", Object.assign({ stroke: opts.color || "#2c4f95" }, common));
    var nodes = d.paths.map(function (p, i) {
      var node = svgEl("path", { d: p });
      if (opts.upTo != null && i > opts.upTo) node.setAttribute("opacity", "0");
      if (opts.highlight === i) node.setAttribute("stroke", "var(--model-ink)");
      live.appendChild(node);
      return node;
    });
    svg.appendChild(live);

    return { svg: svg, nodes: nodes, size: size };
  }

  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  /* 依序把每一筆「畫」出來 */
  function play(nodes, speed, onDone) {
    stop();
    nodes.forEach(function (n) {
      n.style.transition = "none";
      n.setAttribute("opacity", "0");
    });

    var i = 0;
    function next() {
      if (i >= nodes.length) { if (onDone) onDone(); return; }
      var node = nodes[i];
      var len = node.getTotalLength();
      node.style.strokeDasharray = len;
      node.style.strokeDashoffset = len;
      node.setAttribute("opacity", "1");

      var dur = Math.max(260, len * 4.2) / speed;
      var t0 = performance.now();
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur);
        node.style.strokeDashoffset = len * (1 - k);
        if (k < 1) { raf = requestAnimationFrame(step); }
        else { i++; timers.push(setTimeout(next, 200 / speed)); }
      })(t0);
    }
    next();
  }

  /* ---------- 視窗 ---------- */

  function close() {
    stop();
    if (modal) { modal.remove(); modal = null; }
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) { if (e.key === "Escape") close(); }

  function open(ch) {
    var d = data(ch);
    if (!d) return;
    close();

    modal = el("div", "kv-modal no-print");
    var panel = el("div", "kv-panel");

    var head = el("div", "kv-head");
    head.appendChild(el("span", "kv-char", ch));
    head.appendChild(el("span", "kv-count", d.paths.length + "かく"));
    var x = el("button", "kv-close", "×");
    x.type = "button";
    x.setAttribute("aria-label", "とじる");
    x.addEventListener("click", close);
    head.appendChild(x);
    panel.appendChild(head);

    /* 主畫面：大字動畫 */
    var stageBox = el("div", "kv-stage");
    var main = buildSvg(d, { ghost: true, color: "#2c4f95", width: 4.5 });
    stageBox.appendChild(main.svg);

    var numLayer = svgEl("g", { class: "kv-nums", "font-size": "9", fill: "var(--accent)" });
    (d.nums || []).forEach(function (n, i) {
      var t = svgEl("text", { x: n[0], y: n[1] });
      t.textContent = String(i + 1);
      numLayer.appendChild(t);
    });
    main.svg.appendChild(numLayer);
    panel.appendChild(stageBox);

    /* 控制列 */
    var speed = 1;
    var ctrl = el("div", "kv-ctrl");

    var replay = el("button", "kv-btn", "▶ もういちど");
    replay.type = "button";
    replay.addEventListener("click", function () { play(main.nodes, speed); });
    ctrl.appendChild(replay);

    var slowWrap = el("label", "kv-toggle");
    var slow = document.createElement("input");
    slow.type = "checkbox";
    slow.addEventListener("change", function () {
      speed = slow.checked ? 0.45 : 1;
      play(main.nodes, speed);
    });
    slowWrap.appendChild(slow);
    slowWrap.appendChild(document.createTextNode("ゆっくり"));
    ctrl.appendChild(slowWrap);

    var numWrap = el("label", "kv-toggle");
    var numChk = document.createElement("input");
    numChk.type = "checkbox";
    numChk.checked = true;
    numChk.addEventListener("change", function () {
      numLayer.style.display = numChk.checked ? "" : "none";
    });
    numWrap.appendChild(numChk);
    numWrap.appendChild(document.createTextNode("ばんごう"));
    ctrl.appendChild(numWrap);

    panel.appendChild(ctrl);

    /* 筆順表：一畫一格，最後一筆用紅色標出來 */
    var strip = el("div", "kv-strip");
    d.paths.forEach(function (_, i) {
      var item = el("div", "kv-step");
      var mini = buildSvg(d, { upTo: i, highlight: i, color: "#8a94a3", width: 6 });
      item.appendChild(mini.svg);
      item.appendChild(el("span", "kv-step__no", String(i + 1)));
      strip.appendChild(item);
    });
    panel.appendChild(strip);

    panel.appendChild(el("div", "kv-credit",
      "筆順データ：KanjiVG (CC BY-SA 3.0)"));

    modal.appendChild(panel);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.body.appendChild(modal);
    document.addEventListener("keydown", onKey);

    play(main.nodes, speed);
  }

  /* ---------- 把範字接上 ---------- */

  function attach(root) {
    var targets = (root || document).querySelectorAll("[data-kanji]");
    Array.prototype.forEach.call(targets, function (node) {
      var ch = node.getAttribute("data-kanji");
      if (!data(ch)) return;
      node.classList.add("has-stroke");
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("title", ch + " の ひつじゅん");
      node.addEventListener("click", function () { open(ch); });
      node.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(ch); }
      });
    });
  }

  document.addEventListener("sheet:rendered", function (e) { attach(e.target); });

  window.KanjiStroke = { open: open, attach: attach, has: function (ch) { return !!data(ch); } };
})();
