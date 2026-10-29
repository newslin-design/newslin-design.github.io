/* ============================================================
   imageCard.js ─ 圖卡模板（一個單字配一張圖，例如食物）
   ------------------------------------------------------------
   總覽圖：上面選分類，下面是一格一格的圖卡；點圖卡看讀法、意思、例句。
   容易跟中文搞混的字（trap）標紅。
   卡片的出題、熟悉度、一回 10 題在 js/deck.js；這裡只負責每一題長什麼樣子。
   題目以「圖 ↔ 日文」為主，不太需要翻譯，四種母語都一樣好用。
   內容（分類、字、例句、圖）都在 data/themes/<id>.js；換成 Midjourney 的圖只要在資料填 img。
   小遊戲由資料的 games 決定（沒寫就是 tap、name、sort），例：食物的第三個是點餐 order。
   ============================================================ */
(function () {
  "use strict";

  var TYPES = ["name", "hear", "see"];
  /** 小遊戲：圖示字、文字的 key 前綴（c1name、c1desc…） */
  var GAME_DEFS = {
    tap: { ico: "聴", n: "c1" },
    name: { ico: "名", n: "c2" },
    sort: { ico: "分", n: "c3" },
    order: { ico: "注", n: "c4" }
  };
  var SPK = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';

  var view = { tab: "map", group: "all", sel: null, hide: false };   // 換語言重畫時保留
  var el, D, ctx, store, prog, deck, ITEMS, GROUPS, GAMES;
  var G = { id: null, timers: [] };

  function $(s) { return el.querySelector(s); }
  function t(k, v) { return ctx.t(k, v); }
  function L(o) { return ctx.loc(o); }
  function kana(s) { return '<span class="kana">' + s + "</span>"; }
  function save() { store.set(prog); }
  function byId(id) { return ITEMS.filter(function (it) { return it.id === id; })[0]; }
  function groupOf(id) { return GROUPS.filter(function (g) { return g.id === id; })[0]; }
  function inGroup(gid) { return ITEMS.filter(function (it) { return it.group === gid; }); }
  function pool() { return view.group === "all" ? ITEMS : inGroup(view.group); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function rand(list) { return list[Math.floor(Math.random() * list.length)]; }
  /** 名稱：有漢字就「漢字＋小字假名」，只有假名就只寫一次 */
  function nameHtml(it) { return it.ja === it.kana ? '<b class="kana">' + it.ja + "</b>" : "<b>" + it.ja + "</b>" + kana(it.kana); }
  function pic(it) { return it.img ? '<img src="' + it.img + '" alt="">' : '<span class="ic-emo" aria-hidden="true">' + it.emo + "</span>"; }
  function trapTag() { return D.text.trapTag ? L(D.text.trapTag) : t("trapTag"); }

  /** 意思很近、只看圖分不出來的兩個字（資料裡的 near），不拿來當彼此的錯誤選項 */
  function near(a, b) { return (a.near || []).indexOf(b.id) >= 0 || (b.near || []).indexOf(a.id) >= 0; }
  /** 干擾選項：先挑同一類的字，不夠再從別類補（只選一類、字很少時也湊得滿四個） */
  function others(it, n) {
    var list = ITEMS;
    var ok = function (x) { return x !== it && x.kana !== it.kana && !near(it, x); };
    var same = shuffle(list.filter(function (x) { return ok(x) && x.group === it.group; }));
    var rest = shuffle(list.filter(function (x) { return ok(x) && x.group !== it.group; }));
    return same.concat(rest).slice(0, n);
  }

  /** 一格圖卡：opts.name 要不要寫名稱；opts.cls 額外的 class */
  function tile(it, opts) {
    opts = opts || {};
    var cls = "ic-tile" + (it.trap ? " trap" : "") + (opts.cls ? " " + opts.cls : "");
    return '<button class="' + cls + '" data-id="' + it.id + '"' + (opts.name ? "" : ' aria-label="' + t("tapHere") + '"') + '>' +
      '<span class="ic-pic">' + pic(it) + "</span>" +
      (opts.name ? '<span class="ic-name">' + nameHtml(it) + '</span><span class="ic-q" aria-hidden="true">？</span>' : "") +
      "</button>";
  }

  /* ---------- 版面 ---------- */
  function layout() {
    return '' +
      '<nav class="tabs" role="tablist">' +
        '<button role="tab" data-tab="map">' + t("tabMap") + '</button>' +
        '<button role="tab" data-tab="cards">' + t("tabCards") + '</button>' +
        '<button role="tab" data-tab="games">' + t("tabGames") + '</button>' +
      '</nav>' +
      '<div class="ic-groups" id="icGroups"></div>' +
      '<section data-v="map">' +
        '<div class="pdetail" id="icDetail" aria-live="polite"></div>' +
        '<div class="ic-grid" id="icGrid"></div>' +
        '<div class="maptools">' +
          '<label class="switch"><input type="checkbox" id="hideNames"' + (view.hide ? " checked" : "") + '><span>' + t("hideNames") + '</span></label>' +
          '<span class="legend"><i class="trap"></i>' + trapTag() + '</span>' +
        '</div>' +
        '<p class="artnote">' + t("artNoteEmoji") + '</p>' +
        '<div class="rules"><h2>' + L(D.text.rulesTitle) + '</h2><ol>' +
          D.text.rules.map(function (r) { return "<li>" + ctx.rich(L(r)) + "</li>"; }).join("") +
        '</ol><p class="tip">' + ctx.rich(L(D.text.tip)) + '</p></div>' +
      '</section>' +
      '<section data-v="cards" hidden><div id="deckRoot"></div></section>' +
      '<section data-v="games" hidden>' +
        '<div id="gMenu" class="gmenu">' +
          GAMES.map(function (id) {
            var g = GAME_DEFS[id];
            return '<button class="gtile" data-game="' + id + '"><span class="ico">' + g.ico + '</span><span><b>' + t(g.n + "name") + '</b><small>' + t(g.n + "desc") + '</small></span><span class="best" data-best="' + id + '"></span></button>';
          }).join("") +
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

  /* ---------- 分類（三個分頁共用） ---------- */
  function renderGroups() {
    var chip = function (id, label, n) {
      return '<button class="chip" data-g="' + id + '" aria-pressed="' + (view.group === id) + '">' + label + " <small>" + n + "</small></button>";
    };
    $("#icGroups").innerHTML = chip("all", t("groupAll"), ITEMS.length) +
      GROUPS.map(function (g) { return chip(g.id, '<span aria-hidden="true">' + g.emo + "</span> " + L(g.name), inGroup(g.id).length); }).join("");
  }

  function setGroup(id) {
    view.group = id;
    renderGroups();
    renderGrid();
    renderDetail();
    if (view.tab === "cards") deck.resume();
    if (view.tab === "games") { gStop(); renderMenu(); }
  }

  /* ---------- 總覽圖 ---------- */
  function renderGrid() {
    var list = pool(), g = $("#icGrid");
    g.classList.toggle("hide", view.hide);
    g.innerHTML = list.map(function (it) { return tile(it, { name: true, cls: view.sel === it.id ? "sel" : "" }); }).join("");
  }

  function renderDetail() {
    var it = view.sel && byId(view.sel);
    if (!it || pool().indexOf(it) < 0) { $("#icDetail").innerHTML = '<p class="wd-hint">' + t("tapFood") + "</p>"; return; }
    var gr = groupOf(it.group);
    var note = it.note ? '<p class="' + (it.trap ? "ptrap" : "pnote") + '">' + ctx.rich(L(it.note)) + "</p>" : "";
    $("#icDetail").innerHTML =
      '<div class="ic-dtop"><span class="ic-dpic">' + pic(it) + '</span>' +
        '<div class="ic-dmain"><div class="wd-top"><span class="pd-name' + (it.trap ? " trap" : "") + '">' + nameHtml(it) + '</span><button class="say" id="icSay" aria-label="' + t("replay") + '">' + SPK + "</button></div>" +
        '<div class="wd-tags"><span class="badge"><span class="kana">' + gr.kana + "</span>・" + L(gr.name) + "</span>" + (it.trap ? '<span class="naitag">' + trapTag() + "</span>" : "") + "</div>" +
        '<div class="wd-mean">' + L(it.mean) + "</div></div></div>" +
      note +
      '<div class="pph phr"><span class="wd-lab">' + t("exLabel") + "</span>" + it.phrases.map(function (p) {
        return '<button class="pph-row" data-say="' + p.kana + '"><span class="pph-ja">' + p.ja + '</span><span class="kana pph-kana">' + p.kana + '</span><span class="pph-tr">' + L(p.tr) + '</span><span class="pph-play" aria-hidden="true">' + SPK + "</span></button>";
      }).join("") + "</div>";
    $("#icSay").onclick = function () { ctx.say(it.kana); };
    $("#icDetail").querySelectorAll("[data-say]").forEach(function (b) { b.onclick = function () { ctx.say(b.dataset.say); }; });
  }

  function select(id) {
    view.sel = id;
    $("#icGrid").querySelectorAll(".ic-tile").forEach(function (b) {
      b.classList.toggle("sel", b.dataset.id === id);
      if (b.dataset.id === id) b.classList.add("peek");
    });
    renderDetail();
    ctx.say(byId(id).kana);
  }

  /* ---------- 卡片：每一題長什麼樣子（出題和記分在 deck.js） ---------- */
  function renderCard(box, it, done) {
    var ty = TYPES[Math.floor(Math.random() * TYPES.length)];
    var q = function (s) { return box.querySelector(s); };
    var info = '<span class="pd-name">' + nameHtml(it) + "</span><span>" + L(it.mean) + "</span>";
    if (ty === "name") {
      var opts = shuffle([it].concat(others(it, 3)));
      box.innerHTML = '<div class="ctag">' + t("whatQ") + '</div><div class="ic-big">' + pic(it) + "</div>" +
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
      var voice = ctx.canHear(it.kana), four = shuffle([it].concat(others(it, 3)));
      box.innerHTML = '<div class="ctag">' + t(voice ? "hearQ" : "readQ") + "</div>" +
        (voice ? '<button class="say csay" aria-label="' + t("replay") + '">' + SPK + "</button>" : '<div class="cbig kana">' + it.kana + "</div>") +
        '<div class="ic-pick">' + four.map(function (o) { return tile(o); }).join("") + "</div>" + '<div class="cnext"></div>';
      if (q(".csay")) { q(".csay").onclick = function () { ctx.say(it.kana); }; ctx.say(it.kana); }
      var tapped = false;
      q(".ic-pick").onclick = function (e) {
        var d = e.target.closest(".ic-tile");
        if (!d || tapped) return;
        tapped = true;
        var right = d.dataset.id === it.id;
        q('.ic-tile[data-id="' + it.id + '"]').classList.add("ok");
        q(".cnext").innerHTML = info;
        if (right) { ctx.sfx.ok(); done(true, 1200); }
        else { d.classList.add("no"); ctx.sfx.bad(); ctx.say(it.kana); done(false); }
      };
      return;
    }
    /* see：看日文，想想是什麼，翻牌自己判斷 */
    box.innerHTML = '<div class="ctag">' + t("seeFoodQ") + '</div><div class="cbig pd-name' + (it.trap ? " trap" : "") + '">' + nameHtml(it) + "</div>" +
      '<div class="cans" hidden><div class="ic-big">' + pic(it) + '</div><span class="wd-mean">' + L(it.mean) + "</span>" +
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
    el.querySelectorAll("[data-best]").forEach(function (s) {
      var v = prog.best[s.dataset.best];
      s.textContent = v ? t("bestScore", { s: v }) : t("never");
    });
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

  /** 60 秒、連續答對加分的計時遊戲共用：hud 和結束時間 */
  function timed(st, endFn) {
    return function hud() {
      var left = Math.max(0, Math.ceil((st.end - performance.now()) / 1000));
      $("#hudA").innerHTML = t("left", { b: left });
      $("#hudB").innerHTML = t("score", { b: st.score }) + (st.combo > 1 ? "・" + t("combo", { c: st.combo }) : "");
      if (left <= 0) endFn(st);
    };
  }

  // 1. 聽音找圖：聽名稱，從 6 張圖裡點出來；60 秒，連續答對加分
  function startTap() {
    gStop(); G.id = "tap"; setupPlay(false);
    var st = { score: 0, combo: 0, maxc: 0, right: 0, q: null, miss: {}, end: performance.now() + 60000, lock: true };
    var hud = timed(st, endTap);
    function next() {
      var p = pool();
      st.q = rand(p.filter(function (x) { return x !== st.q; }));
      var voice = ctx.canHear(st.q.kana), six = shuffle([st.q].concat(others(st.q, 5)));
      $("#gPrompt").innerHTML = (voice ? '<button class="say big" id="gSay" aria-label="' + t("replay") + '">' + SPK + "</button>" : "") +
        '<div class="ptxt">' + (voice ? t("hearQ") : '<span class="pkana">' + st.q.kana + "</span><small>" + t("noVoiceShow") + "</small>") + "</div>";
      if (voice) { $("#gSay").onclick = function () { ctx.say(st.q.kana); }; ctx.say(st.q.kana); }
      $("#gStage").innerHTML = '<div class="ic-pick six">' + six.map(function (o) { return tile(o); }).join("") + "</div>";
      msg("");
      st.lock = false;
    }
    $("#gStage").onclick = function (e) {
      var d = e.target.closest(".ic-tile");
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
        $("#gStage").querySelector('.ic-tile[data-id="' + st.q.id + '"]').classList.add("ok");
        st.miss[st.q.id] = 1; deck.bump(st.q);
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
    showResult({ title: t("c1name"), main: plain(t("score", { b: st.score })), sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec,
      perfect: !Object.keys(st.miss).length && st.right >= 10, note: t("listenNote", { r: st.right, c: st.maxc }),
      list: Object.keys(st.miss).map(byId), again: startTap });
  }

  // 2. 這是什麼：看圖選讀法；10 題、每題 8 秒
  function startName() {
    gStop(); G.id = "name"; setupPlay(true);
    var LIM = 8000, p = pool(), qs = shuffle(p).slice(0, 10);
    while (qs.length < 10) qs.push(rand(p));
    var st = { qs: qs, i: 0, score: 0, right: 0, miss: {}, qEnd: 0, lock: true };
    function hud() { $("#hudA").innerHTML = t("qNum", { b: Math.min(st.i + 1, 10) }); $("#hudB").innerHTML = t("score", { b: st.score }); }
    function ask() {
      var it = st.qs[st.i];
      $("#gPrompt").innerHTML = '<div class="ptxt">' + t("whatQ") + "</div>";
      $("#gStage").innerHTML = '<div class="ic-big">' + pic(it) + "</div>";
      $("#gOpts").innerHTML = shuffle([it].concat(others(it, 3))).map(function (o) { return '<button class="opt kana" data-id="' + o.id + '">' + o.kana + "</button>"; }).join("");
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
        ctx.sfx.bad(); st.miss[it.id] = 1; deck.bump(it); hud();
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
    showResult({ title: t("c2name"), main: plain(t("score", { b: st.score })), sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec,
      perfect: st.right === 10, note: t("pickNote", { r: st.right }), list: Object.keys(st.miss).map(byId), again: startName });
  }

  // 3. 分分看：只看日文（沒有圖），分到對的類別；60 秒，連續答對加分。
  //    只選一類時分類就沒意義了，所以不管上面選哪一類，都從全部出題
  function startSort() {
    gStop(); G.id = "sort"; setupPlay(false);
    var st = { score: 0, combo: 0, maxc: 0, right: 0, q: null, miss: {}, end: performance.now() + 60000, lock: true };
    var hud = timed(st, endSort);
    $("#gOpts").innerHTML = GROUPS.map(function (g) {
      return '<button class="opt ic-gopt" data-g="' + g.id + '"><span class="kana">' + g.kana + "</span><small>" + L(g.name) + "</small></button>";
    }).join("");
    function next() {
      st.q = rand(ITEMS.filter(function (x) { return x !== st.q; }));
      $("#gPrompt").innerHTML = '<div class="ptxt"><span class="pkana ic-sortw">' + nameHtml(st.q) + "</span><small>" + t("sortQ") + "</small></div>";
      $("#gOpts").querySelectorAll(".opt").forEach(function (b) { b.classList.remove("ok", "no"); });
      msg("");
      st.lock = false;
    }
    $("#gOpts").onclick = function (e) {
      var b = e.target.closest(".opt");
      if (!b || st.lock || G.id !== "sort") return;
      st.lock = true;
      var gr = groupOf(st.q.group);
      $("#gOpts").querySelector('[data-g="' + gr.id + '"]').classList.add("ok");
      if (b.dataset.g === gr.id) {
        st.combo++; st.maxc = Math.max(st.maxc, st.combo); st.right++;
        st.score += 10 + Math.min(st.combo - 1, 10) * 2;
        ctx.sfx.ok();
        msg('<span class="ic-show">' + pic(st.q) + " " + L(st.q.mean) + "</span>");
        later(next, 700);
      } else {
        st.combo = 0;
        ctx.sfx.bad(); b.classList.add("no");
        st.miss[st.q.id] = 1; deck.bump(st.q);
        msg('<span class="ic-show">' + pic(st.q) + " " + t("sortWrong", { w: st.q.ja, g: gr.kana }) + "</span>");
        ctx.say(st.q.kana);
        later(next, 1600);
      }
      hud();
    };
    hud(); every(hud, 200); next();
  }
  function endSort(st) {
    if (G.id !== "sort") return;
    var prev = prog.best.sort, rec = st.score > prev;
    if (rec) { prog.best.sort = st.score; save(); }
    showResult({ title: t("c3name"), main: plain(t("score", { b: st.score })), sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec,
      perfect: !Object.keys(st.miss).length && st.right >= 10, note: t("listenNote", { r: st.right, c: st.maxc }),
      list: Object.keys(st.miss).map(byId), again: startSort });
  }

  // 4. 點餐：聽客人點了哪幾樣，從 8 張圖裡全部點出來（順序不拘）；60 秒，前 3 位點 2 樣，之後點 3 樣。
  //    點錯一次可以再聽，錯兩次就公布答案、換下一位。句型「〇〇と 〇〇を ください」寫在畫面上，聲音只念東西的名稱
  function shortMean(it) { return L(it.mean).split(/[;；]/)[0].replace(/[（(].*?[）)]/g, "").trim(); }
  function startOrder() {
    gStop(); G.id = "order"; setupPlay(false);
    var st = { score: 0, combo: 0, maxc: 0, right: 0, n: 0, order: [], got: {}, shown: {}, strikes: 0, voice: true, miss: {}, end: performance.now() + 60000, lock: true };
    var hud = timed(st, endOrder);
    function sayOrder() { ctx.say(st.order.map(function (x) { return x.kana; })); }
    function sentence() {
      return st.order.map(function (x, i) {
        var s = st.got[x.id] ? '<span class="ic-slot ok">' + x.kana + "</span>"
          : st.shown[x.id] ? '<span class="ic-slot miss">' + x.kana + "</span>"
          : st.voice ? '<span class="ic-slot">？</span>' : '<span class="ic-slot txt">' + x.kana + "</span>";
        return s + (i < st.order.length - 1 ? "と" : "を ください");
      }).join(" ");
    }
    function prompt() {
      $("#gPrompt").innerHTML = (st.voice ? '<button class="say big" id="gSay" aria-label="' + t("replay") + '">' + SPK + "</button>" : "") +
        '<div class="ptxt"><div class="ic-order">' + sentence() + "</div><small>" + t(st.voice ? "orderQ" : "noVoiceShow") + "</small></div>";
      if (st.voice) $("#gSay").onclick = sayOrder;
    }
    function next() {
      var src = pool().length >= 8 ? pool() : ITEMS, k = st.n < 3 ? 2 : 3, pick = [], prev = st.order;
      shuffle(src).forEach(function (x) {   // 上一位客人點過的不再點
        if (pick.length < k && prev.indexOf(x) < 0 && pick.every(function (p) { return p.kana !== x.kana && !near(p, x); })) pick.push(x);
      });
      var rest = shuffle(src.filter(function (x) {
        return pick.every(function (p) { return p !== x && p.kana !== x.kana && !near(p, x); });
      })).slice(0, 8 - k);
      st.order = pick; st.got = {}; st.shown = {}; st.strikes = 0;
      st.voice = pick.every(function (x) { return ctx.canHear(x.kana); });
      prompt();
      $("#gStage").innerHTML = '<div class="ic-pick eight">' + shuffle(pick.concat(rest)).map(function (o) { return tile(o); }).join("") + "</div>";
      msg("");
      if (st.voice) sayOrder();
      st.lock = false;
    }
    function served() {
      var ja = st.order.map(function (x) { return x.ja; }).join("と ") + "を ください";
      var m = st.order.map(shortMean), last = m.pop();   // 紅茶、啤酒和仙貝
      return "<b>" + ja + "</b>　" + t("orderTr", { w: m.join(t("orderSep")) + t("orderJoin") + last });
    }
    $("#gStage").onclick = function (e) {
      var d = e.target.closest(".ic-tile");
      if (!d || st.lock || G.id !== "order" || d.classList.contains("ok") || d.classList.contains("no")) return;
      var it = byId(d.dataset.id);
      if (st.order.indexOf(it) >= 0) {
        st.got[it.id] = 1;
        d.classList.add("ok"); ctx.sfx.ok();
        prompt();
        if (Object.keys(st.got).length === st.order.length) {
          st.lock = true; st.n++; st.right++;
          st.combo++; st.maxc = Math.max(st.maxc, st.combo);
          st.score += 10 * st.order.length + Math.min(st.combo - 1, 10) * 3;
          msg("<span>" + served() + "</span>");
          later(next, 1300);
        }
      } else {
        d.classList.add("no"); ctx.sfx.bad();
        st.combo = 0; st.strikes++;
        if (st.strikes < 2) { msg("<span>" + t("orderAgain") + "</span>"); if (st.voice) sayOrder(); }
        else {
          st.lock = true; st.n++;
          st.order.forEach(function (x) {
            if (st.got[x.id]) return;
            st.miss[x.id] = 1; st.shown[x.id] = 1; deck.bump(x);
            $("#gStage").querySelector('.ic-tile[data-id="' + x.id + '"]').classList.add("ok");
          });
          prompt();
          msg("<span>" + t("orderWas") + "：" + served() + "</span>");
          sayOrder();
          later(next, 2400);
        }
      }
      hud();
    };
    hud(); every(hud, 200); next();
  }
  function endOrder(st) {
    if (G.id !== "order") return;
    var prev = prog.best.order, rec = st.score > prev;
    if (rec) { prog.best.order = st.score; save(); }
    showResult({ title: t("c4name"), main: plain(t("score", { b: st.score })), sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec,
      perfect: !Object.keys(st.miss).length && st.right >= 5, note: t("orderNote", { r: st.right, c: st.maxc }),
      list: Object.keys(st.miss).map(byId), again: startOrder });
  }

  function showResult(r) {
    gStop();
    pane("result");
    var list = r.list.length
      ? '<div class="mist"><div class="mh">' + t("missHead") + "・" + t("tapToHear") + "</div>" +
        r.list.map(function (it) { return '<button class="mrow" data-id="' + it.id + '"><span>' + (it.img ? "" : it.emo + "　") + nameHtml(it) + "　" + L(it.mean) + "</span></button>"; }).join("") + "</div>"
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
    if (G.id) gStop();
    if (tab === "games") renderMenu();
    if (tab === "cards") deck.resume();
    else deck.stop();
  }

  function bind() {
    el.querySelector(".tabs").onclick = function (e) { var b = e.target.closest("[data-tab]"); if (b) setTab(b.dataset.tab); };
    $("#icGroups").onclick = function (e) { var b = e.target.closest("[data-g]"); if (b) setGroup(b.dataset.g); };
    $("#icGrid").onclick = function (e) { var b = e.target.closest("[data-id]"); if (b) select(b.dataset.id); };
    $("#hideNames").onchange = function (e) {
      view.hide = e.target.checked;
      $("#icGrid").classList.toggle("hide", view.hide);
      $("#icGrid").querySelectorAll(".peek").forEach(function (x) { x.classList.remove("peek"); });
    };
    $("#gMenu").onclick = function (e) {
      var b = e.target.closest("[data-game]");
      if (b) ({ tap: startTap, name: startName, sort: startSort, order: startOrder })[b.dataset.game]();
    };
    $("#gQuit").onclick = function () { gStop(); renderMenu(); };
  }

  /* ---------- 模板介面 ---------- */
  function mount(root, theme, c, meta) {
    unmount();
    el = root; D = theme; ctx = c; store = c.store(meta.id);
    prog = store.get() || {};
    prog.best = Object.assign({ tap: 0, name: 0, sort: 0, order: 0 }, prog.best);
    ITEMS = D.items;
    GROUPS = D.groups;
    GAMES = (D.games || ["tap", "name", "sort"]).filter(function (id) { return GAME_DEFS[id]; });
    if (view.group !== "all" && !groupOf(view.group)) view.group = "all";

    el.innerHTML = layout();
    deck = window.VocabDeck.create({
      root: $("#deckRoot"), ctx: ctx, prog: prog, save: save,
      pool: pool,
      key: function (it) { return it.id; },
      label: function (it) { return (it.img ? "" : it.emo + "　") + nameHtml(it) + "　" + L(it.mean); },
      sayOf: function (it) { return it.kana; },
      render: renderCard
    });
    bind();
    renderGroups();
    renderGrid();
    renderDetail();
    setTab(view.tab);
  }

  function unmount() {
    gStop();
    if (deck) deck.stop();
  }

  window.VocabTemplates = window.VocabTemplates || {};
  window.VocabTemplates.imageCard = { mount: mount, unmount: unmount };
})();
