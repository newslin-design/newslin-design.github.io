/* ============================================================
   calendar.js ─ 月曆模板（日期專用）
   ------------------------------------------------------------
   總覽圖（月曆＋特別讀法紅圈）→ 卡片（三種題型）→ 小遊戲三種。
   內容（讀法、常見念錯、說明文字）都在 data/themes/<id>.js，這裡只管畫面和玩法。
   卡片的出題、熟悉度、一回 10 題的結算在 js/deck.js；這裡只負責每一題長什麼樣子。
   給中文母語者：題目考讀音和聽力，不考意思（看到「四日」意思一看就懂，難的是念法）。
   ============================================================ */
(function () {
  "use strict";

  var TYPES = ["see", "hear", "read"];
  var PREFIX = ["さんじゅう", "にじゅう", "じゅう"];   // 月曆格子裡把長讀法拆兩行用
  var SPK = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';

  var view = { tab: "map", y: 0, m: 0, hide: false };   // 換語言重畫時保留在哪一頁、哪個月
  var el, D, ctx, store, prog, deck, ITEMS, SP, MSP, PAIR_D, PAIR_M;
  var TY, TM, TD, TW;
  var G = { id: null, timers: [], onCell: null };

  function $(s) { return el.querySelector(s); }
  function t(k, v) { return ctx.t(k, v); }
  function kana(s) { return '<span class="kana">' + s + "</span>"; }
  function save() { store.set(prog); }

  /* ---------- 讀法與解說 ---------- */
  function dayRead(n) { return D.days[n]; }
  function dayParts(n) {
    var r = dayRead(n);
    if (n <= 10 || n === 20) return [r];
    for (var i = 0; i < PREFIX.length; i++) if (r.indexOf(PREFIX[i]) === 0) return [PREFIX[i], r.slice(PREFIX[i].length)];
    return [r];
  }
  function isTrap(n) { return !SP.has(n) && !!D.wrong[n]; }   // 規則讀法、但常被類推念錯的日子
  function hint(key, n) { return ctx.rich(ctx.loc(D.text.hints[key]).replace("{r}", dayRead(n))); }
  function hintFor(n, picked) {
    if (n <= 10) return hint("h1_10", n);
    if (n === 14 || n === 24) return hint("h4", n);
    if (n === 20) return hint("h20", n);
    if (picked && (D.wrong[n] || []).indexOf(picked) >= 0) return hint("hOver", n);
    if (n % 10 === 9) return hint("h9", n);
    if (n % 10 === 7) return hint("h7", n);
    return hint("hRule", n);
  }
  function monthHint(m) { return ctx.rich(ctx.loc(D.text.monthHints[m] || D.text.monthHints.rule)); }
  function pairMap(pairs) {
    var map = {};
    pairs.forEach(function (p) {
      (map[p[0]] = map[p[0]] || []).push(p[1]);
      (map[p[1]] = map[p[1]] || []).push(p[0]);
    });
    return map;
  }
  var daysIn = function (y, m) { return new Date(y, m, 0).getDate(); };

  /* ---------- 工具 ---------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function pickW(pool) { var r = Math.random() * pool.reduce(function (s, x) { return s + x.w; }, 0); for (var i = 0; i < pool.length; i++) { if ((r -= pool[i].w) < 0) return pool[i]; } return pool[pool.length - 1]; }
  function bumpMistake(n) { deck.bump(ITEMS[n - 1]); }

  /* ---------- 版面 ---------- */
  function layout() {
    return '' +
      '<nav class="tabs" role="tablist">' +
        '<button role="tab" data-tab="map">' + t("tabMap") + '</button>' +
        '<button role="tab" data-tab="cards">' + t("tabCards") + '</button>' +
        '<button role="tab" data-tab="games">' + t("tabGames") + '</button>' +
      '</nav>' +
      '<section data-v="map">' +
        '<div class="monthbar">' +
          '<button class="nav" id="prevM" aria-label="' + t("prevM") + '">‹</button>' +
          '<button class="mtitle" id="mTitle" aria-label="' + t("sayMonth") + '"><span class="myear" id="mYear"></span><span class="mnum" id="mNum"></span><span class="mread" id="mRead"></span></button>' +
          '<button class="nav" id="nextM" aria-label="' + t("nextM") + '">›</button>' +
        '</div>' +
        '<div class="readout" id="readout" aria-live="polite"></div>' +
        '<div class="cal" id="mapCal"></div>' +
        '<div class="maptools">' +
          '<label class="switch"><input type="checkbox" id="hideRead"' + (view.hide ? " checked" : "") + '><span>' + t("hideRead") + '</span></label>' +
          '<span class="legends"><span class="legend"><i></i>' + t("legend") + '</span><span class="legend"><i class="today"></i>' + t("legendToday") + '</span></span>' +
        '</div>' +
        '<div class="rules"><h2>' + ctx.loc(D.text.rulesTitle) + '</h2><ol>' +
          D.text.rules.map(function (r) { return "<li>" + ctx.rich(ctx.loc(r)) + "</li>"; }).join("") +
        '</ol><p class="tip">' + ctx.rich(ctx.loc(D.text.tip)) + '</p></div>' +
      '</section>' +
      '<section data-v="cards" hidden><div id="deckRoot"></div></section>' +
      '<section data-v="games" hidden>' +
        '<div id="gMenu" class="gmenu">' +
          '<button class="gtile" data-game="find"><span class="ico">探</span><span><b>' + t("g1name") + '</b><small>' + t("g1desc") + '</small></span><span class="best" id="bFind"></span></button>' +
          '<button class="gtile" data-game="listen"><span class="ico">聴</span><span><b>' + t("g2name") + '</b><small>' + t("g2desc") + '</small></span><span class="best" id="bListen"></span></button>' +
          '<button class="gtile" data-game="pick"><span class="ico">読</span><span><b>' + t("g3name") + '</b><small>' + t("g3desc") + '</small></span><span class="best" id="bPick"></span></button>' +
          '<p class="gnote">' + t("gnote") + '</p>' +
        '</div>' +
        '<div id="gPlay" hidden>' +
          '<div class="hud"><span id="hudA"></span><span id="hudB"></span><button class="quit" id="gQuit">' + t("quit") + '</button></div>' +
          '<div class="tbar" id="tbar" hidden><i id="tfill"></i></div>' +
          '<div class="prompt" id="gPrompt"></div>' +
          '<div class="cal game" id="gCal"></div>' +
          '<div class="opts" id="gOpts"></div>' +
          '<div class="gmsg" id="gMsg"></div>' +
        '</div>' +
        '<div id="gResult" hidden></div>' +
      '</section>';
  }

  /* ---------- 總覽圖 ---------- */
  function renderCal(box, y, m, mode) {
    var first = new Date(y, m - 1, 1).getDay(), len = daysIn(y, m), h = "", i, d;
    for (i = 0; i < 7; i++) {
      var wc = "wd" + (i === 0 ? " sun" : i === 6 ? " sat" : "");
      h += mode === "map"
        ? '<button class="' + wc + '" data-wd="' + i + '" aria-label="' + D.weekdayKanji[i] + '曜日">' + D.weekdayKanji[i] + "</button>"
        : '<div class="' + wc + '">' + D.weekdayKanji[i] + "</div>";
    }
    for (i = 0; i < first; i++) h += '<div class="c blank" aria-hidden="true"></div>';
    for (d = 1; d <= len; d++) {
      var dow = (first + d - 1) % 7, cls = ["c"], r = "";
      if (dow === 0) cls.push("sun");
      if (dow === 6) cls.push("sat");
      if (mode === "map") {
        if (SP.has(d)) cls.push("sp");
        if (y === TY && m === TM && d === TD) cls.push("today");
        var p = dayParts(d);
        r = '<span class="r' + (p.some(function (s) { return s.length >= 5; }) ? " tight" : "") + '">' + p.join("<br>") + "</span>";
      }
      h += '<button class="' + cls.join(" ") + '" data-n="' + d + '" aria-label="' + m + "月" + d + '日"><span class="n">' + d + "</span>" + r + "</button>";
    }
    box.innerHTML = h;
  }

  /** 月曆上方的讀法框。quiet：只顯示不念（剛打開頁面時還不能出聲） */
  function setReadout(label, k, sp, sub, sayWhat, quiet) {
    $("#readout").innerHTML = '<div class="ro-main"><span class="ro-lab">' + label + '</span><span class="kana ro-k' + (sp ? " sp" : "") + '">' + k + "</span>" + (sub ? '<span class="ro-sub">' + sub + "</span>" : "") + '</div><button class="say" id="roSay" aria-label="' + t("replay") + '">' + SPK + "</button>";
    $("#roSay").onclick = function () { ctx.say(sayWhat); };
    if (!quiet) ctx.say(sayWhat);
  }

  /** 讀法框預設顯示今天；看的不是這個月就顯示提示 */
  function showToday() {
    if (view.y !== TY || view.m !== TM) { $("#readout").textContent = t("readoutHint"); return; }
    setReadout(t("today") + " " + TM + "月" + TD + "日（" + D.weekdayKanji[TW] + "）", dayRead(TD), SP.has(TD),
      D.months[TM] + " " + dayRead(TD) + "・" + D.weekdays[TW], [D.months[TM], dayRead(TD), D.weekdays[TW]], true);
  }

  function renderMap() {
    $("#mYear").textContent = view.y + "年";
    $("#mNum").innerHTML = view.m + "<small>月</small>";
    $("#mRead").textContent = D.months[view.m];
    $("#mTitle").classList.toggle("sp", MSP.has(view.m));
    renderCal($("#mapCal"), view.y, view.m, "map");
    $("#mapCal").classList.toggle("hide", view.hide);
    showToday();
  }

  /* ---------- 卡片：每一題長什麼樣子（出題和記分在 deck.js） ---------- */
  function labelOpts(it) {
    var n = it.n, max = it.kind === "day" ? 31 : 12, out = [n];
    var pri = (it.kind === "day" ? PAIR_D[n] : PAIR_M[n]) || [];
    var fill = shuffle(it.kind === "day" ? [n - 1, n + 1, n + 10, n - 10, n + 2] : [n - 1, n + 1, n + 3, n - 3]);
    pri.concat(fill).forEach(function (x) { if (out.length < 4 && x >= 1 && x <= max && out.indexOf(x) < 0) out.push(x); });
    return shuffle(out);
  }

  function renderCard(box, it, done) {
    var ty = TYPES[Math.floor(Math.random() * TYPES.length)];
    var unit = it.kind === "day" ? "日" : "月";
    var hn = it.kind === "day" ? hintFor(it.n) : monthHint(it.n);
    var q = function (s) { return box.querySelector(s); };
    var h;
    if (ty === "see") {
      h = '<div class="ctag">' + t(it.kind === "day" ? "seeDay" : "seeMonth") + '</div><div class="cbig">' + it.label + "</div>" +
        '<div class="cans" hidden><span class="kana' + (it.sp ? " sp" : "") + '">' + it.reading + "</span><small>" + hn + "</small></div>" +
        '<div class="btnrow cbtns"><button class="btn primary cflip">' + t("flip") + "</button></div>";
    } else {
      var voice = ty === "hear" && ctx.canHear(it.reading);
      h = '<div class="ctag">' + t(voice ? "hearQ" : "readQ") + "</div>" +
        (voice ? '<button class="say big csay" aria-label="' + t("replay") + '">' + SPK + "</button>" : '<div class="cbig kana">' + it.reading + "</div>") +
        '<div class="opts copts">' + labelOpts(it).map(function (o) { return '<button class="opt" data-v="' + o + '">' + o + unit + "</button>"; }).join("") + "</div>";
    }
    box.innerHTML = h + '<div class="cnext"></div>';

    if (ty === "see") {
      q(".cflip").onclick = function () {
        q(".cans").hidden = false;
        ctx.say(it.reading);
        q(".cbtns").innerHTML = '<button class="btn bad" data-g="0">' + t("gotWrong") + '</button><button class="btn good" data-g="1">' + t("gotRight") + "</button>";
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
    if (q(".csay")) { q(".csay").onclick = function () { ctx.say(it.reading); }; ctx.say(it.reading); }
    var answered = false;
    q(".copts").onclick = function (e) {
      var b = e.target.closest(".opt");
      if (!b || answered) return;
      answered = true;
      var right = +b.dataset.v === it.n;
      q(".copts").querySelectorAll(".opt").forEach(function (x) { if (+x.dataset.v === it.n) x.classList.add("ok"); });
      ctx.say(it.reading);
      if (right) {
        ctx.sfx.ok();
        q(".cnext").innerHTML = '<span class="kana">' + it.label + "　" + it.reading + "</span>";
        done(true, 1100);
      } else {
        b.classList.add("no");
        ctx.sfx.bad();
        q(".cnext").innerHTML = '<span class="kana">' + it.label + "　" + it.reading + "</span><span>" + hn + "</span>";
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
    G.onCell = null;
    if (el && $("#gOpts")) $("#gOpts").onclick = null;
  }
  function pane(p) { $("#gMenu").hidden = p !== "menu"; $("#gPlay").hidden = p !== "play"; $("#gResult").hidden = p !== "result"; }
  function msg(h) { $("#gMsg").innerHTML = h; }
  function flash(cell, cls, ms) {
    if (!cell) return;
    cell.classList.remove(cls);
    void cell.offsetWidth;
    cell.classList.add(cls);
    setTimeout(function () { cell.classList.remove(cls); }, ms || 500);
  }
  function cellOf(n) { return $("#gCal").querySelector('[data-n="' + n + '"]'); }
  function plain(s) { return s.replace(/<\/?b>/g, ""); }

  function renderMenu() {
    var b = prog.best;
    $("#bFind").textContent = b.find != null ? t("bestTime", { t: b.find.toFixed(1) }) : t("never");
    $("#bListen").textContent = b.listen ? t("bestScore", { s: b.listen }) : t("never");
    $("#bPick").textContent = b.pick ? t("bestScore", { s: b.pick }) : t("never");
    pane("menu");
  }

  function setupPlay(withTimer) {
    pane("play");
    $("#tbar").hidden = !withTimer;
    $("#tfill").style.width = "100%";
    $("#gOpts").innerHTML = "";
    msg("");
    renderCal($("#gCal"), TY, TM, "game");
  }

  // 1. 找出特別日：比速度，點錯加 2 秒
  function startFind() {
    gStop(); G.id = "find"; setupPlay(false);
    var st = { found: new Set(), miss: 0, pen: 0, wrong: new Set(), t0: performance.now() };
    $("#gPrompt").innerHTML = '<div class="ptxt">' + t("findPrompt") + "</div>";
    function sec() { return (performance.now() - st.t0) / 1000 + st.pen; }
    function hud() { $("#hudA").innerHTML = t("timeVal", { t: sec().toFixed(1) }); $("#hudB").innerHTML = t("found", { b: st.found.size }); }
    hud(); every(hud, 100);
    G.onCell = function (n, cell) {
      if (SP.has(n)) {
        if (st.found.has(n)) return;
        st.found.add(n);
        cell.classList.add("hit");
        ctx.sfx.ok();
        ctx.say(dayRead(n));
        msg(""); hud();
        if (st.found.size === SP.size) endFind(sec(), st);
      } else {
        st.miss++; st.pen += 2; st.wrong.add(n);
        ctx.sfx.bad();
        flash(cell, "bad");
        msg("<span>" + t("findWrong", { n: n, r: kana(dayRead(n)) }) + "</span>");
        hud();
      }
    };
  }
  function endFind(sec, st) {
    sec = Math.round(sec * 10) / 10;
    var prev = prog.best.find, rec = prev == null || sec < prev;
    if (rec) { prog.best.find = sec; save(); }
    showResult({
      title: t("g1name"), main: plain(t("timeVal", { t: sec.toFixed(1) })),
      sub: rec ? t("newRec") : t("bestTime", { t: prev.toFixed(1) }), rec: rec, perfect: st.miss === 0,
      note: st.miss ? t("missN", { m: st.miss, p: st.pen }) : t("noMiss"),
      head: t("findHead"),
      list: Array.from(st.wrong).sort(function (a, b) { return a - b; }).map(function (n) { return { n: n, note: hintFor(n) }; }),
      again: startFind
    });
  }

  // 2. 聽音點日期：60 秒，連續答對加分
  function startListen() {
    gStop(); G.id = "listen"; setupPlay(false);
    var len = daysIn(TY, TM);
    var st = { score: 0, combo: 0, maxc: 0, right: 0, q: 0, miss: new Map(), end: performance.now() + 60000, lock: true };
    $("#gPrompt").innerHTML = '<button class="say big" id="gSay" aria-label="' + t("replay") + '">' + SPK + '</button><div class="ptxt" id="gFallback">' + t("listenPrompt") + "</div>";
    $("#gSay").onclick = function () { ctx.say(dayRead(st.q)); };
    function hud() {
      var left = Math.max(0, Math.ceil((st.end - performance.now()) / 1000));
      $("#hudA").innerHTML = t("left", { b: left });
      $("#hudB").innerHTML = t("score", { b: st.score }) + (st.combo > 1 ? "・" + t("combo", { c: st.combo }) : "");
      if (left <= 0) endListen(st);
    }
    function next() {
      var pool = [];
      for (var d = 1; d <= len; d++) if (d !== st.q) pool.push({ n: d, w: SP.has(d) ? 3 : (isTrap(d) ? 1.5 : 1) });
      st.q = pickW(pool).n;
      st.lock = false;
      if (ctx.canHear(dayRead(st.q))) ctx.say(dayRead(st.q));
      else $("#gFallback").innerHTML = '<span class="pkana">' + dayRead(st.q) + "</span><small>" + t("noVoiceShow") + "</small>";
    }
    G.onCell = function (n, cell) {
      if (st.lock) return;
      st.lock = true;
      if (n === st.q) {
        st.combo++; st.maxc = Math.max(st.maxc, st.combo); st.right++;
        st.score += 10 + Math.min(st.combo - 1, 10) * 2;
        ctx.sfx.ok(); flash(cell, "ok", 400); msg("");
        later(next, 380);
      } else {
        st.combo = 0;
        ctx.sfx.bad(); flash(cell, "bad"); flash(cellOf(st.q), "reveal", 1000);
        st.miss.set(st.q, 1); bumpMistake(st.q);
        msg("<span>" + t("itWas", { n: st.q, r: kana(dayRead(st.q)) }) + "</span>");
        ctx.say(dayRead(st.q));
        later(next, 1300);
      }
      hud();
    };
    hud(); every(hud, 200); next();
  }
  function endListen(st) {
    if (G.id !== "listen") return;
    var prev = prog.best.listen, rec = st.score > prev;
    if (rec) { prog.best.listen = st.score; save(); }
    showResult({
      title: t("g2name"), main: plain(t("score", { b: st.score })),
      sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec, perfect: st.miss.size === 0 && st.right >= 10,
      note: t("listenNote", { r: st.right, c: st.maxc }), head: t("listenHead"),
      list: Array.from(st.miss.keys()).sort(function (a, b) { return a - b; }).map(function (n) { return { n: n, note: hintFor(n) }; }),
      again: startListen
    });
  }

  // 3. 選出讀法：10 題、每題 8 秒，錯的選項是常見念錯
  function readingOpts(n) {
    var right = dayRead(n), out = [right];
    var pri = (D.wrong[n] || []).concat((PAIR_D[n] || []).map(dayRead));
    var fill = shuffle([n - 1, n + 1, n + 10, n - 10, n + 2].filter(function (x) { return x >= 1 && x <= 31; })).map(dayRead);
    pri.concat(fill).forEach(function (r) { if (out.length < 4 && out.indexOf(r) < 0) out.push(r); });
    return shuffle(out);
  }
  function startPick() {
    gStop(); G.id = "pick"; setupPlay(true);
    var len = daysIn(TY, TM), qs = [], LIM = 8000, d;
    while (qs.length < 10) {
      var pool = [];
      for (d = 1; d <= len; d++) if (qs.indexOf(d) < 0) pool.push({ n: d, w: SP.has(d) ? 3 : (isTrap(d) ? 2 : 1) });
      qs.push(pickW(pool).n);
    }
    var st = { qs: qs, i: 0, score: 0, right: 0, miss: [], qEnd: 0, lock: true };
    function hud() { $("#hudA").innerHTML = t("qNum", { b: Math.min(st.i + 1, 10) }); $("#hudB").innerHTML = t("score", { b: st.score }); }
    function ask() {
      var n = st.qs[st.i];
      $("#gCal").querySelectorAll(".target").forEach(function (c) { c.classList.remove("target"); });
      cellOf(n).classList.add("target");
      $("#gPrompt").innerHTML = '<div class="ptxt">' + t("pickPrompt", { d: '<span class="pbig">' + n + "日</span>" }) + "</div>";
      $("#gOpts").innerHTML = readingOpts(n).map(function (o) { return '<button class="opt kana" data-r="' + o + '">' + o + "</button>"; }).join("");
      msg("");
      st.qEnd = performance.now() + LIM;
      st.lock = false;
      hud();
    }
    function answer(pick, btn) {
      if (st.lock) return;
      st.lock = true;
      var n = st.qs[st.i], right = dayRead(n), left = Math.max(0, st.qEnd - performance.now());
      $("#gOpts").querySelectorAll(".opt").forEach(function (b) { if (b.dataset.r === right) b.classList.add("ok"); });
      ctx.say(right);
      if (pick === right) {
        st.right++;
        st.score += 100 + Math.round(50 * left / LIM);
        ctx.sfx.ok(); hud();
        later(next, 850);
      } else {
        if (btn) btn.classList.add("no");
        ctx.sfx.bad();
        st.miss.push({ n: n, pick: pick });
        bumpMistake(n);
        hud();
        msg("<span>" + (pick ? t("notX", { p: kana(pick) }) : t("timeUp")) + hintFor(n, pick) + '</span><button class="btn primary" id="gNext">' + t("nextQ") + "</button>");
        $("#gNext").onclick = next;
      }
    }
    function next() { st.i++; if (st.i >= 10) { endPick(st); return; } ask(); }
    $("#gOpts").onclick = function (e) { var b = e.target.closest(".opt"); if (b) answer(b.dataset.r, b); };
    every(function () {
      if (st.lock) return;
      var r = Math.max(0, (st.qEnd - performance.now()) / LIM);
      $("#tfill").style.width = (r * 100) + "%";
      if (r <= 0) answer(null, null);
    }, 50);
    ask();
  }
  function endPick(st) {
    var prev = prog.best.pick, rec = st.score > prev;
    if (rec) { prog.best.pick = st.score; save(); }
    showResult({
      title: t("g3name"), main: plain(t("score", { b: st.score })),
      sub: rec ? t("newRec") : t("bestScore", { s: prev }), rec: rec, perfect: st.right === 10,
      note: t("pickNote", { r: st.right }), head: t("pickHead"),
      list: st.miss.map(function (x) { return { n: x.n, note: x.pick ? t("youPicked", { p: x.pick }) : t("timeUpShort") }; }),
      again: startPick
    });
  }

  function showResult(r) {
    gStop();
    pane("result");
    var list = r.list.length
      ? '<div class="mist"><div class="mh">' + r.head + "・" + t("tapToHear") + "</div>" +
        r.list.map(function (x) { return '<button class="mrow" data-n="' + x.n + '"><span><b>' + x.n + "日</b>　" + kana(dayRead(x.n)) + "</span><small>" + x.note + "</small></button>"; }).join("") + "</div>"
      : "";
    $("#gResult").innerHTML = '<div class="result">' + (r.perfect ? window.VocabDeck.HANAMARU : "") +
      '<div class="rtitle">' + r.title + '</div><div class="rmain">' + r.main + '</div><div class="rsub' + (r.rec ? " rec" : "") + '">' + r.sub + '</div><div class="rnote">' + r.note + "</div>" + list +
      '<div class="btnrow"><button class="btn" id="rMenu">' + t("menu") + '</button><button class="btn primary" id="rAgain">' + t("again") + "</button></div></div>";
    $("#gResult").onclick = function (e) { var m = e.target.closest(".mrow"); if (m) ctx.say(dayRead(+m.dataset.n)); };
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
    $("#prevM").onclick = function () { if (--view.m < 1) { view.m = 12; view.y--; } renderMap(); };
    $("#nextM").onclick = function () { if (++view.m > 12) { view.m = 1; view.y++; } renderMap(); };
    $("#mTitle").onclick = function () {
      setReadout(view.m + "月", D.months[view.m], MSP.has(view.m), MSP.has(view.m) ? monthHint(view.m) : "", D.months[view.m]);
    };
    $("#hideRead").onchange = function (e) {
      view.hide = e.target.checked;
      var c = $("#mapCal");
      c.classList.toggle("hide", view.hide);
      c.querySelectorAll(".peek").forEach(function (x) { x.classList.remove("peek"); });
    };
    $("#mapCal").onclick = function (e) {
      var w = e.target.closest("[data-wd]");
      if (w) { var i = +w.dataset.wd; setReadout(D.weekdayKanji[i] + "曜日", D.weekdays[i], false, "", D.weekdays[i]); return; }
      var c = e.target.closest(".c[data-n]");
      if (!c) return;
      var n = +c.dataset.n;
      $("#mapCal").querySelectorAll(".sel").forEach(function (x) { x.classList.remove("sel"); });
      c.classList.add("sel", "peek");
      setReadout(view.m + "月" + n + "日", dayRead(n), SP.has(n), D.months[view.m] + " " + dayRead(n), dayRead(n));
    };
    $("#gMenu").onclick = function (e) {
      var b = e.target.closest("[data-game]");
      if (b) ({ find: startFind, listen: startListen, pick: startPick })[b.dataset.game]();
    };
    $("#gQuit").onclick = function () { gStop(); renderMenu(); };
    $("#gCal").onclick = function (e) { var c = e.target.closest(".c[data-n]"); if (c && G.onCell) G.onCell(+c.dataset.n, c); };
  }

  /* ---------- 模板介面 ---------- */
  function mount(root, theme, c, meta) {
    unmount();
    el = root; D = theme; ctx = c; store = c.store(meta.id);
    prog = store.get() || {};
    delete prog.weights;   // 舊版的卡片權重，改用 deck.js 的熟悉度後不再用
    prog.best = Object.assign({ find: null, listen: 0, pick: 0 }, prog.best);

    var now = new Date();
    TY = now.getFullYear(); TM = now.getMonth() + 1; TD = now.getDate(); TW = now.getDay();
    if (!view.y) { view.y = TY; view.m = TM; }

    SP = new Set(D.special);
    MSP = new Set(D.monthSpecial);
    PAIR_D = pairMap(D.pairs.days);
    PAIR_M = pairMap(D.pairs.months);
    ITEMS = [];
    for (var d = 1; d <= 31; d++) ITEMS.push({ key: "d" + d, kind: "day", n: d, label: d + "日", reading: D.days[d], sp: SP.has(d) });
    for (var m = 1; m <= 12; m++) ITEMS.push({ key: "m" + m, kind: "month", n: m, label: m + "月", reading: D.months[m], sp: MSP.has(m) });

    el.innerHTML = layout();
    deck = window.VocabDeck.create({
      root: $("#deckRoot"), ctx: ctx, prog: prog, save: save,
      pool: function () { return ITEMS; },
      key: function (it) { return it.key; },
      label: function (it) { return "<b>" + it.label + "</b>　" + kana(it.reading); },
      sayOf: function (it) { return it.reading; },
      render: renderCard
    });
    bind();
    renderMap();
    setTab(view.tab);
  }

  function unmount() {
    gStop();
    if (deck) deck.stop();
  }

  window.VocabTemplates = window.VocabTemplates || {};
  window.VocabTemplates.calendar = { mount: mount, unmount: unmount };
})();
