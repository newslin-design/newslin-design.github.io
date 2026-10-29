/* ============================================================
   speech.js ─ 發音
   ------------------------------------------------------------
   資料有 audio（錄好的音檔）就放音檔；沒有就查 audio/index.js（Gemini 預先生成的音檔，
   用文字找：店員的話在 clerk、你的回應在 you）；都沒有才用瀏覽器內建的日文語音。
   音檔用 vocab/tools/make-audio.js --app travel 生成，加了台詞重跑就會接上，資料不用填 audio。
   say() 回傳 Promise，念完（或念不出來）就 resolve，流程可以等它。
   之後換成老師的錄音，只要在資料裡填 audio，這個檔案不用改。
   ============================================================ */
(function () {
  "use strict";

  var synth = window.speechSynthesis || null;
  var SOUND_KEY = "travel.sound";
  var enabled = true;
  var voices = { main: null, alt: null };
  var utter = null;   // 留著參照，避免 Chrome 把念到一半的語音回收掉
  var audio = null;
  var rate = 1;       // 難度決定的語速（只影響瀏覽器語音；音檔照錄好的速度放）

  /* 有好幾個日文語音時的偏好順序（Edge 的 Nanami、Chrome 的 Google、蘋果的 Kyoko…） */
  var PREFER = [/Nanami/i, /Google/i, /Kyoko/i, /O-?ren/i, /Haruka/i, /Ayumi/i, /Ichiro/i];

  try {
    enabled = localStorage.getItem(SOUND_KEY) !== "off";
  } catch (e) { /* 讀不到就用預設：開 */ }

  function rank(v) {
    for (var i = 0; i < PREFER.length; i++) {
      if (PREFER[i].test(v.name)) return i;
    }
    return PREFER.length;
  }

  function pickVoices() {
    if (!synth) return;
    var ja = synth.getVoices().filter(function (v) {
      return /^ja([-_]|$)/i.test(v.lang);
    });
    ja.sort(function (a, b) { return rank(a) - rank(b); });
    voices.main = ja[0] || null;
    voices.alt = ja[1] || ja[0] || null;
  }

  /** 語音清單是非同步載入的：等它載好（最多 1.5 秒） */
  function ready() {
    return new Promise(function (resolve) {
      if (!synth) { resolve(); return; }
      pickVoices();
      if (voices.main) { resolve(); return; }
      var timer = setTimeout(done, 1500);
      synth.addEventListener("voiceschanged", done);
      function done() {
        clearTimeout(timer);
        synth.removeEventListener("voiceschanged", done);
        pickVoices();
        resolve();
      }
    });
  }

  function stop() {
    if (synth) synth.cancel();
    if (audio) {
      audio.pause();
      audio = null;
    }
  }

  /** 預先生成的音檔：你的回應先找 you，其他先找 clerk，這一套沒有就找另一套 */
  function lookup(item, alt) {
    var all = window.TRAVEL_AUDIO || {};
    var text = window.TravelText.plain(item.ja);
    return (all[alt ? "you" : "clerk"] || {})[text] || (all[alt ? "clerk" : "you"] || {})[text] || null;
  }

  /**
   * 念一句。item 可以是單字或台詞（{ ja, tts?, audio? }）。
   *   opts.slow：慢速　opts.alt：你的回應（換一個聲音）
   * 回傳 Promise；最多等到估計的長度，避免語音沒反應時流程卡住。
   */
  function say(item, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      if (!enabled || !item) { resolve(); return; }
      var busy = synth && (synth.speaking || synth.pending);
      stop();

      var text = item.tts || window.TravelText.plain(item.ja);
      var speed = opts.slow ? Math.min(0.7, rate * 0.75) : rate;
      var finished = false;
      var timer = setTimeout(finish, (1500 + text.length * 260) / speed);
      function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        resolve();
      }

      var src = item.audio || lookup(item, opts.alt);
      if (src) {
        audio = new Audio(src);
        audio.playbackRate = opts.slow ? 0.75 : 1;
        audio.onended = finish;
        audio.onerror = finish;
        audio.play().catch(finish);
        return;
      }

      if (!synth) { finish(); return; }
      pickVoices();   // 有些瀏覽器第一次拿不到清單，這裡再試一次
      if (!voices.main) { finish(); return; }

      var u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.voice = opts.alt ? voices.alt : voices.main;
      u.rate = speed;
      /* 你的回應：有第二個日文語音就換人念，沒有就把音調拉高一點來區分 */
      u.pitch = opts.alt && voices.alt === voices.main ? 1.25 : 1;
      u.onend = finish;
      u.onerror = finish;
      utter = u;
      /* Chrome：剛 cancel 完馬上 speak 有時會被吃掉，正在念的時候稍等一下再念 */
      if (busy) setTimeout(function () { synth.speak(utter); }, 80);
      else synth.speak(u);
    });
  }

  /** iPhone：第一次發音一定要發生在點擊裡。在按鈕裡先念一個聽不到的空白 */
  function unlock() {
    if (!synth || !enabled) return;
    try {
      var u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      synth.speak(u);
    } catch (e) { /* 不支援就算了 */ }
  }

  function setEnabled(v) {
    enabled = !!v;
    if (enabled) unlock();
    else stop();
    try {
      localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
    } catch (e) { /* 存不了也沒關係 */ }
  }

  window.TravelSpeech = {
    say: say,
    stop: stop,
    ready: ready,
    unlock: unlock,
    setEnabled: setEnabled,
    setRate: function (r) { rate = r || 1; },
    isEnabled: function () { return enabled; },
    hasJapanese: function () { return !!voices.main; },
    /** 有沒有預先生成的音檔（有的話，沒有日文語音也聽得到） */
    hasAudio: function () { return Object.keys((window.TRAVEL_AUDIO || {}).clerk || {}).length > 0; },
    /** 這句聽得到嗎（有音檔，或瀏覽器有日文語音） */
    canHear: function (item) { return !!(item && (item.audio || lookup(item))) || !!voices.main; }
  };
})();
