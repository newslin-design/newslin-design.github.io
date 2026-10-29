/* ============================================================
   deck.js ─ 卡片的共用節奏：一回 10 題、熟悉度、結算
   ------------------------------------------------------------
   每個字有「熟悉度」0〜3：答對 +1、答錯 -1（最低 0），到 3 就算「記住了」。
   整體熟悉度 % ＝ 所有字的熟悉度加總 ÷（字數 × 3），答對一題就看得到往上加，比「記住了 0 / 43」有感。
   一回出 10 題，先出熟悉度低的字；做完顯示這一回答對幾題、熟悉度從幾 % 變幾 %、新記住幾個。
   題目長什麼樣子由各模板決定（render），這裡只管出哪個字、記分、換下一題。
   熟悉度存在 prog.fam（每個主題各一份，存在這台裝置的瀏覽器 localStorage）。
   遊戲裡答錯的字，模板會呼叫 bump() 讓熟悉度 -1，之後就比較常被抽到。
   ============================================================ */
(function () {
  "use strict";

  var GOAL = 3;    // 熟悉度到這裡算記住
  var ROUND = 10;  // 一回幾題
  var HANAMARU = '<div class="hanamaru"><svg viewBox="0 0 120 120" width="92" height="92" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M60 57a4 4 0 1 1-4 4a9 9 0 1 1 9 9a15 15 0 1 1-15-15a21 21 0 1 1 21 21"/><g stroke-width="3.5"><ellipse cx="60" cy="16" rx="11" ry="14"/><ellipse cx="60" cy="16" rx="11" ry="14" transform="rotate(60 60 60)"/><ellipse cx="60" cy="16" rx="11" ry="14" transform="rotate(120 60 60)"/><ellipse cx="60" cy="16" rx="11" ry="14" transform="rotate(180 60 60)"/><ellipse cx="60" cy="16" rx="11" ry="14" transform="rotate(240 60 60)"/><ellipse cx="60" cy="16" rx="11" ry="14" transform="rotate(300 60 60)"/></g></svg><span>よくできました</span></div>';

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }

  /**
   * o.root   放卡片的容器
   * o.ctx    app.js 給的共用工具（t、say、sfx…）
   * o.prog   這個主題的進度物件，o.save() 存回去
   * o.pool() 目前要練的字（例如只看第 1 級時只回傳第 1 級）
   * o.key(it)   每個字的固定 id
   * o.label(it) 結算清單上這個字怎麼顯示（HTML）
   * o.sayOf(it) 點結算清單時念什麼
   * o.render(box, it, done)  模板把題目畫進 box；作答後呼叫 done(答對?, 幾毫秒後換下一題)。
   *                          不給毫秒數 = 等使用者按「下一張」（答錯要看解說時用）
   */
  function create(o) {
    var t = o.ctx.t;
    o.prog.fam = o.prog.fam || {};
    var st = null, timer = null;

    function $(s) { return o.root.querySelector(s); }
    function fam(it) { return o.prog.fam[o.key(it)] || 0; }
    function setFam(it, v) { o.prog.fam[o.key(it)] = Math.max(0, Math.min(GOAL, v)); o.save(); }
    /** 整體熟悉度：pct = 加總 ÷ 滿分；dist[f] = 熟悉度是 f 的字有幾個；k = 記住了幾個 */
    function stats() {
      var p = o.pool(), sum = 0, dist = [];
      for (var f = 0; f <= GOAL; f++) dist.push(0);
      p.forEach(function (it) { var v = fam(it); sum += v; dist[v]++; });
      return { n: p.length, k: dist[GOAL], dist: dist, pct: p.length ? Math.round(sum / (p.length * GOAL) * 100) : 0 };
    }
    /** 分色條＋圖例：記住了／快記住了／剛認識／還沒學 各幾個 */
    function distHtml(S) {
      var bar = "", leg = "";
      for (var f = GOAL; f >= 0; f--) {
        if (S.dist[f]) bar += '<i class="f' + f + '" style="flex-grow:' + S.dist[f] + '"></i>';
        leg += '<li><i class="f' + f + '"></i>' + t("lv" + f) + " <b>" + S.dist[f] + "</b></li>";
      }
      return '<div class="famdist" aria-hidden="true">' + bar + '</div><ul class="famleg">' + leg + "</ul>";
    }
    function dots(it) {
      var f = fam(it), s = "";
      for (var i = 0; i < GOAL; i++) s += "<i" + (i < f ? ' class="on"' : "") + "></i>";
      return '<span class="dots" role="img" aria-label="' + t("famLabel", { f: f, g: GOAL }) + '">' + s + "</span>";
    }

    /** 出題：先挑熟悉度低的；字不到 10 個就重複出，但不連續出同一個 */
    function pick() {
      var p = shuffle(o.pool());
      p.sort(function (a, b) { return fam(a) - fam(b); });   // 先洗牌再排序：同熟悉度的順序是隨機的
      var qs = p.slice(0, ROUND);
      while (qs.length < ROUND && p.length) qs.push(p[Math.floor(Math.random() * p.length)]);
      qs = shuffle(qs);
      for (var i = 1; i < qs.length; i++) {
        if (qs[i] !== qs[i - 1]) continue;
        for (var j = i + 1; j < qs.length; j++) {
          if (qs[j] !== qs[i - 1] && qs[j] !== qs[i + 1]) { var x = qs[i]; qs[i] = qs[j]; qs[j] = x; break; }
        }
      }
      return qs;
    }

    function intro() {
      clearTimeout(timer);
      st = null;
      var S = stats();
      o.root.innerHTML =
        '<div class="card deck-intro">' +
          '<div class="rtitle">' + t("famTotal") + "</div>" +
          '<div class="rmain">' + S.pct + "<small>%</small></div>" +
          distHtml(S) +
          '<p class="deck-rule">' + t("deckRule", { n: ROUND, g: GOAL }) + "</p>" +
          '<button class="btn primary" id="dStart">' + t("deckStart", { n: ROUND }) + "</button>" +
        "</div>" +
        '<button class="linkbtn" id="dReset">' + t("reset") + "</button>";
      $("#dStart").onclick = start;
      var armed = null;
      $("#dReset").onclick = function (e) {
        var b = e.currentTarget;
        if (!armed) {
          b.textContent = t("resetConfirm");
          armed = setTimeout(function () { armed = null; b.textContent = t("reset"); }, 3000);
          return;
        }
        clearTimeout(armed);
        o.prog.fam = {};
        o.save();
        intro();
      };
    }

    function start() {
      st = { qs: pick(), i: 0, right: 0, before: {}, got: {}, answered: false, pct0: stats().pct };
      o.pool().forEach(function (it) { st.before[o.key(it)] = fam(it); });
      ask();
    }

    function header() {
      return '<div class="deckbar"><span>' + t("qOf", { i: st.i + 1, n: st.qs.length }) + "</span>" +
        '<div class="pbar"><i style="width:' + (st.i / st.qs.length * 100) + '%"></i></div>' +
        '<span id="dPct">' + t("famPct", { p: stats().pct }) + "</span></div>";
    }

    function ask() {
      var it = st.qs[st.i];
      st.answered = false;
      o.root.innerHTML = header() + '<div class="card" id="dCard"></div>';
      o.render($("#dCard"), it, function (correct, delay) {
        if (st.answered) return;
        st.answered = true;
        var was = stats().pct;
        setFam(it, fam(it) + (correct ? 1 : -1));
        if (correct) st.right++;
        st.got[o.key(it)] = st.got[o.key(it)] === false ? false : !!correct;   // 同一回出兩次，有錯就算錯
        var now = stats().pct, pc = $("#dPct");
        pc.textContent = t("famPct", { p: now });
        if (now > was) { pc.classList.remove("up"); void pc.offsetWidth; pc.classList.add("up"); }   // 往上加時跳一下
        if (delay == null) {
          $("#dCard").insertAdjacentHTML("beforeend", '<button class="btn primary deck-next" id="dNext">' + t(st.i + 1 < st.qs.length ? "nextCard" : "deckFinish") + "</button>");
          $("#dNext").onclick = next;
        } else {
          timer = setTimeout(next, delay);
        }
      });
    }

    function next() {
      clearTimeout(timer);
      st.i++;
      if (st.i >= st.qs.length) finish();
      else ask();
    }

    function finish() {
      var seen = [], newly = 0;
      st.qs.forEach(function (it) { if (seen.indexOf(it) < 0) seen.push(it); });
      seen.forEach(function (it) { if (st.before[o.key(it)] < GOAL && fam(it) >= GOAL) newly++; });
      var S = stats(), perfect = st.right === st.qs.length, delta = S.pct - st.pct0;
      o.root.innerHTML =
        '<div class="result">' + (perfect ? HANAMARU : "") +
          '<div class="rtitle">' + t("roundDone") + '</div>' +
          '<div class="rmain">' + t("roundScore", { r: st.right, n: st.qs.length }) + "</div>" +
          '<div class="famup">' + t("famUp", { a: st.pct0, b: S.pct }) +
            (delta > 0 ? ' <span class="up">+' + delta + "%</span>" : "") + "</div>" +
          distHtml(S) +
          '<div class="rnote">' + (newly ? '<span class="rec">' + t("newlyLearned", { k: newly }) + "</span>・" : "") + t("progress", { k: S.k, n: S.n }) + "</div>" +
          '<div class="mist"><div class="mh">' + t("roundList") + "</div>" +
            seen.map(function (it) {
              var ok = st.got[o.key(it)];
              return '<button class="mrow deck-row" data-k="' + o.key(it) + '"><span class="deck-mark ' + (ok ? "ok" : "no") + '" aria-hidden="true">' + (ok ? "○" : "×") + "</span>" +
                '<span class="deck-lab">' + o.label(it) + "</span>" + dots(it) + "</button>";
            }).join("") +
          "</div>" +
          '<div class="btnrow"><button class="btn" id="dEnd">' + t("deckEnd") + '</button><button class="btn primary" id="dAgain">' + t("deckAgain") + "</button></div>" +
        "</div>";
      $(".mist").onclick = function (e) {
        var b = e.target.closest(".deck-row");
        if (!b) return;
        var it = seen.filter(function (x) { return o.key(x) === b.dataset.k; })[0];
        if (it) o.ctx.say(o.sayOf(it));
      };
      $("#dEnd").onclick = intro;
      $("#dAgain").onclick = start;
      st = null;
      if (perfect || newly || delta > 0) o.ctx.sfx.win();
    }

    return {
      /** 切到卡片分頁：一回做到一半就接著做，不然顯示進度和「開始」 */
      resume: function () { if (st) ask(); else intro(); },
      stop: function () { clearTimeout(timer); },
      /** 遊戲裡答錯：熟悉度 -1 */
      bump: function (it) { setFam(it, fam(it) - 1); }
    };
  }

  window.VocabDeck = { create: create, GOAL: GOAL, ROUND: ROUND, HANAMARU: HANAMARU };
})();
