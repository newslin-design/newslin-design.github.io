/* ============================================================
   picture.js ─ 一圖多詞模板（一張圖上標出很多單字，例如身體部位）
   ------------------------------------------------------------
   總覽圖：圖在中間，名稱排在左右兩欄，用引線連到部位；全部部位都畫，基本、進階用點的顏色分。
   卡片和小遊戲才選難度：「基本」只出基本的，「進階」全部一起。
   點部位看讀法、意思、常用句、慣用句。跟中文意思不一樣的漢字（trap）標紅。
   卡片的出題、熟悉度、一回 10 題在 js/deck.js；這裡只負責每一題長什麼樣子。
   題目以「圖 ↔ 日文」為主，不太需要翻譯，四種母語都一樣好用。
   內容（部位、座標、句子、圖）都在 data/themes/<id>.js；換成 Midjourney 的圖只要改資料。
   ============================================================ */
(function () {
  "use strict";

  var TYPES = ["point", "hear", "see"];
  var LV = ["", "lvBasic", "lvAdv"];
  var FIG = 0.56;   // 總覽圖裡，圖佔舞台寬度的比例；左右各 22% 放名稱
  var SPK = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';

  var view = { tab: "map", level: 1, scene: null, sel: null, hide: false, alt: {} };   // 換語言重畫時保留
  var el, D, ctx, store, prog, deck, ITEMS, SCENES;
  var G = { id: null, timers: [] };
  var onResize = null;

  function $(s) { return el.querySelector(s); }
  function t(k, v) { return ctx.t(k, v); }
  function L(o) { return ctx.loc(o); }
  function kana(s) { return '<span class="kana">' + s + "</span>"; }
  function save() { store.set(prog); }
  function byId(id) { return ITEMS.filter(function (it) { return it.id === id; })[0]; }
  function pool() { return ITEMS.filter(function (it) { return it.level <= view.level; }); }
  function baseScene(id) { return SCENES.filter(function (s) { return s.id === id; })[0]; }
  /** 場景：還在比圖的時候（scene.alts），用選到的那張蓋過去 */
  function sceneOf(id) {
    var sc = baseScene(id), k = view.alt[id] || 0;
    return k && sc.alts ? Object.assign({}, sc, sc.alts[k - 1]) : sc;
  }
  /** 部位在圖上的位置：場景有 pos（照實際的圖量的）就用它，沒有就用部位自己的 x、y */
  function at(it) {
    var p = sceneOf(it.scene).pos;
    p = p && p[it.id];
    return p ? { x: p[0], y: p[1], side: p[2] } : it;
  }
  function inScene(list, sid) { return list.filter(function (it) { return it.scene === sid; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function rand(list) { return list[Math.floor(Math.random() * list.length)]; }
  /** 名稱：有漢字就「漢字＋小字假名」，只有假名就只寫一次 */
  function nameHtml(it) { return it.ja === it.kana ? '<b class="kana">' + it.ja + "</b>" : "<b>" + it.ja + "</b>" + kana(it.kana); }
  function figHtml(sc) { return sc.img ? '<img src="' + sc.img + '" alt="">' : sc.svg; }
  function bumpMistake(it) { deck.bump(it); }

  /** 干擾選項：先挑同一張圖上的部位，不夠再從別的圖補 */
  function others(it, n, list) {
    var same = shuffle(list.filter(function (x) { return x !== it && x.scene === it.scene && x.kana !== it.kana; }));
    var rest = shuffle(list.filter(function (x) { return x !== it && x.scene !== it.scene && x.kana !== it.kana; }));
    return same.concat(rest).slice(0, n);
  }

  /* ---------- 版面 ---------- */
  function layout() {
    var lv = [1, 2].map(function (n) {
      return '<button data-lv="' + n + '" aria-pressed="' + (view.level === n) + '">' + t(LV[n]) + "</button>";
    }).join("");
    return '' +
      '<nav class="tabs" role="tablist">' +
        '<button role="tab" data-tab="map">' + t("tabMap") + '</button>' +
        '<button role="tab" data-tab="cards">' + t("tabCards") + '</button>' +
        '<button role="tab" data-tab="games">' + t("tabGames") + '</button>' +
      '</nav>' +
      '<div class="pbar-top" id="pBar"><span class="plv-lab">' + t("levelLabel") + '</span><div class="seg" id="lvSeg">' + lv + '</div><span class="pcount" id="pCount"></span></div>' +
      '<section data-v="map">' +
        '<div class="pscenes" id="pScenes"></div>' +
        '<div class="pstage" id="pStage"></div>' +
        '<div class="maptools">' +
          '<label class="switch"><input type="checkbox" id="hideNames"' + (view.hide ? " checked" : "") + '><span>' + t("hideNames") + '</span></label>' +
          '<span class="legends">' +
            '<span class="legend"><i class="lv1"></i>' + t("lvBasic") + '</span>' +
            '<span class="legend"><i class="lv2"></i>' + t("lvAdv") + '</span>' +
            '<span class="legend"><i class="trap"></i>' + t("trapTag") + '</span>' +
          '</span>' +
        '</div>' +
        (SCENES.some(function (s) { return !s.img; }) ? '<p class="artnote">' + t("artNote") + "</p>" : "") +
        '<div class="pdetail" id="pDetail" aria-live="polite"></div>' +
        '<div class="rules"><h2>' + L(D.text.rulesTitle) + '</h2><ol>' +
          D.text.rules.map(function (r) { return "<li>" + ctx.rich(L(r)) + "</li>"; }).join("") +
        '</ol><p class="tip">' + ctx.rich(L(D.text.tip)) + '</p></div>' +
      '</section>' +
      '<section data-v="cards" hidden><div id="deckRoot"></div></section>' +
      '<section data-v="games" hidden>' +
        '<div id="gMenu" class="gmenu">' +
          '<button class="gtile" data-game="tap"><span class="ico">指</span><span><b>' + t("b1name") + '</b><small>' + t("b1desc") + '</small></span><span class="best" id="bTap"></span></button>' +
          '<button class="gtile" data-game="name"><span class="ico">名</span><span><b>' + t("b2name") + '</b><small>' + t("b2desc") + '</small></span><span class="best" id="bName"></span></button>' +
          '<button class="gtile" data-game="idiom"><span class="ico">慣</span><span><b>' + t("b3name") + '</b><small>' + t("b3desc") + '</small></span><span class="best" id="bIdiom"></span></button>' +
          '<p class="gnote">' + t("gnoteWord") + '</p>' +
        '</div>' +
        '<div id="gPlay" hidden>' +
          '<div class="hud"><span id="hudA"></span><span id="hudB"></span><button class="quit" id="gQuit">' + t("quit") + '</button></div>' +
          '<div class="tbar" id="tbar" hidden><i id="tfill"></i></div>' +
          '<div class="prompt" id="gPrompt"></div>' +
          '<div id="gStage"></div>' +
          '<div class="opts" id="gOpts"></div>' +
          '<div class="gmsg" id="gMsg"></div>' +
        '</div>' +
        '<div id="gResult" hidden></div>' +
      '</section>';
  }

  /* ---------- 總覽圖 ---------- */
  function renderScenes() {
    $("#pScenes").innerHTML = SCENES.map(function (sc) {
      var n = inScene(ITEMS, sc.id).length;
      return '<button class="chip" data-sc="' + sc.id + '" aria-pressed="' + (view.scene === sc.id) + '">' + L(sc.name) + " <small>" + n + "</small></button>";
    }).join("") + altSeg();
    $("#pCount").textContent = t("partsCount", { n: pool().length });
    el.querySelectorAll("#lvSeg [data-lv]").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.lv === view.level)); });
  }

  /** 比圖用的切換（A、B…）：只有這個場景有 alts 時才出現，選定圖之後就不會再顯示 */
  function altSeg() {
    var alts = baseScene(view.scene).alts;
    if (!alts) return "";
    var k = view.alt[view.scene] || 0;
    return '<span class="seg pfigseg">' + [0].concat(alts.map(function (a, i) { return i + 1; })).map(function (n) {
      return '<button data-alt="' + n + '" aria-pressed="' + (k === n) + '">' + "ABCDE"[n] + "</button>";
    }).join("") + "</span>";
  }

  function renderStage() {
    var sc = sceneOf(view.scene), items = inScene(ITEMS, sc.id);
    var st = $("#pStage");
    st.style.aspectRatio = String(sc.aspect / FIG);
    st.style.setProperty("--figbg", sc.bg || "");   // 舞台底色跟圖的紙色一樣，圖的邊才看不出來
    st.classList.toggle("hide", view.hide);
    st.innerHTML =
      '<div class="pfig">' + figHtml(sc) + "</div>" +
      '<svg class="plines" aria-hidden="true"></svg>' +
      items.map(function (it) {
        var cls = "pdot lv" + it.level + (view.sel === it.id ? " sel" : ""), p = at(it);
        return '<button class="' + cls + '" data-id="' + it.id + '" style="left:' + (22 + p.x * FIG) + "%;top:" + p.y + '%" aria-label="' + it.ja + '"></button>';
      }).join("") +
      items.map(function (it) {
        var cls = "plabel " + (at(it).side === "L" ? "l" : "r") + (it.trap ? " trap" : "") + (view.sel === it.id ? " sel" : "");
        return '<button class="' + cls + '" data-id="' + it.id + '"><span class="pl-name">' + nameHtml(it) + '</span><span class="pl-q" aria-hidden="true">？</span></button>';
      }).join("");
    placeLabels();
  }

  /** 名稱排在左右兩欄，太擠就往下推、到底再往上收，引線連回部位 */
  function placeLabels() {
    var st = $("#pStage");
    if (!st || !st.clientWidth) return;
    var W = st.clientWidth, H = st.clientHeight, GAP = 24, PAD = 10, lines = "";
    ["L", "R"].forEach(function (side) {
      var list = [];
      st.querySelectorAll(".plabel." + (side === "L" ? "l" : "r")).forEach(function (lab) {
        var it = byId(lab.dataset.id), p = at(it);
        list.push({ lab: lab, it: it, dy: p.y / 100 * H, dx: (0.22 + p.x / 100 * FIG) * W });
      });
      list.sort(function (a, b) { return a.dy - b.dy; });
      var y = -Infinity;
      list.forEach(function (o) { o.ly = Math.max(o.dy, y + GAP, PAD); y = o.ly; });
      var lim = H - PAD;
      for (var i = list.length - 1; i >= 0; i--) { if (list[i].ly > lim) list[i].ly = lim; lim = list[i].ly - GAP; }
      list.forEach(function (o) {
        o.lab.style.top = o.ly + "px";
        var x0 = side === "L" ? W * 0.22 - 2 : W * 0.78 + 2;
        lines += '<line x1="' + x0 + '" y1="' + o.ly + '" x2="' + o.dx + '" y2="' + o.dy + '"' + (o.it.trap ? ' class="trap"' : "") + "/>";
      });
    });
    var svg = st.querySelector(".plines");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML = lines;
  }

  function renderDetail() {
    var it = view.sel && byId(view.sel);
    if (!it) { $("#pDetail").innerHTML = '<p class="wd-hint">' + t("tapPart") + "</p>"; return; }
    var rows = function (list, head, cls) {
      if (!list.length) return "";
      return '<div class="pph ' + cls + '"><span class="wd-lab">' + head + "</span>" + list.map(function (p, i) {
        return '<button class="pph-row" data-say="' + p.kana + '"><span class="pph-ja">' + p.ja + '</span><span class="kana pph-kana">' + p.kana + '</span><span class="pph-tr">' + L(p.tr) + '</span><span class="pph-play" aria-hidden="true">' + SPK + "</span></button>";
      }).join("") + "</div>";
    };
    $("#pDetail").innerHTML =
      '<div class="wd-top"><span class="pd-name' + (it.trap ? " trap" : "") + '">' + nameHtml(it) + '</span><button class="say" id="pSay" aria-label="' + t("replay") + '">' + SPK + "</button></div>" +
      '<div class="wd-tags"><span class="badge">' + t(LV[it.level]) + "</span>" + (it.trap ? '<span class="naitag">' + t("trapTag") + "</span>" : "") + "</div>" +
      '<div class="wd-mean">' + L(it.mean) + "</div>" +
      (it.trap && it.note ? '<p class="ptrap">' + ctx.rich(L(it.note)) + "</p>" : "") +
      rows(it.phrases, t("phrasesH"), "phr") +
      rows(it.idioms, t("idiomsH"), "idm");
    $("#pSay").onclick = function () { ctx.say(it.kana); };
    $("#pDetail").querySelectorAll("[data-say]").forEach(function (b) { b.onclick = function () { ctx.say(b.dataset.say); }; });
  }

  function select(id, quiet) {
    view.sel = id;
    var it = byId(id);
    if (it.scene !== view.scene) { view.scene = it.scene; renderScenes(); renderStage(); }
    $("#pStage").querySelectorAll(".pdot,.plabel").forEach(function (b) {
      b.classList.toggle("sel", b.dataset.id === id);
      if (b.dataset.id === id && b.classList.contains("plabel")) b.classList.add("peek");
    });
    renderDetail();
    if (!quiet) ctx.say(it.kana);
  }

  /** 難度只影響卡片和小遊戲；總覽圖一直是全部 */
  function setLevel(n) {
    view.level = n;
    renderScenes();
    if (view.tab === "cards") deck.resume();
    if (view.tab === "games") { gStop(); renderMenu(); }
  }

  /* ---------- 小舞台：卡片和遊戲用（只有圖和點，沒有名稱） ---------- */
  function miniStage(sc, items, opts) {
    opts = opts || {};
    return '<div class="pmini" style="aspect-ratio:' + sc.aspect + ";--ar:" + sc.aspect + (sc.bg ? ";--figbg:" + sc.bg : "") + '"><div class="pfig">' + figHtml(sc) + "</div>" +
      items.map(function (it) {
        var cls = "pdot" + (opts.target === it ? " target" : "") + (opts.tap ? " tap" : ""), p = at(it);
        return '<button class="' + cls + '" data-id="' + it.id + '" style="left:' + p.x + "%;top:" + p.y + '%" aria-label="' + (opts.tap ? t("tapHere") : "") + '"' + (opts.tap ? "" : " tabindex=\"-1\"") + "></button>";
      }).join("") + "</div>";
  }

  /* ---------- 卡片：每一題長什麼樣子（出題和記分在 deck.js） ---------- */
  function renderCard(box, it, done) {
    var ty = TYPES[Math.floor(Math.random() * TYPES.length)];
    var sc = sceneOf(it.scene), q = function (s) { return box.querySelector(s); };
    var info = '<span class="pd-name">' + nameHtml(it) + "</span><span>" + L(it.mean) + "</span>";
    if (ty === "point") {
      var opts = shuffle([it].concat(others(it, 3, pool())));
      box.innerHTML = '<div class="ctag">' + t("whereQ") + "</div>" + miniStage(sc, [it], { target: it }) +
        '<div class="opts copts">' + opts.map(function (o) { return '<button class="opt kana" data-id="' + o.id + '">' + o.kana + "</button>"; }).join("") + "</div>" +
        '<div class="cnext"></div>';
      var answered = false;
      q(".copts").onclick = function (e) {
        var b = e.target.closest(".opt");
        if (!b || answered) return;
        answered = true;
        var right = b.dataset.id === it.id;
        q(".copts").querySelectorAll(".opt").forEach(function (x) { if (x.dataset.id === it.id) x.classList.add("ok"); });
        ctx.say(it.kana);
        q(".cnext").innerHTML = info;
        if (right) { ctx.sfx.ok(); done(true, 1200); }
        else { b.classList.add("no"); ctx.sfx.bad(); done(false); }
      };
      return;
    }
    if (ty === "hear") {
      var voice = ctx.canHear(it.kana);
      box.innerHTML = '<div class="ctag">' + t(voice ? "tapHearQ" : "tapReadQ") + "</div>" +
        (voice ? '<button class="say csay" aria-label="' + t("replay") + '">' + SPK + "</button>" : '<div class="cbig kana">' + it.kana + "</div>") +
        miniStage(sc, inScene(pool(), sc.id), { tap: true }) + '<div class="cnext"></div>';
      if (q(".csay")) { q(".csay").onclick = function () { ctx.say(it.kana); }; ctx.say(it.kana); }
      var tapped = false;
      q(".pmini").onclick = function (e) {
        var d = e.target.closest(".pdot");
        if (!d || tapped) return;
        tapped = true;
        var right = d.dataset.id === it.id;
        q('.pdot[data-id="' + it.id + '"]').classList.add("ok");
        q(".cnext").innerHTML = info;
        if (right) { ctx.sfx.ok(); done(true, 1200); }
        else { d.classList.add("no"); ctx.sfx.bad(); ctx.say(it.kana); done(false); }
      };
      return;
    }
    /* see：看名稱，想想在哪裡、什麼意思，翻牌自己判斷 */
    box.innerHTML = '<div class="ctag">' + t("seePartQ") + '</div><div class="cbig pd-name' + (it.trap ? " trap" : "") + '">' + nameHtml(it) + "</div>" +
      '<div class="cans" hidden>' + miniStage(sc, [it], { target: it }) + '<span class="wd-mean">' + L(it.mean) + "</span>" +
        (it.trap && it.note ? '<small class="ptrap">' + ctx.rich(L(it.note)) + "</small>" : "") + "</div>" +
      '<div class="btnrow cbtns"><button class="btn primary cflip">' + t("flip") + "</button></div>";
    q(".cflip").onclick = function () {
      q(".cans").hidden = false;
      ctx.say(it.kana);
      q(".cbtns").innerHTML = '<button class="btn bad" data-g="0">' + t("gotWrongMean") + '</button><button class="btn good" data-g="1">' + t("gotRightMean") + "</button>";
      q(".cbtns").onclick = function (e) {
        var b = e.target.closest("[data-g]");
        if (!b) return;
        var g = b.dataset.g === "1";
        if (g) ctx.sfx.ok(); else ctx.sfx.bad();
        done(g, 250);
      };
    };
  }

  /* ---------- 小遊戲 ---------- */
  function later(fn, ms) { G.timers.push(setTimeout(fn, ms)); }
  function every(fn, ms) { G.timers.push(setInterval(fn, ms)); }
  function gStop() {
    G.timers.forEach(function (x) { clearTimeout(x); clearInterval(x); });
    G.timers = [];
    G.id = null;
    // 容器是各模板共用的；從別的模板換過來時，裡面不一定有這兩個元素
    if (el) ["#gOpts", "#gStage"].forEach(function (s) { var x = $(s); if (x) x.onclick = null; });
  }
  function pane(p) { $("#gMenu").hidden = p !== "menu"; $("#gPlay").hidden = p !== "play"; $("#gResult").hidden = p !== "result"; }
  function msg(h) { $("#gMsg").innerHTML = h; }
  function plain(s) { return s.replace(/<\/?b>/g, ""); }

  function renderMenu() {
    var b = prog.best;
    $("#bTap").textContent = b.tap ? t("bestScore", { s: b.tap }) : t("never");
    $("#bName").textContent = b.name ? t("bestScore", { s: b.name }) : t("never");
    $("#bIdiom").textContent = b.idiom ? t("bestScore", { s: b.idiom }) : t("never");
    pane("menu");
  }

  function setupPlay(withTimer) {
    pane("play");
    $("#tbar").hidden = !withTimer;
    $("#tfill").style.width = "100%";
    $("#gOpts").innerHTML = "";
    $("#gStage").innerHTML = "";
    msg("");
  }

  // 1. 點點看：聽名稱，在圖上點出來；60 秒，連續答對加分
  function startTap() {
    gStop(); G.id = "tap"; setupPlay(false);
    var st = { score: 0, combo: 0, maxc: 0, right: 0, q: null, miss: {}, end: performance.now() + 60000, lock: true };
    function hud() {
      var left = Math.max(0, Math.ceil((st.end - performance.now()) / 1000));
      $("#hudA").innerHTML = t("left", { b: left });
      $("#hudB").innerHTML = t("score", { b: st.score }) + (st.combo > 1 ? "・" + t("combo", { c: st.combo }) : "");
      if (left <= 0) endTap(st);
    }
    function next() {
      var p = pool();
      st.q = rand(p.filter(function (x) { return x !== st.q; }));
      var sc = sceneOf(st.q.scene), voice = ctx.canHear(st.q.kana);
      $("#gPrompt").innerHTML = (voice ? '<button class="say big" id="gSay" aria-label="' + t("replay") + '">' + SPK + "</button>" : "") +
        '<div class="ptxt">' + (voice ? t("tapHearQ") : '<span class="pkana">' + st.q.kana + "</span><small>" + t("noVoiceShow") + "</small>") + "</div>";
      if (voice) { $("#gSay").onclick = function () { ctx.say(st.q.kana); }; ctx.say(st.q.kana); }
      $("#gStage").innerHTML = miniStage(sc, inScene(p, sc.id), { tap: true });
      msg("");
      st.lock = false;
    }
    $("#gStage").onclick = function (e) {
      var d = e.target.closest(".pdot");
      if (!d || st.lock || G.id !== "tap") return;
      st.lock = true;
      if (d.dataset.id === st.q.id) {
        st.combo++; st.maxc = Math.max(st.maxc, st.combo); st.right++;
        st.score += 10 + Math.min(st.combo - 1, 10) * 2;
        ctx.sfx.ok(); d.classList.add("ok");
        later(next, 450);
      } else {
        st.combo = 0;
        ctx.sfx.bad(); d.classList.add("no");
        $("#gStage").querySelector('.pdot[data-id="' + st.q.id + '"]').classList.add("ok");
        st.miss[st.q.id] = 1; bumpMistake(st.q);
        msg("<span>" + t("itWasPart", { w: st.q.ja + "（" + st.q.kana + "）" }) + "</span>");
        ctx.say(st.q.kana);
        later(next, 1400);
      }
      hud();
    };
    hud(); every(hud, 200); next();
  }
  function endTap(st) {
    if (G.id !== "tap") return;
    var prev = prog.best.tap, rec = st.score > prev;
    if (rec) { prog.best.tap = st.score; save(); }
    showResult({ title: t("b1name"), main: plain(t("score", { b: st.score })), sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec,
      perfect: !Object.keys(st.miss).length && st.right >= 10, note: t("listenNote", { r: st.right, c: st.maxc }),
      list: Object.keys(st.miss).map(byId), again: startTap });
  }

  // 2. 這是哪裡：亮起來的部位選讀法；10 題、每題 8 秒
  function startName() {
    gStop(); G.id = "name"; setupPlay(true);
    var LIM = 8000, p = pool(), qs = shuffle(p).slice(0, 10);
    while (qs.length < 10) qs.push(rand(p));
    var st = { qs: qs, i: 0, score: 0, right: 0, miss: {}, qEnd: 0, lock: true };
    function hud() { $("#hudA").innerHTML = t("qNum", { b: Math.min(st.i + 1, 10) }); $("#hudB").innerHTML = t("score", { b: st.score }); }
    function ask() {
      var it = st.qs[st.i];
      $("#gPrompt").innerHTML = '<div class="ptxt">' + t("whereQ") + "</div>";
      $("#gStage").innerHTML = miniStage(sceneOf(it.scene), [it], { target: it });
      $("#gOpts").innerHTML = shuffle([it].concat(others(it, 3, p))).map(function (o) { return '<button class="opt kana" data-id="' + o.id + '">' + o.kana + "</button>"; }).join("");
      msg("");
      st.qEnd = performance.now() + LIM;
      st.lock = false;
      hud();
    }
    function answer(id, btn) {
      if (st.lock) return;
      st.lock = true;
      var it = st.qs[st.i], left = Math.max(0, st.qEnd - performance.now());
      $("#gOpts").querySelectorAll(".opt").forEach(function (b) { if (b.dataset.id === it.id) b.classList.add("ok"); });
      ctx.say(it.kana);
      if (id === it.id) {
        st.right++; st.score += 100 + Math.round(50 * left / LIM);
        ctx.sfx.ok(); hud();
        later(next, 900);
      } else {
        if (btn) btn.classList.add("no");
        ctx.sfx.bad(); st.miss[it.id] = 1; bumpMistake(it); hud();
        msg("<span>" + (id ? "" : t("timeUp")) + "<b>" + it.ja + "</b>（" + kana(it.kana) + "）" + L(it.mean) + '</span><button class="btn primary" id="gNext">' + t("nextQ") + "</button>");
        $("#gNext").onclick = next;
      }
    }
    function next() { st.i++; if (st.i >= 10) { endName(st); return; } ask(); }
    $("#gOpts").onclick = function (e) { var b = e.target.closest(".opt"); if (b && G.id === "name") answer(b.dataset.id, b); };
    every(function () {
      if (st.lock) return;
      var r = Math.max(0, (st.qEnd - performance.now()) / LIM);
      $("#tfill").style.width = (r * 100) + "%";
      if (r <= 0) answer(null, null);
    }, 50);
    ask();
  }
  function endName(st) {
    var prev = prog.best.name, rec = st.score > prev;
    if (rec) { prog.best.name = st.score; save(); }
    showResult({ title: t("b2name"), main: plain(t("score", { b: st.score })), sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec,
      perfect: st.right === 10, note: t("pickNote", { r: st.right }), list: Object.keys(st.miss).map(byId), again: startName });
  }

  // 3. 慣用句挑戰：慣用句缺了一個部位，選出正確的那個；最多 10 題、每題 12 秒
  function startIdiom() {
    gStop(); G.id = "idiom"; setupPlay(true);
    var LIM = 12000, p = pool();
    var bank = [];
    p.forEach(function (it) { it.idioms.forEach(function (id) { bank.push({ it: it, idm: id }); }); });
    var qs = shuffle(bank).slice(0, 10), N = qs.length;
    var st = { i: 0, score: 0, right: 0, miss: {}, qEnd: 0, lock: true };
    function hud() { $("#hudA").innerHTML = t("qOf", { i: Math.min(st.i + 1, N), n: N }); $("#hudB").innerHTML = t("score", { b: st.score }); }
    function ask() {
      var q = qs[st.i], blank = q.idm.ja.replace(q.idm.part, "＿＿");
      $("#gPrompt").innerHTML = '<div class="ptxt"><span class="pidiom">' + blank + "</span><small>" + L(q.idm.tr) + "</small></div>";
      $("#gOpts").innerHTML = shuffle([q.it].concat(others(q.it, 3, p))).map(function (o) { return '<button class="opt" data-id="' + o.id + '">' + nameHtml(o) + "</button>"; }).join("");
      msg("");
      st.qEnd = performance.now() + LIM;
      st.lock = false;
      hud();
    }
    function answer(id, btn) {
      if (st.lock) return;
      st.lock = true;
      var q = qs[st.i], left = Math.max(0, st.qEnd - performance.now());
      $("#gOpts").querySelectorAll(".opt").forEach(function (b) { if (b.dataset.id === q.it.id) b.classList.add("ok"); });
      ctx.say(q.idm.kana);
      var full = "<b>" + q.idm.ja + "</b>（" + kana(q.idm.kana) + "）";
      if (id === q.it.id) {
        st.right++; st.score += 100 + Math.round(50 * left / LIM);
        ctx.sfx.ok(); hud();
        msg("<span>" + full + "</span>");
        later(next, 1600);
      } else {
        if (btn) btn.classList.add("no");
        ctx.sfx.bad(); st.miss[q.it.id] = 1; bumpMistake(q.it); hud();
        msg("<span>" + (id ? "" : t("timeUp")) + full + "</span><span>" + L(q.idm.tr) + '</span><button class="btn primary" id="gNext">' + t("nextQ") + "</button>");
        $("#gNext").onclick = next;
      }
    }
    function next() { st.i++; if (st.i >= N) { endIdiom(st, N); return; } ask(); }
    $("#gOpts").onclick = function (e) { var b = e.target.closest(".opt"); if (b && G.id === "idiom") answer(b.dataset.id, b); };
    every(function () {
      if (st.lock) return;
      var r = Math.max(0, (st.qEnd - performance.now()) / LIM);
      $("#tfill").style.width = (r * 100) + "%";
      if (r <= 0) answer(null, null);
    }, 50);
    ask();
  }
  function endIdiom(st, N) {
    var prev = prog.best.idiom, rec = st.score > prev;
    if (rec) { prog.best.idiom = st.score; save(); }
    showResult({ title: t("b3name"), main: plain(t("score", { b: st.score })), sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec,
      perfect: st.right === N, note: t("roundScore", { r: st.right, n: N }), list: Object.keys(st.miss).map(byId), again: startIdiom });
  }

  function showResult(r) {
    gStop();
    pane("result");
    var list = r.list.length
      ? '<div class="mist"><div class="mh">' + t("missHeadPart") + "・" + t("tapToHear") + "</div>" +
        r.list.map(function (it) { return '<button class="mrow" data-id="' + it.id + '"><span>' + nameHtml(it) + "　" + L(it.mean) + "</span></button>"; }).join("") + "</div>"
      : "";
    $("#gResult").innerHTML = '<div class="result">' + (r.perfect ? window.VocabDeck.HANAMARU : "") +
      '<div class="rtitle">' + r.title + '</div><div class="rmain">' + r.main + '</div><div class="rsub' + (r.rec ? " rec" : "") + '">' + r.sub + '</div><div class="rnote">' + r.note + "</div>" + list +
      '<div class="btnrow"><button class="btn" id="rMenu">' + t("menu") + '</button><button class="btn primary" id="rAgain">' + t("again") + "</button></div></div>";
    $("#gResult").onclick = function (e) { var m = e.target.closest(".mrow"); if (m) ctx.say(byId(m.dataset.id).kana); };
    $("#rMenu").onclick = renderMenu;
    $("#rAgain").onclick = r.again;
    if (r.perfect || r.rec) ctx.sfx.win();
  }

  /* ---------- 分頁 ---------- */
  function setTab(tab) {
    view.tab = tab;
    el.querySelectorAll(".tabs [data-tab]").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.tab === tab)); });
    el.querySelectorAll("[data-v]").forEach(function (s) { s.hidden = s.dataset.v !== tab; });
    $("#pBar").hidden = tab === "map";
    if (G.id) gStop();
    if (tab === "map") placeLabels();   // 從別的分頁回來時舞台才有尺寸
    if (tab === "games") renderMenu();
    if (tab === "cards") deck.resume();
    else deck.stop();
  }

  function bind() {
    el.querySelector(".tabs").onclick = function (e) { var b = e.target.closest("[data-tab]"); if (b) setTab(b.dataset.tab); };
    $("#lvSeg").onclick = function (e) { var b = e.target.closest("[data-lv]"); if (b) setLevel(+b.dataset.lv); };
    $("#pScenes").onclick = function (e) {
      var a = e.target.closest("[data-alt]");
      if (a) view.alt[view.scene] = +a.dataset.alt;
      var b = e.target.closest("[data-sc]");
      if (b) view.scene = b.dataset.sc;
      if (!a && !b) return;
      renderScenes(); renderStage();
    };
    $("#pStage").onclick = function (e) { var b = e.target.closest("[data-id]"); if (b) select(b.dataset.id); };
    $("#hideNames").onchange = function (e) {
      view.hide = e.target.checked;
      $("#pStage").classList.toggle("hide", view.hide);
      $("#pStage").querySelectorAll(".peek").forEach(function (x) { x.classList.remove("peek"); });
    };
    $("#gMenu").onclick = function (e) {
      var b = e.target.closest("[data-game]");
      if (b) ({ tap: startTap, name: startName, idiom: startIdiom })[b.dataset.game]();
    };
    $("#gQuit").onclick = function () { gStop(); renderMenu(); };
    var timer = null;
    onResize = function () { clearTimeout(timer); timer = setTimeout(placeLabels, 120); };
    window.addEventListener("resize", onResize);
  }

  /* ---------- 模板介面 ---------- */
  function mount(root, theme, c, meta) {
    unmount();
    el = root; D = theme; ctx = c; store = c.store(meta.id);
    prog = store.get() || {};
    prog.best = Object.assign({ tap: 0, name: 0, idiom: 0 }, prog.best);
    ITEMS = D.items;
    SCENES = D.scenes;
    if (!view.scene) view.scene = SCENES[0].id;
    view.level = Math.min(view.level, 2);

    el.innerHTML = layout();
    deck = window.VocabDeck.create({
      root: $("#deckRoot"), ctx: ctx, prog: prog, save: save,
      pool: pool,
      key: function (it) { return it.id; },
      label: function (it) { return nameHtml(it) + "　" + L(it.mean); },
      sayOf: function (it) { return it.kana; },
      render: renderCard
    });
    bind();
    renderScenes();
    renderStage();
    renderDetail();
    setTab(view.tab);
  }

  function unmount() {
    gStop();
    if (deck) deck.stop();
    if (onResize) { window.removeEventListener("resize", onResize); onResize = null; }
  }

  window.VocabTemplates = window.VocabTemplates || {};
  window.VocabTemplates.picture = { mount: mount, unmount: unmount };
})();
