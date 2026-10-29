/* ============================================================
   aji.js ─ 主題「味と食感（あじと しょっかん）」的內容（套圖卡模板）
   ------------------------------------------------------------
   ★ 草稿（status: draft）：字表、分類、例句都是 Claude 整理的，等老師確認。
   寫法跟 tabemono.js 一樣，一行一個字：
     W(id, 寫法, 讀法, 暫代圖, [意思 繁,简,英,韓], [例句, 例句讀法, [翻譯 繁,简,英,韓]], 補充)
   補充的 near：意思很近、只看一張圖分不出來的字（サクサク／パリパリ／カリカリ），
   出題時不會拿來當彼此的錯誤選項。
   口感的暫代圖是「有那種口感的食物」，換 Midjourney 時可以跟食物主題共用圖。
   ============================================================ */
(function () {
  "use strict";

  var T = {
    status: "draft",

    groups: [
      { id: "taste", ja: "味", kana: "あじ", emo: "🍋", name: { hant: "味道", hans: "味道", en: "Tastes", ko: "맛" } },
      { id: "texture", ja: "食感", kana: "しょっかん", emo: "🍤", name: { hant: "口感", hans: "口感", en: "Textures", ko: "식감" } },
      { id: "feel", ja: "感想", kana: "かんそう", emo: "😋", name: { hant: "吃了覺得", hans: "吃了觉得", en: "How it is", ko: "먹어 보니" } }
    ],

    items: [],

    text: {
      rulesTitle: { hant: "看圖的三個重點", hans: "看图的三个重点", en: "Three things to notice", ko: "그림을 볼 때 세 가지" },
      rules: [
        { hant: "**選分類**：味道（甜、辣、酸）、口感（酥脆、Q彈）、吃了覺得（好吃、燙）", hans: "**选分类**：味道（甜、辣、酸）、口感（酥脆、Q弹）、吃了觉得（好吃、烫）", en: "**Pick a group**: tastes (sweet, spicy), textures (crispy, chewy), how it is (delicious, hot)", ko: "**분류 선택**: 맛(달다·맵다), 식감(바삭·쫄깃), 먹어 보니(맛있다·뜨겁다)" },
        { hant: "**紅色的字跟中文不一樣**：辛い是辣，不是辛苦；薄い說味道是淡", hans: "**红色的字跟中文不一样**：辛い是辣，不是辛苦；薄い说味道是淡", en: "**Red words are tricky kanji**: 辛い means spicy; 薄い (thin) also means weak or bland", ko: "**빨간 단어는 한자 뜻이 달라요**: 辛い는 맵다, 薄い는 맛이 싱겁다" },
        { hant: "**口感多半是重複兩次的擬態語**：接「の」形容食物（もちもちの パン），接「する」變動詞（ねばねば する）", hans: "**口感多半是重复两次的拟态语**：接「の」形容食物（もちもちの パン），接「する」变动词（ねばねば する）", en: "**Texture words are mostly doubled sound words**: add の before a food (もちもちの パン), or する to make a verb (ねばねば する)", ko: "**식감은 대부분 두 번 반복하는 의태어**: の를 붙여 음식을 꾸미고(もちもちの パン), する를 붙이면 동사(ねばねば する)" }
      ],
      tip: {
        hant: "台灣說的「Q」，日文最接近「もちもち」；像布丁那樣會抖的 Q 是「ぷるぷる」。",
        hans: "台湾说的“Q”，日文最接近「もちもち」；像布丁那样会抖的 Q 是「ぷるぷる」。",
        en: "Chewy like mochi is もちもち; wobbly like pudding is ぷるぷる.",
        ko: "쫄깃쫄깃은 もちもち, 푸딩처럼 탱글탱글 흔들리는 건 ぷるぷる예요."
      },
      trapTag: { hant: "紅色＝跟中文不一樣", hans: "红色＝跟中文不一样", en: "Red = tricky kanji", ko: "빨간색 = 한자 뜻이 다름" }
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

  /* ---------- 味道 ---------- */
  W.group = "taste";
  W("amai", "甘い", "あまい", "🍯", ["甜", "甜", "sweet", "달다"],
    ["このケーキは甘いです", "この ケーキは あまいです", ["這個蛋糕很甜", "这个蛋糕很甜", "This cake is sweet", "이 케이크는 달아요"]],
    { note: ["也有「想得太簡單」的意思：考えが甘い（想得太天真）。", "也有“想得太简单”的意思：考えが甘い（想得太天真）。", "Also means naive or too easy-going: 考えが甘い (that's wishful thinking).", "'생각이 안이하다'라는 뜻도 있어요: 考えが甘い."] });
  W("karai", "辛い", "からい", "🌶️", ["辣", "辣", "spicy, hot", "맵다"],
    ["辛いものが好きです", "からい ものが すきです", ["我喜歡吃辣", "我喜欢吃辣", "I like spicy food", "매운 음식을 좋아해요"]],
    { trap: true, note: ["中文的「辛」是辛苦，日文的「辛い（からい）」是辣。同一個漢字念「つらい」時才是難受、辛苦。", "中文的“辛”是辛苦，日文的「辛い（からい）」是辣。同一个汉字读「つらい」时才是难受、辛苦。", "辛い read からい is spicy; read つらい it means painful or hard.", "辛い를 からい로 읽으면 '맵다', つらい로 읽으면 '괴롭다'예요."] });
  W("shoppai", "しょっぱい", "しょっぱい", "🧂", ["鹹", "咸", "salty", "짜다"],
    ["このスープはしょっぱい", "この スープは しょっぱい", ["這湯好鹹", "这汤好咸", "This soup is salty", "이 수프는 짜"]],
    { note: ["關西有些人說鹹也用「からい」，在大阪聽到からい不一定是辣。", "关西有些人说咸也用「からい」，在大阪听到からい不一定是辣。", "In western Japan some people say からい for salty, too.", "간사이에서는 짤 때도 からい라고 하는 사람이 있어요."] });
  W("suppai", "すっぱい", "すっぱい", "🍋", ["酸", "酸", "sour", "시다"],
    ["梅干しはすっぱい", "うめぼしは すっぱい", ["梅乾很酸", "梅干很酸", "Pickled plums are sour", "우메보시는 시어요"]]);
  W("nigai", "苦い", "にがい", "☕", ["苦", "苦", "bitter", "쓰다"],
    ["このコーヒーは苦いです", "この コーヒーは にがいです", ["這杯咖啡很苦", "这杯咖啡很苦", "This coffee is bitter", "이 커피는 써요"]],
    { note: ["「苦手（にがて）」是不擅長、不太敢吃，也是這個「苦」。", "「苦手（にがて）」是不擅长、不太敢吃，也是这个“苦”。", "苦手 (にがて, not good with) uses the same kanji.", "苦手(にがて, 잘 못하다·잘 못 먹다)도 같은 한자예요."] });
  W("koi", "濃い", "こい", "🍵", ["（味道）濃、重", "（味道）浓、重", "strong, rich", "진하다"],
    ["味が濃いです", "あじが こいです", ["味道很重", "味道很重", "The flavor is strong", "맛이 진해요"]]);
  W("usui", "薄い", "うすい", "💧", ["（味道）淡", "（味道）淡", "weak, bland", "싱겁다·연하다"],
    ["このお茶は薄いです", "この おちゃは うすいです", ["這茶好淡", "这茶好淡", "This tea is weak", "이 차는 연해요"]],
    { trap: true, note: ["中文的「薄」是厚薄，日文的「薄い」也能說味道淡、顏色淺。", "中文的“薄”是厚薄，日文的「薄い」也能说味道淡、颜色浅。", "薄い means thin, and also weak (taste) or pale (color).", "薄い는 '얇다'뿐 아니라 맛이 싱겁거나 색이 연할 때도 써요."] });

  /* ---------- 口感 ---------- */
  W.group = "texture";
  W("sakusaku", "サクサク", "サクサク", "🍤", ["酥脆（輕輕的）", "酥脆（轻轻的）", "light and crispy", "바삭바삭 (가볍게)"],
    ["サクサクの天ぷら", "サクサクの てんぷら", ["酥酥脆脆的天婦羅", "酥酥脆脆的天妇罗", "light, crispy tempura", "바삭한 튀김"]],
    { near: ["paripari", "karikari"] });
  W("paripari", "パリパリ", "パリパリ", "🍘", ["脆脆的（薄片咬斷）", "脆脆的（薄片咬断）", "crisp, crackly (thin things)", "바삭 (얇은 것)"],
    ["パリパリののり", "パリパリの のり", ["脆脆的海苔", "脆脆的海苔", "crisp seaweed", "바삭한 김"]],
    { near: ["sakusaku", "karikari"] });
  W("karikari", "カリカリ", "カリカリ", "🍟", ["（硬硬的）脆", "（硬硬的）脆", "crunchy (hard)", "바삭 (단단한 것)"],
    ["カリカリのポテト", "カリカリの ポテト", ["酥脆的薯條", "酥脆的薯条", "crunchy fries", "바삭한 감자튀김"]],
    { near: ["sakusaku", "paripari"] });
  W("mochimochi", "もちもち", "もちもち", "🍡", ["Q彈、有嚼勁", "Q弹、有嚼劲", "chewy, bouncy", "쫄깃쫄깃"],
    ["もちもちのパン", "もちもちの パン", ["Q彈的麵包", "Q弹的面包", "chewy bread", "쫄깃한 빵"]]);
  W("fuwafuwa", "ふわふわ", "ふわふわ", "🥞", ["蓬鬆柔軟", "蓬松柔软", "fluffy", "폭신폭신"],
    ["ふわふわのホットケーキ", "ふわふわの ホットケーキ", ["蓬鬆柔軟的鬆餅", "蓬松柔软的松饼", "a fluffy pancake", "폭신한 핫케이크"]]);
  W("torotoro", "とろとろ", "とろとろ", "🧀", ["濃稠滑嫩、快化開", "浓稠滑嫩、快化开", "gooey, melty", "걸쭉·말랑 (녹아내리는)"],
    ["とろとろのチーズ", "とろとろの チーズ", ["融化牽絲的起司", "融化拉丝的芝士", "melty cheese", "녹아내리는 치즈"]]);
  W("purupuru", "ぷるぷる", "ぷるぷる", "🍮", ["Q彈會抖（像布丁）", "弹弹的会抖（像布丁）", "wobbly, jiggly", "탱글탱글"],
    ["ぷるぷるのプリン", "ぷるぷるの プリン", ["Q彈的布丁", "弹弹的布丁", "wobbly pudding", "탱글탱글한 푸딩"]]);
  W("shakishaki", "シャキシャキ", "シャキシャキ", "🥬", ["（蔬菜）爽脆", "（蔬菜）爽脆", "crisp and fresh (vegetables)", "아삭아삭"],
    ["シャキシャキのレタス", "シャキシャキの レタス", ["爽脆的萵苣", "爽脆的生菜", "crisp lettuce", "아삭한 양상추"]]);
  W("nebaneba", "ねばねば", "ねばねば", "🫘", ["黏黏的、牽絲", "黏黏的、拉丝", "sticky, slimy", "끈적끈적"],
    ["納豆はねばねばしています", "なっとうは ねばねば して います", ["納豆黏黏的", "纳豆黏黏的", "Natto is sticky", "낫토는 끈적끈적해요"]]);

  /* ---------- 吃了覺得 ---------- */
  W.group = "feel";
  W("oishii", "おいしい", "おいしい", "😋", ["好吃", "好吃", "delicious", "맛있다"],
    ["とてもおいしいです", "とても おいしいです", ["非常好吃", "非常好吃", "It's really good", "정말 맛있어요"]],
    { note: ["男生、朋友之間也常說「うまい」。", "男生、朋友之间也常说「うまい」。", "Casually (often men), people also say うまい.", "친구끼리는 うまい라고도 해요 (주로 남성)."] });
  W("mazui", "まずい", "まずい", "😖", ["難吃", "难吃", "tastes bad", "맛없다"],
    ["これ、まずい！", "これ、まずい！", ["這個好難吃！", "这个好难吃！", "This tastes awful!", "이거 맛없어!"]],
    { note: ["很直接，對做菜的人說很失禮，客氣說「ちょっと苦手です」。「まずい！」也常是「糟了！」。", "很直接，对做菜的人说很失礼，客气说「ちょっと苦手です」。「まずい！」也常是“糟了！”。", "Very blunt; politely say ちょっと苦手です. まずい！ also means \"Uh-oh!\"", "아주 직설적이라 요리한 사람에게는 실례예요. 정중하게는 ちょっと苦手です. まずい!는 '큰일 났다!'라는 뜻도 돼요."] });
  W("atsui", "熱い", "あつい", "🥵", ["燙、熱（東西）", "烫、热（东西）", "hot (to the touch)", "뜨겁다"],
    ["スープが熱いです", "スープが あついです", ["湯很燙", "汤很烫", "The soup is hot", "수프가 뜨거워요"]],
    { note: ["東西燙是「熱い」，天氣熱是「暑い」，都念あつい。", "东西烫是「熱い」，天气热是「暑い」，都读あつい。", "Hot food is 熱い; hot weather is 暑い. Both are あつい.", "음식이 뜨거운 건 熱い, 날씨가 더운 건 暑い. 둘 다 あつい."] });
  W("tsumetai", "冷たい", "つめたい", "🥶", ["冰、冷（東西）", "冰、凉（东西）", "cold (to the touch)", "차갑다"],
    ["冷たい水をください", "つめたい みずを ください", ["請給我冰水", "请给我冰水", "Cold water, please", "차가운 물 주세요"]],
    { note: ["東西冰是「冷たい」，天氣冷是「寒い（さむい）」。", "东西冰是「冷たい」，天气冷是「寒い（さむい）」。", "Cold things are 冷たい; cold weather is 寒い (さむい).", "차가운 물건은 冷たい, 추운 날씨는 寒い(さむい)."] });

  /* 要預先生成音檔的：每個字、例句（都用假名送，避免念錯） */
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  T.clips = [];
  T.items.forEach(function (it, i) {
    T.clips.push({ id: "w" + pad(i + 1), label: it.ja, text: it.kana });
    it.phrases.forEach(function (p, j) { T.clips.push({ id: "p" + pad(i + 1) + "_" + (j + 1), label: p.ja, text: p.kana }); });
  });

  window.VOCAB_THEMES = window.VOCAB_THEMES || {};
  window.VOCAB_THEMES.aji = T;
})();
