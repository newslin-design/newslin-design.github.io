/* ============================================================
   edit.js ─ 對座標用的小工具（網址加 ?edit 才會載入）
   ------------------------------------------------------------
   在圖上拖一個框 → 顯示 x, y, w, h（圖的百分比），
   可以直接貼進 data/scenes/ 的 hotspots、labels、thumb。
   紅框是目前的熱點，藍框是疊上去的字。換了 Midjourney 的圖之後用它重新對位置。
   對話框浮在圖上，會擋到下面，所以先藏起來；要玩的時候按「顯示對話框」。
   ============================================================ */
(function () {
  "use strict";

  var G = window.TravelGame;
  document.body.classList.add("is-edit", "edit-hide-panel");

  var layer = document.createElement("div");
  layer.className = "edit-layer";
  var box = document.createElement("div");
  box.className = "edit-rect";
  box.hidden = true;
  G.canvas.appendChild(layer);
  G.canvas.appendChild(box);

  /* ---------- 上方的工具列 ---------- */

  var bar = document.createElement("div");
  bar.className = "edit-bar";
  var out = document.createElement("code");
  out.textContent = "在圖上拖一個框";

  function barButton(label, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", onClick);
    bar.appendChild(b);
    return b;
  }

  ["outside", "inside", "hotel"].forEach(function (key) {
    barButton(key, function () {
      G.showImage(key);
      box.hidden = true;
    });
  });

  if (window.TravelAlts) barButton("店內圖", window.TravelAlts.next);   // 換其他候選圖（js/alts.js）

  var panelBtn = barButton("顯示對話框", function () {
    var hidden = document.body.classList.toggle("edit-hide-panel");
    panelBtn.textContent = hidden ? "顯示對話框" : "隱藏對話框";
  });

  var toggle = barButton("暫停拖框", function () {
    layer.hidden = !layer.hidden;
    toggle.textContent = layer.hidden ? "繼續拖框" : "暫停拖框";
  });

  var copy = barButton("複製", function () {
    var done = function (msg) {
      copy.textContent = msg;
      setTimeout(function () { copy.textContent = "複製"; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(out.textContent).then(
        function () { done("已複製"); },
        function () { done("請手動選取"); }
      );
    } else {
      done("請手動選取");
    }
  });

  bar.appendChild(out);
  G.stage.appendChild(bar);

  /* ---------- 拖框 ---------- */

  var start = null;

  /** 滑鼠位置 → 圖的百分比（拉近的時候也對，因為是量變形後的框） */
  function pct(e) {
    var r = G.canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)),
      y: Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100))
    };
  }

  function half(v) {
    return Math.round(v * 2) / 2;
  }

  function rect(a, b) {
    return {
      x: half(Math.min(a.x, b.x)),
      y: half(Math.min(a.y, b.y)),
      w: half(Math.abs(a.x - b.x)),
      h: half(Math.abs(a.y - b.y))
    };
  }

  function draw(r) {
    box.hidden = false;
    box.style.left = r.x + "%";
    box.style.top = r.y + "%";
    box.style.width = r.w + "%";
    box.style.height = r.h + "%";
    out.textContent = "x: " + r.x + ", y: " + r.y + ", w: " + r.w + ", h: " + r.h;
  }

  layer.addEventListener("pointerdown", function (e) {
    start = pct(e);
    layer.setPointerCapture(e.pointerId);
  });
  layer.addEventListener("pointermove", function (e) {
    if (start) draw(rect(start, pct(e)));
  });
  layer.addEventListener("pointerup", function (e) {
    if (!start) return;
    var r = rect(start, pct(e));
    start = null;
    if (r.w < 0.5 && r.h < 0.5) {
      box.hidden = true;
      out.textContent = "x: " + r.x + ", y: " + r.y + "（點）";
    } else {
      draw(r);
    }
  });
})();
