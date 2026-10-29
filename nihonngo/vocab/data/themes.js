/* ============================================================
   themes.js ─ 主題目錄（首頁讀這裡，排列順序 = 首頁上的順序）
   ------------------------------------------------------------
   新增一個主題：在 data/themes/ 放 <id>.js，這裡補一行，做好了 ready 設成 true。
   template 對應 data/templates.js 裡的模板。
   ready 不是 true 的主題，首頁會顯示成「準備中」。
   img 是首頁卡片上的插畫（img/themes/，4:3）；沒有的話用模板的示意圖。
   group 是首頁上的分組（下面的 VOCAB_THEME_GROUPS），用情境分；組的順序 = 首頁上的順序，組裡照這份目錄的順序。
   ============================================================ */
window.VOCAB_THEME_GROUPS = [
  { id: "kihon", title: { hant: "每天的基本", hans: "每天的基本", en: "Everyday basics", ko: "매일의 기본" } },
  { id: "taberu", title: { hant: "吃東西", hans: "吃东西", en: "Eating", ko: "먹기" } },
  { id: "dekakeru", title: { hant: "出門", hans: "出门", en: "Going out", ko: "외출" } }
];

window.VOCAB_THEME_LIST = [
  {
    id: "hizuke", group: "kihon", template: "calendar", ja: "日付", kana: "ひづけ", ready: true, cards: 43, games: 3, img: "img/themes/hizuke.jpg",
    title: { hant: "日期", hans: "日期", en: "Dates", ko: "날짜" },
    desc: { hant: "1日到31日、12個月的讀法", hans: "1日到31日、12个月的读法", en: "How to read days 1–31 and the 12 months", ko: "1일~31일과 12개월 읽는 법" }
  },
  {
    id: "karada", group: "kihon", template: "picture", ja: "体", kana: "からだ", ready: true, cards: 30, games: 3, img: "img/themes/karada.jpg",
    title: { hant: "身體部位", hans: "身体部位", en: "Body parts", ko: "신체 부위" },
    desc: { hant: "30 個部位分基本、進階，附常用句和慣用句", hans: "30 个部位分基本、进阶，附常用句和惯用句", en: "30 body parts, basic and advanced, with phrases and idioms", ko: "신체 부위 30개(기본·심화), 자주 쓰는 표현과 관용구" }
  },
  {
    id: "hindo", group: "kihon", template: "scale", ja: "頻度", kana: "ひんど", ready: true, cards: 11, games: 3, img: "img/themes/hindo.jpg",
    title: { hant: "頻率副詞", hans: "频率副词", en: "How often", ko: "빈도 부사" },
    desc: { hant: "いつも 到 ぜんぜん，多常一看就懂", hans: "いつも 到 ぜんぜん，多常一看就懂", en: "From いつも to ぜんぜん: how often, at a glance", ko: "いつも부터 ぜんぜん까지, 얼마나 자주인지 한눈에" }
  },
  {
    id: "tabemono", group: "taberu", template: "imageCard", ja: "食べ物", kana: "たべもの", ready: true, cards: 60, games: 3, img: "img/themes/tabemono.jpg",
    title: { hant: "食物", hans: "食物", en: "Food", ko: "음식" },
    desc: { hant: "常見、水果、蔬菜、甜點、飲料，60 個字附例句", hans: "常见、水果、蔬菜、甜点、饮料，60 个字附例句", en: "Everyday food, fruit, vegetables, sweets and drinks: 60 words with examples", ko: "자주 먹는 음식·과일·채소·간식·음료, 60개 단어와 예문" }
  },
  {
    id: "ryouri", group: "taberu", template: "imageCard", ja: "料理のしかた", kana: "りょうりの しかた", ready: true, cards: 13, games: 3,
    title: { hant: "料理方式", hans: "烹饪方式", en: "Cooking", ko: "요리 방법" },
    desc: { hant: "切る、焼く、煮る、ゆでる…中文都說「煮」的，日文怎麼分", hans: "切る、焼く、煮る、ゆでる…中文都说“煮”的，日文怎么分", en: "切る, 焼く, 煮る, ゆでる: 13 cooking verbs with recipe phrases", ko: "切る, 焼く, 煮る, ゆでる… 요리 동사 13개와 예문" }
  },
  {
    id: "aji", group: "taberu", template: "imageCard", ja: "味と食感", kana: "あじと しょっかん", ready: true, cards: 20, games: 3,
    title: { hant: "味道與口感", hans: "味道与口感", en: "Taste & texture", ko: "맛과 식감" },
    desc: { hant: "甜、辣、酸，還有 サクサク、もちもち 這些口感", hans: "甜、辣、酸，还有 サクサク、もちもち 这些口感", en: "Sweet, spicy, sour, plus texture words like サクサク and もちもち", ko: "달다·맵다·시다, 그리고 サクサク, もちもち 같은 식감 표현" }
  },
  { id: "aisatsu", group: "kihon", template: "text", ja: "あいさつ", kana: "", title: { hant: "打招呼", hans: "打招呼", en: "Greetings", ko: "인사" } },
  { id: "eki", group: "dekakeru", template: "video", ja: "駅", kana: "えき", img: "img/themes/eki.jpg", title: { hant: "車站廣播", hans: "车站广播", en: "Station announcements", ko: "역 안내 방송" } }
];
