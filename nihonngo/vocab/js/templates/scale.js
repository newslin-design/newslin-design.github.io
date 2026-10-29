/* ============================================================
   scale.js ─ 刻度模板（頻率、程度這類「排在一條軸上」的字）
   ------------------------------------------------------------
   總覽圖（直尺＋例句，要接〜ない的字標紅）→ 卡片（考意思）→ 小遊戲三種。
   內容（字、位置、意思、例句）都在 data/themes/<id>.js，這裡只管畫面和玩法；
   同一個模板之後也能套「程度副詞」，只要加資料檔。
   這些字大多是假名，中文使用者沒有漢字的優勢，所以四種母語都考意思（跟月曆模板不同）。
   卡片的出題、熟悉度、一回 10 題的結算在 js/deck.js；這裡只負責每一題長什麼樣子。
   ============================================================ */
(function () {
  "use strict";

  var TYPES = ["see", "hear", "read"];
  var GAP = 15;   // 位置相差這麼多以上才拿來比；たびたび／しばしば 這種同一格的字不考誰比較常
  var ORDER_PENALTY = 5;   // 排排看點錯加幾秒（Lin 指定 5 秒）
  var SPK = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';

  var view = { tab: "map", only1: false, sel: null };   // 換語言重畫時保留
  var el, D, ctx, store, prog, deck, ITEMS;
  var G = { id: null, timers: [] };

  function $(s) { return el.querySelector(s); }
  function t(k, v) { return ctx.t(k, v); }
  function L(o) { return ctx.loc(o); }
  function kana(s) { return '<span class="kana">' + s + "</span>"; }
  function save() { store.set(prog); }
  function byId(id) { return ITEMS.filter(function (it) { return it.id === id; })[0]; }
  function said(it) { return it.ja.replace("〜ない", ""); }   // 念的時候不念〜ない
  function pool() { return ITEMS.filter(function (it) { return !view.only1 || it.level === 1; }); }
  function far(a, b) { return Math.abs(a.pos - b.pos) >= GAP; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function pickW(list) { var r = Math.random() * list.reduce(function (s, x) { return s + x.w; }, 0); for (var i = 0; i < list.length; i++) { if ((r -= list[i].w) < 0) return list[i]; } return list[list.length - 1]; }
  function rand(list) { return list[Math.floor(Math.random() * list.length)]; }

  /** 挑 n 個彼此相差夠遠的字（排排看用） */
  function pickFar(n, list) {
    for (var tries = 0; tries < 60; tries++) {
      var out = [];
      shuffle(list).forEach(function (it) { if (out.length < n && out.every(function (o) { return far(o, it); })) out.push(it); });
      if (out.length === n) return out;
    }
    return null;
  }
  /** 干擾選項：先挑跟答案相差夠遠的，不夠再補 */
  function others(it, n) {
    var a = shuffle(ITEMS.filter(function (x) { return x !== it && far(x, it); }));
    var b = shuffle(ITEMS.filter(function (x) { return x !== it && !far(x, it); }));
    return a.concat(b).slice(0, n);
  }

  /** 例句：副詞畫底線，動詞依肯定／否定上色 */
  function exHtml(it) {
    var s = it.ex.ja, w = said(it);
    if (it.ex.hl) s = s.replace(it.ex.hl, '<span class="' + (it.nai ? "vneg" : "vpos") + '">' + it.ex.hl + "</span>");
    return s.replace(w, '<mark class="adv">' + w + "</mark>");
  }
  function minibar(it) {
    return '<div class="minibar"><span>0%</span><div class="mb"><i style="left:' + it.pos + '%"></i></div><span>100%</span></div>';
  }

  /** 遊戲裡答錯的字：熟悉度 -1，之後卡片比較常抽到 */
  function bumpMistake(it) { deck.bump(it); }

  /* ---------- 版面 ---------- */
  function layout() {
    return '' +
      '<nav class="tabs" role="tablist">' +
        '<button role="tab" data-tab="map">' + t("tabMap") + '</button>' +
        '<button role="tab" data-tab="cards">' + t("tabCards") + '</button>' +
        '<button role="tab" data-tab="games">' + t("tabGames") + '</button>' +
      '</nav>' +
      '<section data-v="map">' +
        '<div class="sc-tools"><button class="chip" id="lvBtn"></button><span class="legend"><i class="nai"></i>' + t("naiTag") + '</span></div>' +
        '<div class="ruler" id="ruler"></div>' +
        '<div class="wdetail" id="wd" aria-live="polite"></div>' +
        '<div class="rules"><h2>' + L(D.text.rulesTitle) + '</h2><ol>' +
          D.text.rules.map(function (r) { return "<li>" + ctx.rich(L(r)) + "</li>"; }).join("") +
        '</ol><p class="tip">' + ctx.rich(L(D.text.tip)) + '</p></div>' +
      '</section>' +
      '<section data-v="cards" hidden><div id="deckRoot"></div></section>' +
      '<section data-v="games" hidden>' +
        '<div id="gMenu" class="gmenu">' +
          '<button class="gtile" data-game="order"><span class="ico">並</span><span><b>' + t("s1name") + '</b><small>' + t("s1desc") + '</small></span><span class="best" id="bOrder"></span></button>' +
          '<button class="gtile" data-game="compare"><span class="ico">比</span><span><b>' + t("s2name") + '</b><small>' + t("s2desc") + '</small></span><span class="best" id="bCompare"></span></button>' +
          '<button class="gtile" data-game="nai"><span class="ico ico-sm">ない</span><span><b>' + t("s3name") + '</b><small>' + t("s3desc") + '</small></span><span class="best" id="bNai"></span></button>' +
          '<p class="gnote">' + t("gnoteWord") + '</p>' +
        '</div>' +
        '<div id="gPlay" hidden>' +
          '<div class="hud"><span id="hudA"></span><span id="hudB"></span><button class="quit" id="gQuit">' + t("quit") + '</button></div>' +
          '<div class="tbar" id="tbar" hidden><i id="tfill"></i></div>' +
          '<div class="prompt" id="gPrompt"></div>' +
          '<div class="opts" id="gOpts"></div>' +
          '<div class="track" id="track" hidden></div>' +
          '<div class="gmsg" id="gMsg"></div>' +
        '</div>' +
        '<div id="gResult" hidden></div>' +
      '</section>';
  }

  /* ---------- 總覽圖：直尺 ---------- */
  function renderRuler() {
    var h = '<div class="axis"></div>';
    [0, 20, 40, 60, 80, 100].forEach(function (p) { h += '<div class="tk" style="top:' + (100 - p) + '%">' + p + "%</div>"; });
    var rows = {};
    ITEMS.forEach(function (it) { (rows[it.pos] = rows[it.pos] || []).push(it); });
    Object.keys(rows).forEach(function (p) {
      h += '<div class="row" style="top:' + (100 - p) + '%">' + rows[p].map(function (it) {
        return '<button class="wchip kana' + (it.level > 1 ? " lv2" : "") + (it.nai ? " nai" : "") + (view.sel === it.id ? " sel" : "") + '" data-id="' + it.id + '">' + it.ja + "</button>";
      }).join("") + "</div>";
    });
    $("#ruler").innerHTML = h;
    $("#ruler").classList.toggle("only1", view.only1);
    $("#lvBtn").textContent = t(view.only1 ? "lvAll" : "lvOnly1");
  }

  function renderDetail() {
    var it = view.sel && byId(view.sel);
    if (!it || (view.only1 && it.level > 1)) { $("#wd").innerHTML = '<p class="wd-hint">' + t("tapWord") + "</p>"; return; }
    $("#wd").innerHTML =
      '<div class="wd-top"><span class="kana wd-w' + (it.nai ? " nai" : "") + '">' + it.ja + '</span><button class="say" id="wSay" aria-label="' + t("replay") + '">' + SPK + "</button></div>" +
      '<div class="wd-tags"><span class="badge">' + t("levelTag", { l: it.level, p: it.pos }) + "</span>" + (it.nai ? '<span class="naitag">' + t("naiTag") + "</span>" : "") + "</div>" +
      '<div class="wd-mean">' + L(it.mean) + "</div>" +
      '<div class="wd-ex"><span class="wd-lab">' + t("exLabel") + '</span><div class="kana wd-ja">' + exHtml(it) + '</div><div class="wd-tr">' + L(it.ex.tr) + "</div></div>" +
      '<button class="btn" id="exSay">' + t("exPlay") + "</button>";
    $("#wSay").onclick = function () { ctx.say(said(it)); };
    $("#exSay").onclick = function () { ctx.say(it.ex.ja); };
  }

  /* ---------- 卡片：每一題長什麼樣子（出題和記分在 deck.js） ---------- */
  function answerBlock(it) {
    return '<div class="cans-mean">' + L(it.mean) + "</div>" + minibar(it) +
      '<div class="kana cans-ex">' + exHtml(it) + '</div><small>' + L(it.ex.tr) + "</small>";
  }

  function renderCard(box, it, done) {
    var ty = TYPES[Math.floor(Math.random() * TYPES.length)], h;
    var q = function (s) { return box.querySelector(s); };
    if (ty === "see") {
      h = '<div class="ctag">' + t("seeWordQ") + '</div><div class="cbig kana' + (it.nai ? " nai" : "") + '">' + it.ja + "</div>" +
        '<div class="cans" hidden>' + answerBlock(it) + "</div>" +
        '<div class="btnrow cbtns"><button class="btn primary cflip">' + t("flip") + "</button></div>";
    } else {
      var opts = shuffle([it].concat(others(it, 3)));
      if (ty === "hear") {
        var voice = ctx.canHear(said(it));
        h = '<div class="ctag">' + t(voice ? "hearMeanQ" : "readMeanQ") + "</div>" +
          (voice ? '<button class="say big csay" aria-label="' + t("replay") + '">' + SPK + "</button>" : '<div class="cbig kana">' + it.ja + "</div>") +
          '<div class="opts copts">' + opts.map(function (o) { return '<button class="opt" data-id="' + o.id + '">' + L(o.mean) + "</button>"; }).join("") + "</div>";
      } else {
        h = '<div class="ctag">' + t("pickJaQ") + '</div><div class="cmean">' + L(it.mean) + "</div>" +
          '<div class="opts copts">' + opts.map(function (o) { return '<button class="opt kana" data-id="' + o.id + '">' + o.ja + "</button>"; }).join("") + "</div>";
      }
    }
    box.innerHTML = h + '<div class="cnext"></div>';

    if (ty === "see") {
      q(".cflip").onclick = function () {
        q(".cans").hidden = false;
        ctx.say(said(it));
        q(".cbtns").innerHTML = '<button class="btn bad" data-g="0">' + t("gotWrongMean") + '</button><button class="btn good" data-g="1">' + t("gotRightMean") + "</button>";
        q(".cbtns").onclick = function (e) {
          var b = e.target.closest("[data-g]");
          if (!b) return;
          var g = b.dataset.g === "1";
          if (g) ctx.sfx.ok(); else ctx.sfx.bad();
          done(g, 250);
        };
      };
      return;
    }
    if (q(".csay")) { q(".csay").onclick = function () { ctx.say(said(it)); }; ctx.say(said(it)); }
    var answered = false;
    q(".copts").onclick = function (e) {
      var b = e.target.closest(".opt");
      if (!b || answered) return;
      answered = true;
      var right = b.dataset.id === it.id;
      q(".copts").querySelectorAll(".opt").forEach(function (x) { if (x.dataset.id === it.id) x.classList.add("ok"); });
      ctx.say(said(it));
      if (right) {
        ctx.sfx.ok();
        q(".cnext").innerHTML = '<span class="kana">' + it.ja + "</span><span>" + L(it.mean) + "</span>";
        done(true, 1200);
      } else {
        b.classList.add("no");
        ctx.sfx.bad();
        q(".cnext").innerHTML = '<div class="cans"><span class="kana cans-w">' + it.ja + "</span>" + answerBlock(it) + "</div>";
        done(false);
      }
    };
  }

  /* ---------- 小遊戲 ---------- */
  function later(fn, ms) { G.timers.push(setTimeout(fn, ms)); }
  function every(fn, ms) { G.timers.push(setInterval(fn, ms)); }
  function gStop() {
    G.timers.forEach(function (x) { clearTimeout(x); clearInterval(x); });
    G.timers = [];
    G.id = null;
    if (el && $("#gOpts")) $("#gOpts").onclick = null;
  }
  function pane(p) { $("#gMenu").hidden = p !== "menu"; $("#gPlay").hidden = p !== "play"; $("#gResult").hidden = p !== "result"; }
  function msg(h) { $("#gMsg").innerHTML = h; }
  function flash(node, cls, ms) {
    if (!node) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    setTimeout(function () { node.classList.remove(cls); }, ms || 500);
  }
  function plain(s) { return s.replace(/<\/?b>/g, ""); }

  function renderMenu() {
    var b = prog.best;
    $("#bOrder").textContent = b.order != null ? t("bestTime", { t: b.order.toFixed(1) }) : t("never");
    $("#bCompare").textContent = b.compare ? t("bestScore", { s: b.compare }) : t("never");
    $("#bNai").textContent = b.nai ? t("bestScore", { s: b.nai }) : t("never");
    pane("menu");
  }

  function setupPlay(opts) {
    pane("play");
    $("#tbar").hidden = !opts.timer;
    $("#tfill").style.width = "100%";
    $("#track").hidden = !opts.track;
    $("#gOpts").className = "opts" + (opts.oneCol ? " one" : "");
    $("#gOpts").innerHTML = "";
    msg("");
  }

  // 1. 排排看：從最常到最少依序點 4 個字，5 回，比速度
  function startOrder() {
    gStop(); G.id = "order"; setupPlay({ track: true });
    var st = { round: 0, miss: 0, pen: 0, wrong: {}, t0: performance.now(), order: [], next: 0 };
    $("#gPrompt").innerHTML = '<div class="ptxt">' + t("orderPrompt", { s: ORDER_PENALTY }) + "</div>";
    function sec() { return (performance.now() - st.t0) / 1000 + st.pen; }
    function hud() { $("#hudA").innerHTML = t("timeVal", { t: sec().toFixed(1) }); $("#hudB").innerHTML = t("roundN", { b: Math.min(st.round + 1, 5) }); }
    function round() {
      var set = pickFar(4, pool()) || pickFar(3, pool());
      st.order = set.slice().sort(function (a, b) { return b.pos - a.pos; });
      st.next = 0;
      $("#gOpts").innerHTML = shuffle(set).map(function (it) { return '<button class="opt kana" data-id="' + it.id + '">' + it.ja + "</button>"; }).join("");
      $("#track").innerHTML = '<div class="tr-line"></div><span class="tr-end l">0%</span><span class="tr-end r">100%</span>';
      msg("");
      hud();
    }
    $("#gOpts").onclick = function (e) {
      var b = e.target.closest(".opt");
      if (!b || b.disabled || G.id !== "order") return;
      var it = byId(b.dataset.id);
      if (it === st.order[st.next]) {
        b.disabled = true;
        b.classList.add("ok");
        b.insertAdjacentHTML("afterbegin", '<span class="rank">' + (st.next + 1) + "</span>");
        $("#track").insertAdjacentHTML("beforeend", '<span class="mk ' + (st.next % 2 ? "dn" : "up") + '" style="left:' + it.pos + '%"><i></i><b class="kana">' + said(it) + "</b></span>");
        ctx.say(said(it));
        st.next++;
        msg("");
        if (st.next === st.order.length) {
          ctx.sfx.ok();
          st.round++;
          if (st.round >= 5) { later(function () { endOrder(sec(), st); }, 500); return; }
          later(round, 800);
        }
      } else {
        st.miss++; st.pen += ORDER_PENALTY; st.wrong[it.id] = 1;
        bumpMistake(it);
        ctx.sfx.bad();
        flash(b, "shake");
        msg("<span>" + t("orderWrong", { w: kana(it.ja), s: ORDER_PENALTY }) + "</span>");
      }
      hud();
    };
    round(); every(hud, 100);
  }
  function endOrder(sec, st) {
    sec = Math.round(sec * 10) / 10;
    var prev = prog.best.order, rec = prev == null || sec < prev;
    if (rec) { prog.best.order = sec; save(); }
    showResult({
      title: t("s1name"), main: plain(t("timeVal", { t: sec.toFixed(1) })),
      sub: rec ? t("newRec") : t("bestTime", { t: prev.toFixed(1) }), rec: rec, perfect: st.miss === 0,
      note: st.miss ? t("missN", { m: st.miss, p: st.pen }) : t("noMiss"),
      list: Object.keys(st.wrong).map(byId), again: startOrder
    });
  }

  // 2. 哪個比較常：60 秒，兩個字選比較常的，連續答對加分
  function startCompare() {
    gStop(); G.id = "compare"; setupPlay({});
    var st = { score: 0, combo: 0, maxc: 0, right: 0, miss: {}, end: performance.now() + 60000, lock: true, pair: null };
    $("#gPrompt").innerHTML = '<div class="ptxt">' + t("comparePrompt") + "</div>";
    function hud() {
      var left = Math.max(0, Math.ceil((st.end - performance.now()) / 1000));
      $("#hudA").innerHTML = t("left", { b: left });
      $("#hudB").innerHTML = t("score", { b: st.score }) + (st.combo > 1 ? "・" + t("combo", { c: st.combo }) : "");
      if (left <= 0) endCompare(st);
    }
    function next() {
      var p = pool(), a = rand(p), b = rand(p.filter(function (x) { return far(x, a); }));
      st.pair = [a, b];
      $("#gOpts").innerHTML = [a, b].map(function (it) { return '<button class="opt kana big" data-id="' + it.id + '">' + it.ja + "</button>"; }).join("");
      msg("");
      st.lock = false;
    }
    $("#gOpts").onclick = function (e) {
      var b = e.target.closest(".opt");
      if (!b || st.lock || G.id !== "compare") return;
      st.lock = true;
      var hi = st.pair[0].pos > st.pair[1].pos ? st.pair[0] : st.pair[1];
      var lo = hi === st.pair[0] ? st.pair[1] : st.pair[0];
      if (b.dataset.id === hi.id) {
        st.combo++; st.maxc = Math.max(st.maxc, st.combo); st.right++;
        st.score += 10 + Math.min(st.combo - 1, 10) * 2;
        ctx.sfx.ok(); b.classList.add("ok");
        later(next, 380);
      } else {
        st.combo = 0;
        ctx.sfx.bad(); b.classList.add("no");
        $("#gOpts").querySelector('[data-id="' + hi.id + '"]').classList.add("ok");
        st.miss[hi.id] = 1; st.miss[lo.id] = 1;
        bumpMistake(hi); bumpMistake(lo);
        msg("<span>" + t("compareWrong", { a: kana(hi.ja), pa: hi.pos, b: kana(lo.ja), pb: lo.pos }) + "</span>");
        later(next, 1700);
      }
      hud();
    };
    hud(); every(hud, 200); next();
  }
  function endCompare(st) {
    if (G.id !== "compare") return;
    var prev = prog.best.compare, rec = st.score > prev;
    if (rec) { prog.best.compare = st.score; save(); }
    showResult({
      title: t("s2name"), main: plain(t("score", { b: st.score })),
      sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec, perfect: Object.keys(st.miss).length === 0 && st.right >= 10,
      note: t("listenNote", { r: st.right, c: st.maxc }), list: Object.keys(st.miss).map(byId), again: startCompare
    });
  }

  // 3. 〜ない 陷阱：10 題，選出意思對的句子（要接否定的字出得比較多）
  function startNai() {
    gStop(); G.id = "nai"; setupPlay({ timer: true, oneCol: true });
    /* 出題：字夠多就不重複（要接否定的字排前面的機會大一點）；不夠才重來一輪，也不連續出同一個 */
    var LIM = 10000, qs = [], bag = [];
    while (qs.length < 10) {
      if (!bag.length) {
        var left = pool().map(function (x) { return { it: x, w: x.nai ? 3 : 1 }; });
        while (left.length) { var pk = pickW(left); bag.push(pk.it); left.splice(left.indexOf(pk), 1); }
        if (bag[0] === qs[qs.length - 1] && bag.length > 1) bag.push(bag.shift());
      }
      qs.push(bag.shift());
    }
    var st = { qs: qs, i: 0, score: 0, right: 0, miss: {}, qEnd: 0, lock: true };
    function hud() { $("#hudA").innerHTML = t("qNum", { b: Math.min(st.i + 1, 10) }); $("#hudB").innerHTML = t("score", { b: st.score }); }
    function ask() {
      var it = st.qs[st.i];
      $("#gPrompt").innerHTML = '<div class="ptxt">' + t("naiPrompt", { m: L(it.ex.tr) }) + "</div>";
      $("#gOpts").innerHTML = shuffle([it.ex.ja, it.ex.alt]).map(function (s) { return '<button class="opt kana sent" data-s="' + s + '">' + s + "</button>"; }).join("");
      msg("");
      st.qEnd = performance.now() + LIM;
      st.lock = false;
      hud();
    }
    function answer(pick, btn) {
      if (st.lock) return;
      st.lock = true;
      var it = st.qs[st.i], left = Math.max(0, st.qEnd - performance.now());
      $("#gOpts").querySelectorAll(".opt").forEach(function (b) { if (b.dataset.s === it.ex.ja) b.classList.add("ok"); });
      ctx.say(it.ex.ja);
      if (pick === it.ex.ja) {
        st.right++;
        st.score += 100 + Math.round(50 * left / LIM);
        ctx.sfx.ok(); hud();
        later(next, 1200);
      } else {
        if (btn) btn.classList.add("no");
        ctx.sfx.bad();
        st.miss[it.id] = 1;
        bumpMistake(it);
        hud();
        var why = it.nai ? L(D.text.naiNeed).replace("{w}", it.ja) : L(D.text.posNeed);
        msg("<span>" + (pick ? "" : t("timeUp")) + ctx.rich(why) + '</span><button class="btn primary" id="gNext">' + t("nextQ") + "</button>");
        $("#gNext").onclick = next;
      }
    }
    function next() { st.i++; if (st.i >= 10) { endNai(st); return; } ask(); }
    $("#gOpts").onclick = function (e) { var b = e.target.closest(".opt"); if (b && G.id === "nai") answer(b.dataset.s, b); };
    every(function () {
      if (st.lock) return;
      var r = Math.max(0, (st.qEnd - performance.now()) / LIM);
      $("#tfill").style.width = (r * 100) + "%";
      if (r <= 0) answer(null, null);
    }, 50);
    ask();
  }
  function endNai(st) {
    var prev = prog.best.nai, rec = st.score > prev;
    if (rec) { prog.best.nai = st.score; save(); }
    showResult({
      title: t("s3name"), main: plain(t("score", { b: st.score })),
      sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec, perfect: st.right === 10,
      note: t("pickNote", { r: st.right }), list: Object.keys(st.miss).map(byId), again: startNai
    });
  }

  function showResult(r) {
    gStop();
    pane("result");
    var list = r.list.length
      ? '<div class="mist"><div class="mh">' + t("missHead") + "・" + t("tapToHear") + "</div>" +
        r.list.map(function (it) { return '<button class="mrow" data-id="' + it.id + '"><span>' + kana(it.ja) + "　" + L(it.mean) + "</span><small>" + t("levelTag", { l: it.level, p: it.pos }) + "</small></button>"; }).join("") + "</div>"
      : "";
    $("#gResult").innerHTML = '<div class="result">' + (r.perfect ? window.VocabDeck.HANAMARU : "") +
      '<div class="rtitle">' + r.title + '</div><div class="rmain">' + r.main + '</div><div class="rsub' + (r.rec ? " rec" : "") + '">' + r.sub + '</div><div class="rnote">' + r.note + "</div>" + list +
      '<div class="btnrow"><button class="btn" id="rMenu">' + t("menu") + '</button><button class="btn primary" id="rAgain">' + t("again") + "</button></div></div>";
    $("#gResult").onclick = function (e) { var m = e.target.closest(".mrow"); if (m) ctx.say(said(byId(m.dataset.id))); };
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
    $("#lvBtn").onclick = function () {
      view.only1 = !view.only1;
      renderRuler(); renderDetail();
    };
    $("#ruler").onclick = function (e) {
      var b = e.target.closest(".wchip");
      if (!b) return;
      view.sel = b.dataset.id;
      el.querySelectorAll(".wchip").forEach(function (x) { x.classList.toggle("sel", x === b); });
      renderDetail();
      ctx.say(said(byId(view.sel)));
      /* 手機上說明卡在直尺下面，沒有整張露出來就捲過去（已經看得到就不動） */
      if ($("#wd").getBoundingClientRect().bottom > window.innerHeight) {
        var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        $("#wd").scrollIntoView({ block: "nearest", behavior: calm ? "auto" : "smooth" });
      }
    };
    $("#gMenu").onclick = function (e) {
      var b = e.target.closest("[data-game]");
      if (b) ({ order: startOrder, compare: startCompare, nai: startNai })[b.dataset.game]();
    };
    $("#gQuit").onclick = function () { gStop(); renderMenu(); };
  }

  /* ---------- 模板介面 ---------- */
  function mount(root, theme, c, meta) {
    unmount();
    el = root; D = theme; ctx = c; store = c.store(meta.id);
    prog = store.get() || {};
    delete prog.weights;   // 舊版的卡片權重，改用 deck.js 的熟悉度後不再用
    prog.best = Object.assign({ order: null, compare: 0, nai: 0 }, prog.best);
    ITEMS = D.items;

    el.innerHTML = layout();
    deck = window.VocabDeck.create({
      root: $("#deckRoot"), ctx: ctx, prog: prog, save: save,
      pool: pool,
      key: function (it) { return it.id; },
      label: function (it) { return kana(it.ja) + "　" + L(it.mean); },
      sayOf: said,
      render: renderCard
    });
    bind();
    renderRuler();
    renderDetail();
    setTab(view.tab);
  }

  function unmount() {
    gStop();
    if (deck) deck.stop();
  }

  window.VocabTemplates = window.VocabTemplates || {};
  window.VocabTemplates.scale = { mount: mount, unmount: unmount };
})();
