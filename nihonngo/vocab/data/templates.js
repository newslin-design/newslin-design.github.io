/* ============================================================
   templates.js ─ 模板清單（首頁的「模板一覽」和主題卡片的縮圖讀這裡）
   ------------------------------------------------------------
   模板 = 畫面長什麼樣子、怎麼玩；主題 = 套進模板的內容。
   ready: true 的模板在 js/templates/<id>.js 有實作，其他是規劃中。
   ============================================================ */
(function () {
  "use strict";

  function svg(body) {
    return '<svg viewBox="0 0 64 48" aria-hidden="true">' + body + "</svg>";
  }

  /* 月曆縮圖：4×3 的格子，前幾格畫紅圈（特別讀法） */
  var calendar = '<rect x="5" y="5" width="54" height="38" rx="5" class="bx"/>';
  for (var j = 0; j < 3; j++) {
    for (var i = 0; i < 4; i++) {
      var x = 15 + i * 11.5, y = 15 + j * 10, id = j * 4 + i;
      calendar += [0, 1, 2, 5].indexOf(id) >= 0
        ? '<circle cx="' + x + '" cy="' + y + '" r="3.6" class="rg"/>'
        : '<circle cx="' + x + '" cy="' + y + '" r="1.8" class="dt"/>';
    }
  }

  window.VOCAB_TEMPLATES = {
    calendar: {
      ready: true,
      svg: svg(calendar),
      name: { hant: "月曆", hans: "月历", en: "Calendar", ko: "달력" },
      desc: { hant: "日期專用：特別讀法直接標在月曆上", hans: "日期专用：特别读法直接标在月历上", en: "For dates: special readings are marked on the calendar", ko: "날짜 전용: 특별한 읽기를 달력 위에 표시" }
    },
    picture: {
      ready: true,
      svg: svg('<rect x="5" y="5" width="54" height="38" rx="5" class="bx"/><circle cx="21" cy="15" r="5" class="ln"/><rect x="15" y="21" width="12" height="16" rx="4" class="ln"/><path d="M26 14 37 11M27 27 37 26M22 37 37 37" class="ln"/><rect x="37" y="8" width="16" height="6" rx="3" class="acs"/><rect x="37" y="23" width="13" height="6" rx="3" class="acs"/><rect x="37" y="34" width="17" height="6" rx="3" class="acs"/>'),
      name: { hant: "一圖多詞", hans: "一图多词", en: "One picture, many words", ko: "그림 하나, 단어 여럿" },
      desc: { hant: "一張圖標出很多單字，例如身體部位", hans: "一张图标出很多单词，例如身体部位", en: "Many words labeled on one picture, like body parts", ko: "그림 한 장에 여러 단어를 표시 (예: 신체 부위)" }
    },
    imageCard: {
      ready: true,
      svg: svg('<rect x="10" y="4" width="44" height="26" rx="4" class="bx"/><circle cx="43" cy="12" r="3.5" class="ac"/><path d="M14 27 25 15 33 23 38 18 50 27" class="ln"/><rect x="10" y="34" width="30" height="4" rx="2" class="bar"/><rect x="10" y="41" width="20" height="3.5" rx="1.75" class="bar"/>'),
      name: { hant: "圖卡", hans: "图卡", en: "Picture cards", ko: "그림 카드" },
      desc: { hant: "一個單字配一張圖", hans: "一个单词配一张图", en: "One picture for each word", ko: "단어마다 그림 한 장" }
    },
    text: {
      svg: svg('<rect x="5" y="5" width="54" height="38" rx="5" class="bx"/><rect x="11" y="11" width="26" height="6" rx="3" class="ac"/><rect x="11" y="22" width="42" height="3.5" rx="1.75" class="bar"/><rect x="11" y="29" width="36" height="3.5" rx="1.75" class="bar"/><rect x="11" y="36" width="24" height="3.5" rx="1.75" class="bar"/>'),
      name: { hant: "文字卡", hans: "文字卡", en: "Text cards", ko: "텍스트 카드" },
      desc: { hant: "單字加例句，適合畫不出來的詞", hans: "单词加例句，适合画不出来的词", en: "Word plus example sentence, for words you can't draw", ko: "단어와 예문. 그림으로 나타내기 어려운 단어에 적합" }
    },
    video: {
      svg: svg('<rect x="5" y="4" width="54" height="30" rx="5" class="bx"/><path d="M28 12 39 19 28 26Z" class="ac"/><path d="M6 41H58" class="ln"/><circle cx="16" cy="41" r="2.6" class="ac"/><circle cx="31" cy="41" r="2.6" class="ac"/><circle cx="47" cy="41" r="2.6" class="ac"/>'),
      name: { hant: "影片", hans: "视频", en: "Video", ko: "영상" },
      desc: { hant: "一段影片學很多單字，點單字跳到那一秒", hans: "一段视频学很多单词，点单词跳到那一秒", en: "Many words in one video. Tap a word to jump to that moment", ko: "영상 하나로 여러 단어. 단어를 누르면 그 장면으로 이동" }
    },
    scale: {
      ready: true,
      svg: svg('<path d="M6 34H58M6 30V38M32 30V38M58 30V38" class="ln"/><rect x="6" y="18" width="14" height="7" rx="3.5" class="acs"/><rect x="25" y="10" width="14" height="7" rx="3.5" class="acs"/><rect x="44" y="18" width="14" height="7" rx="3.5" class="acs"/>'),
      name: { hant: "刻度", hans: "刻度", en: "Scale", ko: "척도" },
      desc: { hant: "把頻率、程度排在一條軸上", hans: "把频率、程度排在一条轴上", en: "Frequency or degree words placed along one line", ko: "빈도·정도 단어를 하나의 축 위에 배치" }
    }
  };
})();
