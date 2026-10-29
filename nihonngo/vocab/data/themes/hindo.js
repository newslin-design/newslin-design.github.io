/* ============================================================
   hindo.js ─ 主題「頻度」的內容（套刻度模板）
   ------------------------------------------------------------
   ★ 草稿（status: draft）：字表、位置、例句都是 Claude 依 Lin 的表整理的，等老師確認。
     跟 Lin 原表不同的地方：あまり〜ない 從「程度」欄移過來（25%）、めったに〜ない 20% → 12%。
     しょっちゅう 照原表放 100%，一般多當成 85〜90%，也請老師看。
   位置 pos 是「大概多常」（0〜100），相鄰的字本來就分不太開，遊戲只拿相差 15 以上的字來比。
   nai: true ＝ 後面一定要接否定（直尺上標紅）。
   ex ＝ 例句：ja 是正確的句子，alt 是動詞肯定／否定相反的句子（「〜ない 陷阱」的錯誤選項），
        hl 是例句裡要標色的動詞，tr 是四種母語的意思。
   說明文字的寫法：**粗體**；假名會自動換成教科書體；{w} 會換成那個字。
   ============================================================ */
(function () {
  "use strict";

  var T = {
    status: "draft",

    items: [
      { id: "itsumo", ja: "いつも", pos: 100, level: 1,
        mean: { hant: "總是", hans: "总是", en: "always", ko: "항상" },
        ex: { ja: "わたしは いつも コーヒーを のみます。", alt: "わたしは いつも コーヒーを のみません。", hl: "のみます",
              tr: { hant: "我總是喝咖啡。", hans: "我总是喝咖啡。", en: "I always drink coffee.", ko: "저는 항상 커피를 마셔요." } } },
      { id: "shocchuu", ja: "しょっちゅう", pos: 100, level: 2,
        mean: { hant: "老是、三天兩頭", hans: "老是、三天两头", en: "all the time", ko: "툭하면, 늘" },
        ex: { ja: "あの ひとは しょっちゅう ちこくします。", alt: "あの ひとは しょっちゅう ちこくしません。", hl: "ちこくします",
              tr: { hant: "那個人老是遲到。", hans: "那个人老是迟到。", en: "That person is late all the time.", ko: "저 사람은 툭하면 지각해요." } } },
      { id: "taitei", ja: "たいてい", pos: 85, level: 2,
        mean: { hant: "通常、大多", hans: "通常、大多", en: "usually", ko: "대개" },
        ex: { ja: "あさごはんは たいてい パンです。", alt: "あさごはんは たいてい パンでは ありません。", hl: "パンです",
              tr: { hant: "早餐通常是麵包。", hans: "早餐通常是面包。", en: "Breakfast is usually bread.", ko: "아침은 대개 빵이에요." } } },
      { id: "tabitabi", ja: "たびたび", pos: 70, level: 2,
        mean: { hant: "一再、屢次", hans: "一再、屡次", en: "again and again", ko: "자꾸, 여러 번" },
        ex: { ja: "かれから たびたび でんわが かかってきます。", alt: "かれから たびたび でんわが かかってきません。", hl: "かかってきます",
              tr: { hant: "他一再打電話來。", hans: "他一再打电话来。", en: "He calls me again and again.", ko: "그에게서 자꾸 전화가 와요." } } },
      { id: "shibashiba", ja: "しばしば", pos: 70, level: 2,
        mean: { hant: "時常（書面語）", hans: "时常（书面语）", en: "frequently (written)", ko: "종종 (문어)" },
        ex: { ja: "この みちでは しばしば じこが おきます。", alt: "この みちでは しばしば じこが おきません。", hl: "おきます",
              tr: { hant: "這條路上時常發生事故。", hans: "这条路上时常发生事故。", en: "Accidents often happen on this road.", ko: "이 길에서는 종종 사고가 나요." } } },
      { id: "yoku", ja: "よく", pos: 60, level: 1,
        mean: { hant: "常常", hans: "常常", en: "often", ko: "자주" },
        ex: { ja: "わたしは よく コーヒーを のみます。", alt: "わたしは よく コーヒーを のみません。", hl: "のみます",
              tr: { hant: "我常常喝咖啡。", hans: "我常常喝咖啡。", en: "I often drink coffee.", ko: "저는 자주 커피를 마셔요." } } },
      { id: "tokidoki", ja: "ときどき", pos: 50, level: 1,
        mean: { hant: "有時候", hans: "有时候", en: "sometimes", ko: "가끔" },
        ex: { ja: "わたしは ときどき コーヒーを のみます。", alt: "わたしは ときどき コーヒーを のみません。", hl: "のみます",
              tr: { hant: "我有時候喝咖啡。", hans: "我有时候喝咖啡。", en: "I sometimes drink coffee.", ko: "저는 가끔 커피를 마셔요." } } },
      { id: "tamani", ja: "たまに", pos: 40, level: 1,
        mean: { hant: "偶爾", hans: "偶尔", en: "once in a while", ko: "이따금" },
        ex: { ja: "わたしは たまに コーヒーを のみます。", alt: "わたしは たまに コーヒーを のみません。", hl: "のみます",
              tr: { hant: "我偶爾喝咖啡。", hans: "我偶尔喝咖啡。", en: "I drink coffee once in a while.", ko: "저는 이따금 커피를 마셔요." } } },
      { id: "amari", ja: "あまり〜ない", pos: 25, level: 1, nai: true,
        mean: { hant: "不太常", hans: "不太常", en: "not very often", ko: "별로 ~지 않다" },
        ex: { ja: "わたしは あまり コーヒーを のみません。", alt: "わたしは あまり コーヒーを のみます。", hl: "のみません",
              tr: { hant: "我不太常喝咖啡。", hans: "我不太常喝咖啡。", en: "I don't drink coffee very often.", ko: "저는 커피를 별로 안 마셔요." } } },
      { id: "mettani", ja: "めったに〜ない", pos: 12, level: 2, nai: true,
        mean: { hant: "很少、難得", hans: "很少、难得", en: "rarely", ko: "좀처럼 ~지 않다" },
        ex: { ja: "かれは めったに おこりません。", alt: "かれは めったに おこります。", hl: "おこりません",
              tr: { hant: "他很少生氣。", hans: "他很少生气。", en: "He rarely gets angry.", ko: "그는 좀처럼 화내지 않아요." } } },
      { id: "zenzen", ja: "ぜんぜん〜ない", pos: 0, level: 1, nai: true,
        mean: { hant: "完全不、從來不", hans: "完全不、从来不", en: "never, not at all", ko: "전혀 ~지 않다" },
        ex: { ja: "わたしは ぜんぜん コーヒーを のみません。", alt: "わたしは ぜんぜん コーヒーを のみます。", hl: "のみません",
              tr: { hant: "我完全不喝咖啡。", hans: "我完全不喝咖啡。", en: "I never drink coffee.", ko: "저는 커피를 전혀 안 마셔요." } } }
    ],

    text: {
      rulesTitle: { hant: "看直尺的兩個重點", hans: "看直尺的两个重点", en: "Two things to notice", ko: "자를 볼 때 두 가지" },
      rules: [
        { hant: "**越上面越常**：100% 是每次都這樣，0% 是從來不", hans: "**越上面越常**：100% 是每次都这样，0% 是从来不", en: "**Higher means more often**: 100% is every time, 0% is never", ko: "**위로 갈수록 자주**: 100%는 매번, 0%는 한 번도 안 함" },
        { hant: "**紅色的字後面一定要接否定**：あまり〜ない、めったに〜ない、ぜんぜん〜ない", hans: "**红色的字后面一定要接否定**：あまり〜ない、めったに〜ない、ぜんぜん〜ない", en: "**Red words always take a negative**: あまり〜ない, めったに〜ない, ぜんぜん〜ない", ko: "**빨간 단어 뒤에는 꼭 부정이 와요**: あまり〜ない, めったに〜ない, ぜんぜん〜ない" }
      ],
      tip: {
        hant: "中文說「很少去」不用否定，日文卻要說「めったに いきません」。位置是大概的感覺，相鄰的字不用分得太細。",
        hans: "中文说「很少去」不用否定，日文却要说「めったに いきません」。位置是大概的感觉，相邻的字不用分得太细。",
        en: "English \"rarely\" has no \"not\", but Japanese needs one: 「めったに いきません」. The positions are approximate, so neighbors don't need to be told apart.",
        ko: "우리말 \"좀처럼 안 가요\"처럼 일본어도 부정이 필요해요: 「めったに いきません」. 위치는 대략적인 느낌이라 이웃한 단어는 너무 신경 쓰지 않아도 돼요."
      },
      naiNeed: { hant: "「{w}」後面一定要接否定（〜ません／〜ない）。", hans: "「{w}」后面一定要接否定（〜ません／〜ない）。", en: "「{w}」 always takes a negative (〜ません / 〜ない).", ko: "「{w}」 뒤에는 꼭 부정(〜ません/〜ない)이 와요." },
      posNeed: { hant: "這句的意思是肯定的，所以用肯定形（〜ます／〜です）。", hans: "这句的意思是肯定的，所以用肯定形（〜ます／〜です）。", en: "The meaning is positive, so keep it positive (〜ます / 〜です).", ko: "뜻이 긍정이니까 긍정형(〜ます/〜です)을 써요." }
    }
  };

  /* 要預先生成音檔的：每個字（不念〜ない）和例句 */
  T.clips = [];
  T.items.forEach(function (it, i) {
    var n = i < 9 ? "0" + (i + 1) : String(i + 1);
    T.clips.push({ id: "w" + n, label: it.ja, text: it.ja.replace("〜ない", "") });
  });
  T.items.forEach(function (it, i) {
    var n = i < 9 ? "0" + (i + 1) : String(i + 1);
    T.clips.push({ id: "e" + n, label: it.ja + "（例句）", text: it.ex.ja });
  });

  window.VOCAB_THEMES = window.VOCAB_THEMES || {};
  window.VOCAB_THEMES.hindo = T;
})();
