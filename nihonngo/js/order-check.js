/* ============================================================
   order-check.js ─ 筆順チェック
   ------------------------------------------------------------
   在田字格上寫完一筆之後，跟 KanjiVG 的正解比對，只在「明顯寫錯
   順序」時才出聲：這一筆和後面某一畫吻合、卻和現在該寫的那一畫
   對不上，才提示「ひつじゅん ちがうよ」。

   刻意做成高門檻、寧可漏抓也不亂抓——小一學生的字本來就歪，
   一直跳警告只會讓人不想寫。
   ============================================================ */
(function () {
  "use strict";

  /* 判定門檻 */
  var DIR_OK = 0.55;    // 方向 cos 相似度要多像才算「對得上」
  var START_OK = 0.28;  // 起筆位置容許誤差（格子邊長的比例）
  var MIN_LEN = 0.12;   // 太短的筆畫（點一下）不判

  var cache = {};

  /** 把 KanjiVG 的每一筆化簡成「起點→終點」，座標正規化成 0~1 */
  function outline(ch) {
    if (cache[ch]) return cache[ch];
    var d = window.STROKES && window.STROKES[ch];
    if (!d) return (cache[ch] = null);

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + d.size + " " + d.size);
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    document.body.appendChild(svg);

    var strokes = d.paths.map(function (spec) {
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", spec);
      svg.appendChild(p);
      var len = p.getTotalLength();
      var a = p.getPointAtLength(0);
      var b = p.getPointAtLength(len);
      return {
        from: { x: a.x / d.size, y: a.y / d.size },
        to: { x: b.x / d.size, y: b.y / d.size }
      };
    });

    svg.remove();
    return (cache[ch] = strokes);
  }

  function dir(from, to) {
    var dx = to.x - from.x;
    var dy = to.y - from.y;
    var m = Math.hypot(dx, dy);
    return m < 1e-6 ? null : { x: dx / m, y: dy / m, len: m };
  }

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  /** 這一筆和第 i 畫像不像？回傳 0~1 的分數，0 = 完全不像 */
  function similarity(drawn, expected) {
    var d1 = dir(drawn.from, drawn.to);
    var d2 = dir(expected.from, expected.to);
    if (!d1 || !d2) return 0;

    var cos = d1.x * d2.x + d1.y * d2.y;
    if (cos < DIR_OK) return 0;

    var gap = dist(drawn.from, expected.from);
    if (gap > START_OK) return 0;

    return cos * (1 - gap / START_OK);
  }

  /** 落在同一條線上、但方向整個相反（起筆跑到正解的收筆處） */
  function reversed(drawn, expected) {
    var d1 = dir(drawn.from, drawn.to);
    var d2 = dir(expected.from, expected.to);
    if (!d1 || !d2) return false;
    if (d1.x * d2.x + d1.y * d2.y > -DIR_OK) return false;
    return dist(drawn.from, expected.to) < START_OK;
  }

  /**
   * 檢查剛寫完的那一筆。
   * @returns {string|null} 要提示的訊息，沒問題就 null
   */
  function check(ch, strokes) {
    var expected = outline(ch);
    if (!expected) return null;

    var index = strokes.length - 1;
    var pts = strokes[index];
    if (!pts || pts.length < 2) return null;

    /* 換算成 0~1（pts 的座標是 canvas 像素，用第一點所在格子的尺寸換算） */
    var box = pts.__box;
    if (!box) return null;
    var drawn = {
      from: { x: pts[0].x / box, y: pts[0].y / box },
      to: { x: pts[pts.length - 1].x / box, y: pts[pts.length - 1].y / box }
    };

    var d = dir(drawn.from, drawn.to);
    if (!d || d.len < MIN_LEN) return null;          // 點一下，不判

    if (index >= expected.length) {
      return "かくすうが おおいよ（" + expected.length + "かく）";
    }

    var here = similarity(drawn, expected[index]);
    if (here > 0) return null;                        // 對得上，安靜

    /* 位置對、但整條反著寫（例：橫畫由右往左） */
    if (reversed(drawn, expected[index])) {
      return "むきが ぎゃくだよ　ひだり から みぎへ";
    }

    /* 對不上現在這一畫，那它像不像後面某一畫？像的話就是順序寫反了 */
    var best = -1;
    var bestScore = 0;
    for (var i = 0; i < expected.length; i++) {
      if (i === index) continue;
      var s = similarity(drawn, expected[i]);
      if (s > bestScore) { bestScore = s; best = i; }
    }

    if (best >= 0 && bestScore > 0.35) {
      return "ひつじゅん ちがうよ　いまは " + (index + 1) + "かくめ";
    }
    return null;                                      // 只是寫歪了，不吵
  }

  /* ---------- 提示氣泡 ---------- */

  var current = null;
  var hideTimer = null;

  function hint(cell, text) {
    if (current) current.remove();
    clearTimeout(hideTimer);

    var bubble = document.createElement("div");
    bubble.className = "order-hint no-print";
    bubble.textContent = text;
    cell.appendChild(bubble);
    current = bubble;

    hideTimer = setTimeout(function () {
      if (bubble === current) { bubble.remove(); current = null; }
    }, 2600);
  }

  window.KanjiOrderCheck = { check: check, hint: hint };
})();
