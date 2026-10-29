/* ============================================================
   speech.js ─ 發音
   ------------------------------------------------------------
   先查 audio/index.js（Gemini 預先生成的音檔，女聲 f／男聲 m 各一套）；
   目前的聲音沒有這個詞就用另一套，兩套都沒有才用瀏覽器內建的日文語音。
   寫法跟 travel/js/speech.js 一樣，差別是這裡用「文字」找音檔，
   所以資料檔不用寫檔名，tools/make-audio.js 生成完就自動接上。
   say() 可以給一個詞，也可以給一串（依序念，例如「月＋日＋星期」）。
   ============================================================ */
(function () {
  "use strict";

  var synth = window.speechSynthesis || null;
  var voice = null;
  var utter = null;   // 留著參照，避免 Chrome 把念到一半的語音回收掉
  var audio = null;
  var run = 0;        // 每次 say() 加一；舊的那串念到一半就不再往下念
  var set = "f";      // 音檔用哪一套：f = 女聲、m = 男聲

  /* 有好幾個日文語音時的偏好順序（Edge 的 Nanami、Chrome 的 Google、蘋果的 Kyoko…） */
  var PREFER = [/Nanami/i, /Google/i, /Kyoko/i, /O-?ren/i, /Haruka/i, /Ayumi/i, /Ichiro/i];

  function lookup(text) {
    var all = window.VOCAB_AUDIO || {};
    return (all[set] || {})[text] || (all[set === "f" ? "m" : "f"] || {})[text] || null;
  }

  function rank(v) {
    for (var i = 0; i < PREFER.length; i++) if (PREFER[i].test(v.name)) return i;
    return PREFER.length;
  }

  function pickVoice() {
    if (!synth) return;
    var ja = synth.getVoices().filter(function (v) { return /^ja([-_]|$)/i.test(v.lang); });
    ja.sort(function (a, b) { return rank(a) - rank(b); });
    voice = ja[0] || null;
  }

  /** 語音清單是非同步載入的：等它載好（最多 1.5 秒） */
  function ready() {
    return new Promise(function (resolve) {
      if (!synth) { resolve(); return; }
      pickVoice();
      if (voice) { resolve(); return; }
      var timer = setTimeout(done, 1500);
      synth.addEventListener("voiceschanged", done);
      function done() {
        clearTimeout(timer);
        synth.removeEventListener("voiceschanged", done);
        pickVoice();
        resolve();
      }
    });
  }

  function stop() {
    run++;
    if (synth) synth.cancel();
    if (audio) { audio.pause(); audio = null; }
  }

  /** 念一個詞，念完（或念不出來）就 resolve */
  function one(text, slow) {
    return new Promise(function (resolve) {
      var done = false;
      var timer = setTimeout(finish, (1500 + text.length * 260) * (slow ? 1.6 : 1));
      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      }

      var src = lookup(text);
      if (src) {
        audio = new Audio(src);
        audio.playbackRate = slow ? 0.8 : 1;
        audio.onended = finish;
        audio.onerror = finish;
        audio.play().catch(finish);
        return;
      }

      if (!synth) { finish(); return; }
      pickVoice();   // 有些瀏覽器第一次拿不到清單，這裡再試一次
      if (!voice) { finish(); return; }
      var busy = synth.speaking || synth.pending;
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.voice = voice;
      u.rate = slow ? 0.7 : 0.95;
      u.onend = finish;
      u.onerror = finish;
      utter = u;
      /* Chrome：剛 cancel 完馬上 speak 有時會被吃掉，正在念的時候稍等一下再念 */
      if (busy) setTimeout(function () { synth.speak(utter); }, 80);
      else synth.speak(u);
    });
  }

  function say(text, opts) {
    opts = opts || {};
    var list = Array.isArray(text) ? text : [text];
    stop();
    var me = run;
    return list.reduce(function (p, item) {
      return p.then(function () {
        if (me !== run || !item) return;
        return one(item, opts.slow);
      });
    }, Promise.resolve());
  }

  /** 這個詞聽得到嗎（有音檔，或瀏覽器有日文語音） */
  function canHear(text) {
    return !!lookup(text) || !!voice;
  }

  /** iPhone：第一次發音一定要發生在點擊裡。在按鈕裡先念一個聽不到的空白 */
  function unlock() {
    if (!synth) return;
    try {
      var u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      synth.speak(u);
    } catch (e) { /* 不支援就算了 */ }
  }

  window.VocabSpeech = {
    say: say,
    stop: stop,
    ready: ready,
    unlock: unlock,
    canHear: canHear,
    hasJapanese: function () { return !!voice; },
    hasFiles: function () {
      var all = window.VOCAB_AUDIO || {};
      return Object.keys(all).some(function (k) { return Object.keys(all[k] || {}).length > 0; });
    },
    setVoice: function (s) { set = s === "m" ? "m" : "f"; },
    getVoice: function () { return set; }
  };
})();
