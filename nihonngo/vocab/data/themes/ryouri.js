/* ============================================================
   ryouri.js ─ 主題「料理のしかた（りょうりの しかた）」的內容（套圖卡模板）
   ------------------------------------------------------------
   ★ 草稿（status: draft）：字表、分類、例句都是 Claude 整理的，等老師確認。
   寫法跟 tabemono.js 一樣，一行一個字：
     W(id, 寫法, 讀法, 暫代圖, [意思 繁,简,英,韓], [例句, 例句讀法, [翻譯 繁,简,英,韓]], 補充)
   補充的 near：意思很近、只看一張圖分不出來的字，出題時不會拿來當彼此的錯誤選項。
   ============================================================ */
(function () {
  "use strict";

  var T = {
    status: "draft",

    groups: [
      { id: "prep", ja: "準備", kana: "じゅんび", emo: "🔪", name: { hant: "準備", hans: "准备", en: "Prep", ko: "손질" } },
      { id: "heat", ja: "火を使う", kana: "ひを つかう", emo: "🔥", name: { hant: "開火煮", hans: "开火煮", en: "With heat", ko: "불로 조리" } },
      { id: "temp", ja: "温度", kana: "おんど", emo: "🧊", name: { hant: "加熱・冰鎮", hans: "加热・冰镇", en: "Warm & chill", ko: "데우기·식히기" } }
    ],

    items: [],

    text: {
      rulesTitle: { hant: "看圖的三個重點", hans: "看图的三个重点", en: "Three things to notice", ko: "그림을 볼 때 세 가지" },
      rules: [
        { hant: "**選分類**：準備（洗、切）、開火煮（烤、炸、炒）、加熱・冰鎮", hans: "**选分类**：准备（洗、切）、开火煮（烤、炸、炒）、加热・冰镇", en: "**Pick a group**: prep (wash, cut), cooking with heat (grill, fry), warming and chilling", ko: "**분류 선택**: 손질(씻기·썰기), 불로 조리(굽기·튀기기·볶기), 데우기·식히기" },
        { hant: "**紅色的字中文分不出來**：中文都說「煮」，日文分成 煮る（加調味料）、ゆでる（清水）、沸かす（燒開水）；烤、煎、燒常常都是 焼く", hans: "**红色的字中文分不出来**：中文都说“煮”，日文分成 煮る（加调料）、ゆでる（清水）、沸かす（烧开水）；烤、煎、烧常常都是 焼く", en: "**Red words split one idea into several**: 煮る (simmer in broth), ゆでる (boil in water), 沸かす (boil water); 焼く covers grilling, baking and pan-frying", ko: "**빨간 단어는 헷갈리기 쉬워요**: 煮る(양념해서 조리다), ゆでる(맹물에 삶다), 沸かす(물을 끓이다), 焼く(굽다·부치다)" },
        { hant: "**食譜用「て形」把步驟連起來**：洗って、切って、炒めます", hans: "**食谱用「て形」把步骤连起来**：洗って、切って、炒めます", en: "**Recipes chain steps with the て-form**: 洗って、切って、炒めます", ko: "**레시피는 て형으로 순서를 이어요**: 洗って、切って、炒めます" }
      ],
      tip: {
        hant: "看到「焼き」就知道是用火做的：焼き肉（烤肉）、焼き魚（烤魚）、目玉焼き（荷包蛋）、たこ焼き。",
        hans: "看到「焼き」就知道是用火做的：焼き肉（烤肉）、焼き魚（烤鱼）、目玉焼き（荷包蛋）、たこ焼き。",
        en: "焼き in a dish name means it was cooked over heat: 焼き肉, 焼き魚, 目玉焼き (fried egg), たこ焼き.",
        ko: "요리 이름에 焼き가 있으면 불에 구운 거예요: 焼き肉, 焼き魚, 目玉焼き(계란 프라이), たこ焼き."
      },
      trapTag: { hant: "紅色＝中文分不出來", hans: "红色＝中文分不出来", en: "Red = easy to mix up", ko: "빨간색 = 헷갈리기 쉬움" }
    }
  };

  function W(id, ja, kana, emo, mean, ex, more) {
    var it = { id: id, ja: ja, kana: kana, group: W.group, emo: emo, img: null,
      mean: { hant: mean[0], hans: mean[1], en: mean[2], ko: mean[3] },
      phrases: [{ ja: ex[0], kana: ex[1], tr: { hant: ex[2][0], hans: ex[2][1], en: ex[2][2], ko: ex[2][3] } }] };
    if (more) Object.keys(more).forEach(function (k) {
      var v = more[k];
      it[k] = Array.isArray(v) && k !== "near" ? { hant: v[0], hans: v[1], en: v[2], ko: v[3] } : v;
    });
    T.items.push(it);
  }

  /* ---------- 準備 ---------- */
  W.group = "prep";
  W("arau", "洗う", "あらう", "🫧", ["洗", "洗", "to wash", "씻다"],
    ["野菜を洗って、切ります", "やさいを あらって、きります", ["青菜洗好再切", "青菜洗好再切", "Wash the vegetables, then cut them", "채소를 씻어서 썰어요"]]);
  W("muku", "むく", "むく", "🍌", ["剝、削（皮）", "剥、削（皮）", "to peel", "껍질을 벗기다·깎다"],
    ["りんごの皮をむきます", "りんごの かわを むきます", ["削蘋果皮", "削苹果皮", "I peel the apple", "사과 껍질을 깎아요"]]);
  W("kiru", "切る", "きる", "🔪", ["切", "切", "to cut", "자르다·썰다"],
    ["玉ねぎを切って、炒めます", "たまねぎを きって、いためます", ["洋蔥切好再炒", "洋葱切好再炒", "Cut the onion, then stir-fry it", "양파를 썰어서 볶아요"]],
    { note: ["長得像一段動詞，其實是五段：切ります、切って。「着る（穿）」也念きる，那個才是一段：着ます、着て。", "长得像一段动词，其实是五段：切ります、切って。「着る（穿）」也读きる，那个才是一段：着ます、着て。", "Looks like a る-verb but conjugates as a u-verb: 切ります, 切って. 着る (to wear) is the る-verb: 着ます, 着て.", "る동사처럼 보이지만 5단 동사예요: 切ります, 切って. 着る(입다)가 1단 동사: 着ます, 着て."] });
  W("mazeru", "混ぜる", "まぜる", "🥣", ["攪拌、拌", "搅拌、拌", "to mix, to stir", "섞다·젓다"],
    ["卵をよく混ぜます", "たまごを よく まぜます", ["把蛋充分攪拌", "把蛋充分搅拌", "Beat the eggs well", "달걀을 잘 섞어요"]]);

  /* ---------- 開火煮 ---------- */
  W.group = "heat";
  W("yaku", "焼く", "やく", "🍳", ["烤、煎、燒", "烤、煎、烧", "to grill, bake, pan-fry", "굽다·부치다"],
    ["魚を焼きます", "さかなを やきます", ["烤魚", "烤鱼", "I grill the fish", "생선을 구워요"]],
    { trap: true, near: ["itameru"], note: ["中文的烤、煎、燒，日文常常都是「焼く」：焼き肉（烤肉）、目玉焼き（荷包蛋）。連「焼きそば」都是炒麵。", "中文的烤、煎、烧，日文常常都是「焼く」：焼き肉（烤肉）、目玉焼き（荷包蛋）。连「焼きそば」都是炒面。", "焼く covers grilling, baking and pan-frying: 焼き肉 (grilled meat), 目玉焼き (fried egg), even 焼きそば (fried noodles).", "焼く는 굽기·부치기를 다 포함해요: 焼き肉(고기구이), 目玉焼き(계란 프라이), 焼きそば(볶음면)까지."] });
  W("niru", "煮る", "にる", "🍲", ["燉、滷（加調味料慢慢煮）", "炖、卤（加调料慢慢煮）", "to simmer (in a seasoned broth)", "조리다·끓이다 (양념해서)"],
    ["肉じゃがを煮ます", "にくじゃがを にます", ["煮一鍋馬鈴薯燉肉", "炖一锅土豆炖肉", "I simmer nikujaga (meat and potatoes)", "니쿠자가를 조려요"]],
    { trap: true, near: ["yuderu", "wakasu"], note: ["中文都說「煮」，日文分開：加醬油、糖慢慢煮入味是「煮る」，用清水燙熟是「ゆでる」。", "中文都说“煮”，日文分开：加酱油、糖慢慢煮入味是「煮る」，用清水煮熟是「ゆでる」。", "煮る means cooking in a seasoned broth; boiling in plain water is ゆでる.", "양념한 국물에 조리는 건 煮る, 맹물에 삶는 건 ゆでる예요."] });
  W("yuderu", "ゆでる", "ゆでる", "🥚", ["（用清水）燙、水煮", "（用清水）焯、水煮", "to boil (in plain water)", "삶다·데치다"],
    ["卵をゆでます", "たまごを ゆでます", ["煮水煮蛋", "煮水煮蛋", "I boil an egg", "달걀을 삶아요"]],
    { trap: true, near: ["niru", "wakasu"], note: ["用清水煮熟是「ゆでる」：ゆで卵（水煮蛋）、パスタをゆでる。加調味料煮是「煮る」。", "用清水煮熟是「ゆでる」：ゆで卵（水煮蛋）、パスタをゆでる。加调料煮是「煮る」。", "Boiling in plain water: ゆで卵 (boiled egg), パスタをゆでる. Cooking in broth is 煮る.", "맹물에 삶는 건 ゆでる: ゆで卵(삶은 달걀), パスタをゆでる. 양념해서 조리면 煮る."] });
  W("ageru", "揚げる", "あげる", "🍤", ["炸", "炸", "to deep-fry", "튀기다"],
    ["えびを揚げます", "えびを あげます", ["炸蝦", "炸虾", "I deep-fry shrimp", "새우를 튀겨요"]],
    { note: ["「あげる」也是「給」的意思（友だちにあげる），寫成漢字「揚げる」就分得出來。", "「あげる」也是“给”的意思（友だちにあげる），写成汉字「揚げる」就分得出来。", "あげる also means to give (友だちにあげる); the kanji 揚げる tells them apart.", "あげる는 '주다'라는 뜻도 있어요(友だちにあげる). 한자 揚げる로 구별해요."] });
  W("itameru", "炒める", "いためる", "🥘", ["炒", "炒", "to stir-fry", "볶다"],
    ["野菜を炒めます", "やさいを いためます", ["炒青菜", "炒青菜", "I stir-fry the vegetables", "채소를 볶아요"]],
    { near: ["yaku"] });
  W("musu", "蒸す", "むす", "🥟", ["蒸", "蒸", "to steam", "찌다"],
    ["肉まんを蒸します", "にくまんを むします", ["蒸肉包", "蒸肉包", "I steam the meat buns", "고기만두를 쪄요"]],
    { note: ["「蒸し暑い（むしあつい）」是悶熱，像在蒸籠裡一樣。", "「蒸し暑い（むしあつい）」是闷热，像在蒸笼里一样。", "蒸し暑い means hot and humid, like being in a steamer.", "蒸し暑い는 찜통처럼 후텁지근하다는 뜻이에요."] });
  W("wakasu", "沸かす", "わかす", "🫖", ["燒（開水）", "烧（开水）", "to boil (water)", "(물을) 끓이다"],
    ["お湯を沸かします", "おゆを わかします", ["燒開水", "烧开水", "I boil some water", "물을 끓여요"]],
    { trap: true, near: ["niru", "yuderu"], note: ["燒開水是「お湯を沸かす」，不是「焼く」。洗澡水也用它：お風呂を沸かす。", "烧开水是「お湯を沸かす」，不是「焼く」。洗澡水也用它：お風呂を沸かす。", "Boiling water is お湯を沸かす. It's also used for running a hot bath: お風呂を沸かす.", "물을 끓이는 건 お湯を沸かす. 목욕물을 데울 때도 써요: お風呂を沸かす."] });

  /* ---------- 加熱・冰鎮 ---------- */
  W.group = "temp";
  W("atatameru", "温める", "あたためる", "♨️", ["加熱、熱一下", "加热、热一下", "to heat up, to warm", "데우다"],
    ["電子レンジで温めます", "でんしレンジで あたためます", ["用微波爐加熱", "用微波炉加热", "I heat it in the microwave", "전자레인지로 데워요"]],
    { note: ["便利商店店員常問：「お弁当、温めますか」。", "便利店店员常问：「お弁当、温めますか」。", "Convenience store staff ask: 「お弁当、温めますか」.", "편의점 점원이 자주 물어요: 「お弁当、温めますか」."] });
  W("hiyasu", "冷やす", "ひやす", "🧊", ["冰（放冰箱）、冷卻", "冰镇、冷却", "to chill, to cool", "차게 하다·식히다"],
    ["ビールを冷やします", "ビールを ひやします", ["把啤酒冰起來", "把啤酒冰起来", "I chill the beer", "맥주를 차게 해요"]]);

  /* 要預先生成音檔的：每個字、例句（都用假名送，避免念錯） */
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  T.clips = [];
  T.items.forEach(function (it, i) {
    T.clips.push({ id: "w" + pad(i + 1), label: it.ja, text: it.kana });
    it.phrases.forEach(function (p, j) { T.clips.push({ id: "p" + pad(i + 1) + "_" + (j + 1), label: p.ja, text: p.kana }); });
  });

  window.VOCAB_THEMES = window.VOCAB_THEMES || {};
  window.VOCAB_THEMES.ryouri = T;
})();
