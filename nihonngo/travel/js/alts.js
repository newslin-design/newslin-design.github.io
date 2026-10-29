/* ============================================================
   alts.js ─ 偷偷換店內圖（其他候選圖在 data/scenes/konbini-alts.js）
   ------------------------------------------------------------
   畫面上沒有按鈕：
     ・逛店或結帳時，連點左上角的籃子三下 → 換下一張，右上短暫顯示「店內圖 2/4」
     ・網址加 ?inside=2 → 直接用第 2 張（第 1 張是 konbini.js 的正式圖）
     ・?edit 的工具列多一個「店內圖」按鈕
   選的圖記在這個瀏覽器，下次打開還是同一張；要回正式圖就換回 1/4。
   ============================================================ */
(function () {
  "use strict";

  var G = window.TravelGame;
  var scene = G.scene;
  var alts = scene.alts;
  if (!alts || !alts.list.length) return;

  var KEY = "travel.inside";
  var base = scene.hotspots;   // 正式圖的熱點：商品、動作照用，其他張只換座標

  var options = [{
    name_zh: alts.main_zh,
    image: scene.images.inside,
    labels: scene.labels.inside,
    hotspots: base,
    focus: scene.focus
  }].concat(alts.list.map(function (o) {
    return {
      name_zh: o.name_zh,
      image: o.image,
      labels: o.labels,
      focus: o.focus,
      hotspots: base.map(function (h) {
        var r = o.spots[h.id];
        if (!r) return h;
        return { id: h.id, x: r[0], y: r[1], w: r[2], h: r[3], item: h.item, word: h.word, action: h.action };
      })
    };
  }));

  var current = 0;

  /* 換完短暫顯示是哪一張 */
  var toast = document.createElement("div");
  toast.className = "alt-toast";
  toast.hidden = true;
  document.querySelector(".app").appendChild(toast);
  var toastTimer = null;

  function use(i, show) {
    current = (i + options.length) % options.length;
    var o = options[current];
    scene.images.inside = o.image;
    scene.labels.inside = o.labels;
    scene.hotspots = o.hotspots;
    scene.focus = o.focus;
    try {
      localStorage.setItem(KEY, String(current));
    } catch (e) { /* 存不了也沒關係，只是下次會回到正式圖 */ }
    if (!show) return;

    /* 正在店裡（或在 ?edit）就馬上換；拉近中（結帳）就拉近到新圖的櫃檯 */
    if (document.body.classList.contains("is-shopping") || document.body.classList.contains("is-edit")) {
      var zoomed = !!G.canvas.style.transform;
      G.showImage("inside");
      if (zoomed) G.zoom(scene.focus);
    }
    toast.textContent = "店內圖 " + (current + 1) + "/" + options.length + "：" + o.name_zh;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 1600);
  }

  /* 開頭用哪一張：網址的 ?inside=N 優先，其次是上次選的 */
  var m = /[?&]inside=(\d+)/.exec(location.search);
  var saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch (e) { /* 讀不到就用正式圖 */ }
  if (m) use(Number(m[1]) - 1, false);
  else if (saved) use(Number(saved) || 0, false);

  /* 連點籃子三下 */
  var taps = 0;
  var tapTimer = null;
  document.getElementById("basket").addEventListener("click", function () {
    taps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(function () { taps = 0; }, 600);
    if (taps >= 3) {
      taps = 0;
      use(current + 1, true);
    }
  });

  /* 給 edit.js 用 */
  window.TravelAlts = { next: function () { use(current + 1, true); } };
})();
