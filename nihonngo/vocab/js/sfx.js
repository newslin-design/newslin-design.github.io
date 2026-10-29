/* ============================================================
   sfx.js ─ 答對、答錯、過關的音效（Web Audio 合成，不用音檔）
   ============================================================ */
(function () {
  "use strict";

  var ac = null;
  var on = true;

  function tone(freq, dur, type, when, vol) {
    if (!on) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      var t0 = ac.currentTime + (when || 0);
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.08, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.03);
    } catch (e) { /* 不支援就安靜 */ }
  }

  window.VocabSfx = {
    ok: function () { tone(880, 0.12); tone(1320, 0.16, "sine", 0.07); },
    bad: function () {
      tone(170, 0.22, "square", 0, 0.04);
      try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) { /* 沒有震動 */ }
    },
    win: function () { [660, 880, 1100, 1320].forEach(function (f, i) { tone(f, 0.2, "triangle", i * 0.09, 0.07); }); },
    setEnabled: function (v) { on = !!v; },
    isEnabled: function () { return on; }
  };
})();
