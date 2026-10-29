/* ============================================================
   game.js ─ 流程與狀態
   ------------------------------------------------------------
   標題（選難度）→ 進門 → 逛貨架 → 結帳 → 回飯店 → 結果
   這個檔案不認識任何商品或台詞，全部從 window.SCENES、
   window.WORDS、window.LEVELS 讀。結帳的每一步交給 steps.js 的 STEPS。
   ============================================================ */
(function () {
  "use strict";

  var T = window.TravelText;
  var S = window.TravelSpeech;
  var STEPS = window.STEPS;
  var WORDS = window.WORDS;
  var LEVELS = window.LEVELS;
  var scene = window.SCENES.konbini;
  var PICKS = (window.PICKS || {})[scene.id] || null;   // 社群推薦必買（data/picks.js）

  var ICONS = {
    sound: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.6 8.6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mute: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  /* 單字卡小圖的寬高比，要跟 css 的 .card__thumb 一致 */
  var THUMB_RATIO = 104 / 80;

  /* 場景圖的寬高比（9:16），要跟 css 的 --img-w／--img-h 一致 */
  var IMG_RATIO = 9 / 16;

  /* 結帳拉近時，櫃檯停在畫面由上往下的哪裡（下面會被對話框蓋住） */
  var FOCUS_Y = 0.34;

  var LEVEL_KEY = "travel.level";

  /* ---------- 小工具 ---------- */

  function $(id) {
    return document.getElementById(id);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function button(label, cls, onClick) {
    var b = el("button", cls, label);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }

  /** 按一次就鎖住的按鈕（繼續、進去…），避免連點跳過一步 */
  function onceButton(label, cls, onClick) {
    var b = button(label, cls, function () {
      if (b.disabled) return;
      b.disabled = true;
      onClick();
    });
    return b;
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function yen(n) {
    return "¥" + n.toLocaleString("ja-JP");
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  /** 用「圖的百分比」擺位置 */
  function place(node, r) {
    node.style.left = r.x + "%";
    node.style.top = r.y + "%";
    node.style.width = r.w + "%";
    node.style.height = r.h + "%";
  }

  var TIP_TAGS = { trap: "中文母語者注意", pick: "社群推薦" };

  /** 小知識；kind = "trap"（中文母語者注意）或 "pick"（社群推薦） */
  function tip(text, kind) {
    var p = el("p", "tip" + (kind ? " tip--" + kind : ""));
    p.appendChild(el("span", "tip__tag", TIP_TAGS[kind] || "小知識"));
    p.appendChild(document.createTextNode(text));
    return p;
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + "." + (d.getMonth() + 1) + "." + d.getDate();
  }

  /* ---------- 畫面元件與狀態 ---------- */

  var stage = $("stage");
  var canvas = $("canvas");
  var img = $("stage-img");
  var labelsBox = $("labels");
  var spotsBox = $("spots");
  var overlay = $("overlay");
  var basketChip = $("basket");
  var panel = $("panel");
  var sheet = $("sheet");
  var backdrop = $("backdrop");

  var state = {
    phase: "title",  // title → enter → shop（點櫃檯 → counter）→ checkout → hotel → result
    level: 1,        // 難度：1 入門、2 一般、3 老手（見 data/levels.js）
    basket: [],      // 籃子裡的商品 id（每樣最多一個）
    flags: {},       // 結帳時選了什麼（warm、chopsticks、bag…）
    log: [],         // 店員說過的話＋你的回應，結果頁回顧用
    triggered: [],   // 這一輪發生的結果
    fresh: [],       // 這一輪第一次發現的結果
    found: {},       // 玩到現在發現過的結果（不存檔，重新整理就歸零）
    seen: {}         // 看過單字卡的熱點
  };

  /* ---------- 條件與效果 ---------- */

  function hasTag(tag) {
    return state.basket.some(function (id) {
      return scene.items[id].tags.indexOf(tag) >= 0;
    });
  }

  /** when 的六種條件：has／min／max／flag／none／level，全部成立才算 */
  function passes(when) {
    if (!when) return true;
    if (when.level && state.level < when.level) return false;
    if (when.has && !hasTag(when.has)) return false;
    if (when.min && state.basket.length < when.min) return false;
    if (when.max != null && state.basket.length > when.max) return false;
    if (when.flag) {
      for (var k in when.flag) {
        if (state.flags[k] !== when.flag[k]) return false;
      }
    }
    if (when.none) {
      for (var i = 0; i < when.none.length; i++) {
        if (state.triggered.indexOf(when.none[i]) >= 0) return false;
      }
    }
    return true;
  }

  /** 選項或螢幕按鈕的效果：set 記下選了什麼，remove 把某個標籤的商品拿掉，
      add 把商品加進來（在櫃檯點咖啡） */
  function apply(fx) {
    if (fx.set) {
      Object.keys(fx.set).forEach(function (k) { state.flags[k] = fx.set[k]; });
    }
    if (fx.add) addItem(fx.add);
    if (fx.remove) {
      state.basket = state.basket.filter(function (id) {
        return scene.items[id].tags.indexOf(fx.remove) < 0;
      });
      updateBasket();
    }
  }

  function itemsTotal() {
    return state.basket.reduce(function (sum, id) { return sum + scene.items[id].price; }, 0);
  }

  function total() {
    var bag = state.flags.bag && scene.fees ? scene.fees.bag : 0;
    return itemsTotal() + bag;
  }

  /* ---------- 難度 ---------- */

  function level() {
    return LEVELS[state.level - 1] || LEVELS[0];
  }

  /** 換難度：記下來、調語速；從畫面上選的時候，順便切成這個難度建議的顯示方式 */
  function setLevel(id, applyMode) {
    state.level = clamp(Number(id) || 1, 1, LEVELS.length);
    try {
      localStorage.setItem(LEVEL_KEY, String(state.level));
    } catch (e) { /* 存不了也沒關係，只是下次要重選 */ }
    S.setRate(level().rate);
    if (applyMode) {
      T.setMode(level().mode);
      syncMode();
    }
  }

  /** 照難度挑一種說法：步驟本身那句算第 1 級，variants 裡各自標 lv */
  function pickVariant(step) {
    var pool = [step].concat(step.variants || []).filter(function (v) {
      return level().pick.indexOf(v.lv || 1) >= 0;
    });
    if (!pool.length) return step;
    var v = pool[Math.floor(Math.random() * pool.length)];
    return v === step ? step : Object.assign({}, step, v);
  }

  /** 老手：先只聽聲音。聽不到的時候（關了發音、沒有日文語音也沒有音檔）就照常顯示字幕 */
  function hideText(line) {
    return level().listen && S.isEnabled() && S.canHear(line);
  }

  /** 選難度：三個按鈕＋選中那個的說明（標題和結果頁共用） */
  function levelPicker() {
    var box = el("div", "levels");
    var row = el("div", "levels__row");
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "難度");
    LEVELS.forEach(function (lv) {
      var b = button(lv.name_zh, "level", function () {
        setLevel(lv.id, true);
        syncPicker(box);
      });
      b.dataset.level = lv.id;
      row.appendChild(b);
    });
    box.appendChild(row);
    box.appendChild(el("p", "levels__desc"));
    syncPicker(box);
    return box;
  }

  function syncPicker(box) {
    Array.prototype.forEach.call(box.querySelectorAll(".level"), function (b) {
      b.setAttribute("aria-pressed", String(Number(b.dataset.level) === state.level));
    });
    box.querySelector(".levels__desc").textContent = level().desc_zh;
  }

  /* ---------- 場景圖：換圖、疊字、熱點、拉近 ---------- */

  function showImage(key) {
    var src = scene.images[key];
    if (img.getAttribute("src") !== src) {
      img.style.opacity = "0";
      img.onload = img.onerror = function () { img.style.opacity = "1"; };
      img.setAttribute("src", src);
      backdrop.style.backgroundImage = "url(\"" + src + "\")";
    }
    img.alt = (scene.alt_zh && scene.alt_zh[key]) || "";
    document.body.classList.toggle("is-dark", (scene.dark || []).indexOf(key) >= 0);   // 暗的圖上，面板和按鈕用深色
    renderLabels(key);
    renderSpots(key === "inside");
    zoom(null);
  }

  function renderLabels(key) {
    labelsBox.textContent = "";
    ((scene.labels && scene.labels[key]) || []).forEach(function (l) {
      var n = el("div", "label" + (l.big ? " label--sign" : "") + (l.bg ? " label--plate" : ""), T.plain(l.text));
      n.lang = "ja";
      place(n, l);
      n.style.setProperty("--h", l.h);
      if (l.bg) n.style.background = l.bg;   // 底板：蓋掉圖上的亂碼，字在照片上也看得清楚
      if (l.ink) n.style.color = l.ink;
      labelsBox.appendChild(n);
    });
  }

  function renderSpots(on) {
    spotsBox.textContent = "";
    if (!on) return;
    scene.hotspots.forEach(function (h) {
      if (h.action === "picks" && !PICKS) return;   // 沒有必買清單就不放海報
      var b = el("button", "spot");
      b.type = "button";
      b.dataset.id = h.id;
      b.setAttribute("aria-label", spotName(h));
      place(b, h);
      if (h.item && pickFor(h.item)) {
        var tag = el("span", "spot__tag", "人気");
        tag.lang = "ja";
        b.appendChild(tag);
      }
      b.addEventListener("click", function () { onSpot(h); });
      spotsBox.appendChild(b);
    });
    refreshSpots();
  }

  function hotspot(id) {
    for (var i = 0; i < scene.hotspots.length; i++) {
      if (scene.hotspots[i].id === id) return scene.hotspots[i];
    }
    return null;
  }

  function spotWord(h) {
    return h.item ? scene.items[h.item].word : h.word;
  }

  function spotName(h) {
    if (h.action === "checkout") return "櫃檯（結帳）";
    if (h.action === "picks") return "海報（社群推薦必買）";
    var w = WORDS[spotWord(h)];
    return w ? w.zh : h.id;
  }

  function refreshSpots() {
    spotsBox.classList.toggle("is-off", state.phase !== "shop");
    Array.prototype.forEach.call(spotsBox.children, function (b) {
      var h = hotspot(b.dataset.id);
      b.classList.toggle("is-in-basket", !!h.item && state.basket.indexOf(h.item) >= 0);
      b.classList.toggle("is-seen", !!state.seen[h.id]);
    });
  }

  var focused = null;   // 現在拉近在哪（畫面大小變了要重算）

  /** 把圖上的 (x, y) 拉到畫面的中間偏上（FOCUS_Y）；f = null 就回到整張圖 */
  function zoom(f) {
    focused = f;
    if (!f) {
      canvas.style.transform = "";
      return;
    }
    var s = f.scale;
    var tx = slide(s * f.x / 100 * canvas.offsetWidth, stage.clientWidth / 2,
      canvas.offsetLeft, s * canvas.offsetWidth, stage.clientWidth);
    var ty = slide(s * f.y / 100 * canvas.offsetHeight, stage.clientHeight * FOCUS_Y,
      canvas.offsetTop, s * canvas.offsetHeight, stage.clientHeight);
    canvas.style.transform = "translate(" + tx + "px, " + ty + "px) scale(" + s + ")";
  }

  /** 拉近時一個方向要移多少（px）：讓圖上的 p 停在畫面的 at，但圖到了邊緣就不再移（要蓋滿畫面）。
      base 是圖原本的位置，size 是放大後的長度，view 是畫面的長度 */
  function slide(p, at, base, size, view) {
    if (size <= view) return (view - size) / 2 - base;
    return clamp(at - base - p, view - base - size, -base);
  }

  window.addEventListener("resize", function () {
    if (focused) zoom(focused);
  });

  function updateBasket() {
    basketChip.hidden = ["shop", "counter", "checkout"].indexOf(state.phase) < 0;
    document.body.classList.toggle("is-shopping", !basketChip.hidden);   // 籃子佔用工具列左邊
    basketChip.querySelector(".basket__n").textContent = state.basket.length;
    refreshSpots();
  }

  function addItem(id) {
    if (state.basket.indexOf(id) < 0) state.basket.push(id);
    updateBasket();
    basketChip.classList.remove("is-bump");
    void basketChip.offsetWidth;   // 重新觸發動畫
    basketChip.classList.add("is-bump");
  }

  function removeItem(id) {
    state.basket = state.basket.filter(function (x) { return x !== id; });
    updateBasket();
  }

  /* ---------- 對話框的零件 ---------- */

  function clearPanel() {
    panel.textContent = "";
    panel.classList.remove("is-revealed", "panel--compact");
    panel.scrollTop = 0;
  }

  function scrollPanel() {
    panel.scrollTop = panel.scrollHeight;
  }

  /** 「再聽一次」和「慢速」 */
  function speakRow(item) {
    var row = el("span", "speak");
    var play = button("", "", function () { S.say(item); });
    play.innerHTML = ICONS.sound;
    play.setAttribute("aria-label", "再聽一次");
    var slow = button("慢", "", function () { S.say(item, { slow: true }); });
    slow.setAttribute("aria-label", "慢速再聽一次");
    row.appendChild(play);
    row.appendChild(slow);
    return row;
  }

  /** 只看日文時才出現：點一下顯示中文（scope 裡全部的中文） */
  function revealButton(scope) {
    return button("看中文", "reveal", function () {
      scope.classList.toggle("is-revealed");
    });
  }

  /** 店員說的一句：名牌＋看中文＋發音按鈕＋日文／拼音／中文。
      老手會先藏起字幕（say--listen），你回應之後或按「看字幕」才出現 */
  function clerkBlock(line, scope) {
    var box = el("div", "say");
    var head = el("div", "say__head");
    head.appendChild(el("span", "speaker", "店員"));
    if (hideText(line)) {
      box.classList.add("say--listen");
      head.appendChild(button("看字幕", "reveal-sub", function () { box.classList.add("is-shown"); }));
    }
    head.appendChild(revealButton(scope || panel));
    head.appendChild(speakRow(line));
    box.appendChild(head);
    box.appendChild(el("p", "say__listen", "（先只聽聲音）"));
    box.appendChild(T.line(line));
    return box;
  }

  /** 你的回應（結帳時和結果頁都用） */
  function replyBlock(r) {
    var box = el("div", "reply");
    box.appendChild(el("span", "reply__who", "你"));
    if (r.nod) box.appendChild(el("p", "reply__act", "（微笑點頭）"));
    else if (r.pressed) box.appendChild(el("p", "reply__act", "（按了「" + T.plain(r.ja) + "」）"));
    else box.appendChild(T.line({ ja: r.ja, romaji: r.romaji, zh: r.zh }));
    return box;
  }

  function record(line) {
    var entry = { line: line, replies: [] };
    state.log.push(entry);
    return entry;
  }

  /** 客人用的小螢幕（疊在場景圖上） */
  function customerScreen(spec, onPress) {
    overlay.textContent = "";
    var box = el("div", "cscreen");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "客人用的螢幕");
    var inner = el("div", "cscreen__inner");
    inner.appendChild(T.line({ ja: spec.ja, zh: spec.zh }, "cscreen__title"));
    if (spec.total) {
      var sum = el("div", "cscreen__total", "合計 " + yen(total()));
      sum.lang = "ja";
      inner.appendChild(sum);
    }
    var btns = el("div", "cscreen__buttons" + (spec.buttons.length > 2 ? " is-col" : ""));
    spec.buttons.forEach(function (b) {
      var n = el("button", "cscreen__btn");
      n.type = "button";
      var ja = el("span", "cscreen__ja");
      ja.lang = "ja";
      ja.appendChild(T.ruby(b.ja));
      n.appendChild(ja);
      if (b.zh) n.appendChild(el("span", "t-zh", b.zh));
      n.addEventListener("click", function () { onPress(b); });
      btns.appendChild(n);
    });
    inner.appendChild(btns);
    box.appendChild(inner);
    overlay.appendChild(box);
    return {
      close: function () { box.remove(); },
      pulse: function () {
        box.classList.remove("is-pulse");
        void box.offsetWidth;
        box.classList.add("is-pulse");
      }
    };
  }

  /* ---------- 給 STEPS 用的工具 ---------- */

  function stepUI(next) {
    var turn = null;    // 這一步在對話框裡的容器
    var entry = null;   // 這一步在回顧裡的那一筆

    /** 回應之後發生的事：店員再說一句、旁白、小知識。有東西可看就回傳 true */
    function showAfter(r) {
      var any = false;
      if (r.then) {
        turn.appendChild(clerkBlock(r.then));
        entry = record(r.then);   // 之後的回應接在這句後面，回顧才會照時間順序
        S.say(r.then);
        any = true;
      }
      if (r.narr) {
        turn.appendChild(el("p", "narr", r.narr));
        any = true;
      }
      if (r.tip) {
        turn.appendChild(tip(r.tip));
        any = true;
      }
      return any;
    }

    return {
      /** 店員說一句：清空對話框、顯示、念出來、記下來 */
      clerk: function (line) {
        clearPanel();
        turn = el("div", "turn");
        turn.appendChild(clerkBlock(line));
        panel.appendChild(turn);
        entry = record(line);
        S.say(line);
      },

      /** 選項；點了就整排收起來，避免連點。回傳那一排，touch 按了螢幕時要收掉 */
      choices: function (list, onPick) {
        var box = el("div", "choices");
        list.forEach(function (c) {
          var b = el("button", "choice" + (c.nod ? " choice--nod" : ""));
          b.type = "button";
          if (c.nod) b.textContent = "（微笑點頭）";
          else b.appendChild(T.line({ ja: c.ja, romaji: c.romaji, zh: c.zh }));
          b.addEventListener("click", function () {
            box.remove();
            onPick(c);
          });
          box.appendChild(b);
        });
        turn.appendChild(box);
        return box;
      },

      apply: apply,

      /** 你的回應：顯示在右邊、念出來。回傳 Promise，念完才往下 */
      answer: function (c, how) {
        var r = { nod: !!c.nod, pressed: how === "pressed", ja: c.ja, romaji: c.romaji, zh: c.zh };
        entry.replies.push(r);
        /* 回應之後，先前藏起來的字幕都打開（老手） */
        Array.prototype.forEach.call(turn.querySelectorAll(".say--listen"), function (n) {
          n.classList.add("is-shown");
        });
        turn.appendChild(replyBlock(r));
        scrollPanel();
        if (r.nod || r.pressed) return wait(600);
        return Promise.all([S.say(c, { alt: true }), wait(700)]);
      },

      /** 回應之後的事＋「繼續」；什麼都沒有就直接下一步 */
      react: function (r, then) {
        if (!showAfter(r)) {
          wait(200).then(then);
          return;
        }
        var row = el("div", "row");
        row.appendChild(onceButton("繼續", "btn btn--primary", function () {
          S.stop();
          then();
        }));
        turn.appendChild(row);
        scrollPanel();
      },

      /** 同上，但不往下走（微笑點頭之後，還是要自己按螢幕） */
      hint: function (r) {
        showAfter(r);
        if (r.hint) turn.appendChild(el("p", "hint", r.hint));
        scrollPanel();
      },

      screen: customerScreen,
      next: next
    };
  }

  /** 照順序跑一串步驟；when 不成立的跳過，突發狀況照難度的機率決定出不出現。
      每一步照難度挑一種說法，全部跑完呼叫 done */
  function runSteps(list, done) {
    var i = 0;
    function next() {
      while (i < list.length && !passes(list[i].when)) i++;
      if (i >= list.length) {
        done();
        return;
      }
      var step = list[i++];
      if (step.event && Math.random() >= level().events) {
        next();
        return;
      }
      var fn = STEPS[step.type];
      if (!fn) {
        console.warn("[game] STEPS 裡沒有「" + step.type + "」這種互動，跳過");
        next();
        return;
      }
      fn(pickVariant(step), stepUI(next));
    }
    next();
  }

  /* ---------- 各階段 ---------- */

  function showTitle() {
    state.phase = "title";
    showImage("outside");
    updateBasket();

    overlay.textContent = "";
    var t = el("div", "title");
    var ja = el("div", "title__ja", "日本旅行シミュレーター");
    ja.lang = "ja";
    t.appendChild(ja);
    t.appendChild(el("div", "title__zh", "第一站：" + scene.title.zh));
    overlay.appendChild(t);

    clearPanel();
    panel.appendChild(el("p", "lead", scene.intro_zh));
    panel.appendChild(el("p", "field-label", "選難度"));
    panel.appendChild(levelPicker());
    var note = el("p", "note");
    panel.appendChild(note);
    var row = el("div", "row");
    row.appendChild(onceButton("進去", "btn btn--primary", function () {
      S.unlock();
      startRound();
    }));
    panel.appendChild(row);

    S.ready().then(function () {
      if (!S.hasJapanese() && !S.hasAudio()) {
        note.textContent = "這台裝置找不到日文語音，可能聽不到發音。建議用 Chrome、Edge 或 iPhone 的 Safari。";
      }
    });
  }

  function startRound() {
    state.phase = "enter";
    state.basket = [];
    state.flags = {};
    state.log = [];
    state.triggered = [];
    state.fresh = [];
    sheet.hidden = true;
    overlay.textContent = "";
    showImage("inside");
    updateBasket();
    runSteps(scene.enter || [], function () { shop(); });
  }

  function shop(message) {
    state.phase = "shop";
    zoom(null);
    overlay.textContent = "";
    updateBasket();
    clearPanel();
    panel.classList.add("panel--compact");   // 逛貨架時縮小，讓圖多露出來

    panel.appendChild(el("p", "lead", scene.shop_hint_zh));
    if (message) panel.appendChild(el("p", "flash", message));

    var list = el("div", "basket-list");
    if (!state.basket.length) list.appendChild(el("p", "muted", "籃子是空的。"));
    state.basket.forEach(function (id) {
      var w = WORDS[scene.items[id].word];
      var chip = button("", "chip", function () {
        removeItem(id);
        shop();
      });
      var ja = el("span", null, T.plain(w.ja));
      ja.lang = "ja";
      chip.appendChild(ja);
      chip.appendChild(el("span", "chip__x", "×"));
      chip.setAttribute("aria-label", "把" + w.zh + "拿出來");
      list.appendChild(chip);
    });
    panel.appendChild(list);

    var row = el("div", "row row--between");
    row.appendChild(el("span", "total", "合計 " + yen(itemsTotal())));
    var go = button("去結帳", "btn btn--primary", askCounter);
    go.disabled = !state.basket.length;
    row.appendChild(go);
    panel.appendChild(row);
  }

  function onSpot(h) {
    if (state.phase !== "shop") return;
    if (h.action === "checkout") {
      askCounter();
      return;
    }
    if (h.action === "picks") {
      openPicks(h);
      return;
    }
    openCard(h);
  }

  /** 單字卡：小圖＋日文／拼音／中文＋發音＋小知識＋放進籃子 */
  function openCard(h) {
    var item = h.item ? scene.items[h.item] : null;
    var w = WORDS[spotWord(h)];
    state.seen[h.id] = true;
    refreshSpots();
    clearPanel();

    var card = el("div", "card");
    card.appendChild(thumb(h));
    var body = el("div", "card__body");
    body.appendChild(T.line(w));
    var meta = el("div", "card__meta");
    meta.appendChild(revealButton(panel));
    meta.appendChild(speakRow(w));
    if (item) meta.appendChild(el("span", "card__price", yen(item.price)));
    body.appendChild(meta);
    card.appendChild(body);
    panel.appendChild(card);

    if (w.trap_zh) panel.appendChild(tip(w.trap_zh, "trap"));
    if (w.note_zh) panel.appendChild(tip(w.note_zh));
    var pick = item ? pickFor(h.item) : null;
    if (pick) panel.appendChild(tip(pick.card_zh || pick.why_zh, "pick"));

    var row = el("div", "row");
    row.appendChild(button("關閉", "btn btn--ghost", function () {
      S.stop();
      shop();
    }));
    if (item) {
      var inBasket = state.basket.indexOf(h.item) >= 0;
      row.appendChild(button(inBasket ? "從籃子拿出來" : "放進籃子", "btn btn--primary", function () {
        if (inBasket) removeItem(h.item);
        else addItem(h.item);
        shop();
      }));
    }
    panel.appendChild(row);
    S.say(w);
  }

  /** 單字卡上的小圖：直接裁場景圖裡那一塊，畫風自動一致 */
  function thumb(h) {
    var r = fitRegion(h.thumb || h, THUMB_RATIO);
    var t = el("div", "card__thumb");
    t.style.backgroundImage = "url(\"" + scene.images.inside + "\")";
    t.style.backgroundSize = (10000 / r.w) + "% " + (10000 / r.h) + "%";
    t.style.backgroundPosition = bgPos(r.x, r.w) + "% " + bgPos(r.y, r.h) + "%";
    return t;
  }

  function bgPos(start, size) {
    return size >= 100 ? 0 : start / (100 - size) * 100;
  }

  /** 把框撐成指定的寬高比（圖本身是 IMG_RATIO），中心不變，超出邊界就推回來 */
  function fitRegion(r, ratio) {
    var x = r.x;
    var y = r.y;
    var w = r.w;
    var h = r.h;
    if ((w * IMG_RATIO) / h > ratio) {
      var nh = (w * IMG_RATIO) / ratio;
      y -= (nh - h) / 2;
      h = nh;
    } else {
      var nw = (ratio * h) / IMG_RATIO;
      x -= (nw - w) / 2;
      w = nw;
    }
    w = Math.min(w, 100);
    h = Math.min(h, 100);
    return { x: clamp(x, 0, 100 - w), y: clamp(y, 0, 100 - h), w: w, h: h };
  }

  /* ---------- 社群推薦必買（海報） ---------- */

  /** 必買清單裡，對應到店內這個商品的那一項（沒有就 null） */
  function pickFor(itemId) {
    if (!PICKS) return null;
    for (var i = 0; i < PICKS.list.length; i++) {
      if (PICKS.list[i].item === itemId) return PICKS.list[i];
    }
    return null;
  }

  function itemSpot(itemId) {
    for (var i = 0; i < scene.hotspots.length; i++) {
      if (scene.hotspots[i].item === itemId) return scene.hotspots[i];
    }
    return null;
  }

  /** 海報：必買清單。要跟店員點的附一句怎麼說；店裡有賣的可以直接去看單字卡 */
  function openPicks(h) {
    state.seen[h.id] = true;
    refreshSpots();
    clearPanel();

    var head = el("div", "picks__head");
    head.appendChild(T.line({ ja: PICKS.title_ja, zh: PICKS.title_zh }, "picks__title"));
    head.appendChild(revealButton(panel));
    panel.appendChild(head);

    var list = el("ul", "picks");
    PICKS.list.forEach(function (p) {
      var li = el("li", "pick");
      var top = el("div", "pick__top");
      top.appendChild(el("span", "pick__chain", p.chain));
      top.appendChild(speakRow(p));
      li.appendChild(top);
      li.appendChild(T.line(p));
      li.appendChild(el("p", "pick__why", p.why_zh));
      if (p.ask) {
        var ask = el("div", "pick__ask");
        var askHead = el("div", "say__head");
        askHead.appendChild(el("span", "pick__ask-tag", "跟店員這樣說"));
        askHead.appendChild(speakRow(p.ask));
        ask.appendChild(askHead);
        ask.appendChild(T.line(p.ask));
        li.appendChild(ask);
      }
      var spot = p.item ? itemSpot(p.item) : null;
      if (spot) li.appendChild(button("店裡有賣，去看看", "pick__go", function () { openCard(spot); }));
      list.appendChild(li);
    });
    panel.appendChild(list);
    panel.appendChild(el("p", "picks__foot", PICKS.note_zh + "（資料時間：" + PICKS.updated + "）"));

    var row = el("div", "row");
    row.appendChild(button("關閉", "btn btn--ghost", function () {
      S.stop();
      shop();
    }));
    panel.appendChild(row);
  }

  /** 走到櫃檯（點櫃檯或「去結帳」）：店員先問一句（場景資料的 counter）。
      可以順便點咖啡，或說「まだです」回去逛 */
  function askCounter() {
    if (state.phase !== "shop") return;
    if (!scene.counter) {
      checkout();
      return;
    }
    state.phase = "counter";
    updateBasket();
    zoom(scene.focus);
    runSteps(scene.counter, function () {
      var later = state.flags.checkout === false;
      delete state.flags.checkout;   // 只是這一次的回答，不留到結果判定
      state.phase = "shop";
      if (later || !state.basket.length) shop();
      else checkout();
    });
  }

  function checkout() {
    if (state.phase !== "shop" || !state.basket.length) return;
    state.phase = "checkout";
    updateBasket();
    zoom(scene.focus);
    runSteps(scene.checkout, hotel);
  }

  function ending(id) {
    for (var i = 0; i < scene.endings.length; i++) {
      if (scene.endings[i].id === id) return scene.endings[i];
    }
    return null;
  }

  function hotel() {
    state.phase = "hotel";
    S.stop();
    overlay.textContent = "";
    showImage("hotel");
    updateBasket();

    /* 照順序檢查；none 看的是「前面已經成立的」，所以 just-right 要放最後 */
    state.triggered = [];
    state.fresh = [];
    scene.endings.forEach(function (e) {
      if (!passes(e.when)) return;
      state.triggered.push(e.id);
      if (!state.found[e.id]) state.fresh.push(e.id);
      state.found[e.id] = true;
    });

    clearPanel();
    panel.appendChild(el("p", "lead", scene.hotel_zh));
    var list = el("div", "happen");
    if (!state.triggered.length) list.appendChild(el("p", "narr", scene.empty_zh));
    state.triggered.forEach(function (id, i) {
      var e = ending(id);
      var item = el("div", "happen__item");
      item.style.animationDelay = (0.15 + i * 0.25) + "s";
      item.appendChild(el("div", "happen__icon", e.icon));
      var body = el("div", "happen__body");
      body.appendChild(el("p", "happen__text", e.zh));
      if (e.tip_zh) body.appendChild(tip(e.tip_zh));
      item.appendChild(body);
      list.appendChild(item);
    });
    panel.appendChild(list);

    var row = el("div", "row");
    row.appendChild(onceButton("看結果", "btn btn--primary", results));
    panel.appendChild(row);
  }

  function results() {
    state.phase = "result";
    S.stop();
    sheet.textContent = "";
    sheet.classList.remove("is-revealed");

    var stamp = el("div", "stamp");
    var main = el("span", "stamp__main", scene.stamp_ja);
    main.lang = "ja";
    stamp.appendChild(main);
    stamp.appendChild(el("span", "stamp__date", today()));
    sheet.appendChild(stamp);

    var found = el("p", "found");
    found.appendChild(document.createTextNode("發現了 "));
    found.appendChild(el("span", "found__n", Object.keys(state.found).length + "／" + scene.endings.length));
    found.appendChild(document.createTextNode(" 種結果"));
    sheet.appendChild(found);

    var grid = el("div", "endings");
    scene.endings.forEach(function (e) {
      var got = !!state.found[e.id];
      var c = el("div", "ending" + (got ? "" : " is-locked") + (state.fresh.indexOf(e.id) >= 0 ? " is-new" : ""));
      c.appendChild(el("div", "ending__icon", got ? e.icon : "？"));
      c.appendChild(el("div", "ending__title", got ? e.title_zh : "？？？"));
      if (!got && e.hint_zh) c.appendChild(el("div", "ending__hint", e.hint_zh));
      grid.appendChild(c);
    });
    sheet.appendChild(grid);

    var h = el("h2", "sheet__h", "店員剛剛說的話");
    h.appendChild(revealButton(sheet));
    sheet.appendChild(h);
    var ol = el("ol", "recap");
    state.log.forEach(function (entry) {
      var li = el("li");
      var head = el("div", "say__head");
      head.appendChild(el("span", "speaker", "店員"));
      head.appendChild(speakRow(entry.line));
      li.appendChild(head);
      li.appendChild(T.line(entry.line));
      entry.replies.forEach(function (r) { li.appendChild(replyBlock(r)); });
      ol.appendChild(li);
    });
    sheet.appendChild(ol);

    sheet.appendChild(el("h2", "sheet__h", "下一輪的難度"));
    sheet.appendChild(levelPicker());
    var row = el("div", "row row--center");
    row.appendChild(onceButton("再玩一次", "btn btn--primary", startRound));
    sheet.appendChild(row);

    sheet.hidden = false;
    sheet.scrollTop = 0;
  }

  /* ---------- 上方工具列 ---------- */

  var modeSeg = $("mode");

  function syncMode() {
    Array.prototype.forEach.call(modeSeg.querySelectorAll("button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.mode === T.getMode()));
    });
  }

  function setupTopbar() {
    var seg = modeSeg;
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      T.setMode(b.dataset.mode);
      syncMode();
    });
    T.setMode(T.getMode());
    syncMode();

    var sound = $("sound");
    function syncSound() {
      var on = S.isEnabled();
      sound.innerHTML = on ? ICONS.sound : ICONS.mute;
      sound.setAttribute("aria-pressed", String(on));
      sound.setAttribute("aria-label", on ? "發音：開（點一下關掉）" : "發音：關（點一下打開）");
    }
    sound.addEventListener("click", function () {
      S.setEnabled(!S.isEnabled());
      syncSound();
    });
    syncSound();
  }

  /* ---------- 開始 ---------- */

  /* 給 edit.js（?edit）用 */
  window.TravelGame = { scene: scene, stage: stage, canvas: canvas, showImage: showImage, zoom: zoom };

  try {
    state.level = Number(localStorage.getItem(LEVEL_KEY)) || 1;
  } catch (e) { /* 讀不到就從入門開始 */ }
  setupTopbar();
  setLevel(state.level, false);
  showTitle();

  if (/[?&]edit\b/.test(location.search)) {
    var s = document.createElement("script");
    s.src = "js/edit.js";
    document.body.appendChild(s);
  }
})();
