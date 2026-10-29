/* ============================================================
   steps.js ─ 結帳時的互動類型
   ------------------------------------------------------------
   這個檔案不認識任何一句台詞，全部從場景資料的 enter／checkout 讀。
   要加新的互動，就在 STEPS 裡多寫一個函式。
   每個函式拿到 (step, ui)：ui 是 game.js 給的工具，做完呼叫 ui.next()。
   ============================================================ */
(function () {
  "use strict";

  var STEPS = {

    /* 店員說一句，沒有選項（いらっしゃいませ、ありがとうございました） */
    say: function (step, ui) {
      ui.clerk(step);
      ui.react({ tip: step.tip_zh }, ui.next);
    },

    /* 店員說一句 → 你選回應 → 店員的反應／旁白／小知識（選項自己有 tip_zh 就用選項的） */
    line: function (step, ui) {
      ui.clerk(step);
      ui.choices(step.choices, function (choice) {
        ui.apply(choice);
        ui.answer(choice).then(function () {
          ui.react({ then: choice.then, narr: choice.narr_zh, tip: choice.tip_zh || step.tip_zh }, ui.next);
        });
      });
    },

    /* 店員說一句 → 出現客人用的小螢幕，要自己按（年齡確認、付款）。
       「微笑點頭」不會往下走：店員只會指一指螢幕，還是要自己按。 */
    touch: function (step, ui) {
      var pressed = false;
      ui.clerk(step);
      var picks = ui.choices(step.choices || [], function (choice) {
        ui.answer(choice).then(function () {
          if (pressed) return;
          ui.hint({ then: choice.then, narr: choice.narr_zh, hint: "請按上面的螢幕。" });
          screen.pulse();
        });
      });
      var screen = ui.screen(step.screen, function (button) {
        if (pressed) return;
        pressed = true;
        screen.close();
        picks.remove();
        ui.apply(button);
        ui.answer(button, "pressed").then(function () {
          ui.react({ narr: button.narr_zh, tip: step.tip_zh }, ui.next);
        });
      });
    }
  };

  window.STEPS = STEPS;
})();
