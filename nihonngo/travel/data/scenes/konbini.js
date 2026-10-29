/* 場景：便利商店（第一版）
   座標 x, y, w, h 都是「圖的百分比」。換圖只要改座標：網址加 ?edit，在圖上拖框就會顯示。
   台詞全部是 AI 草稿（status: "draft"），要請母語者確認。
   rule 標記跟規則有關的台詞，之後做資訊卡時，規則一變就能找出要改哪幾句。

   台詞變化與難度（難度的定義在 data/levels.js）：
     步驟本身那句算第 1 級；variants 裡是同一題的其他說法，各自標 lv: 2 或 3。
     variant 可以只換台詞，也可以連 choices、tip_zh 一起換（例如「よろしいですか」點頭的意思不一樣）。
     event: true 是突發狀況：要達到 when.level 的難度，再照難度的機率決定這次會不會出現。

   條件 when 有六種，全部成立才算：
     has：籃子裡有這個標籤　min：至少幾件　max：最多幾件　flag：某一題選了什麼
     none：這幾個結果都沒發生　level：至少是哪個難度

   選項的效果：set 記下選了什麼　remove 把某個標籤的商品拿掉　add 把商品加進來（在櫃檯點咖啡）。
   tip_zh 寫在選項上，就只有選了那個選項才出現。 */
window.SCENES = window.SCENES || {};

window.SCENES["konbini"] = {
  id: "konbini",
  title: { ja: "コンビニ", zh: "便利商店" },
  store: "ことばマート",              // 虛構店名，避開真實品牌
  intro_zh: "晚上 10 點，你剛到東京的飯店。肚子有點餓，去隔壁的便利商店買點東西吧。",
  shop_hint_zh: "點貨架上的商品看看，牆上的海報是社群推薦。挑好了，就點櫃檯結帳。",
  hotel_zh: "回到飯店了。",
  empty_zh: "什麼都沒買到，空手回到飯店。",
  stamp_ja: "コンビニ",

  /* 三張都是 MJ 的圖（2026-10-26），原圖在 repo 根目錄的 image/。換圖之後用 ?edit 對座標 */
  images: {
    outside: "img/konbini-outside.jpg",
    inside: "img/konbini-inside.jpg",
    hotel: "img/hotel-room.jpg"
  },
  dark: ["outside", "hotel"],   // 暗的圖（夜景）：上面的面板和按鈕用深色
  alt_zh: {
    outside: "夜晚街角的便利商店",
    inside: "便利商店店內：兩台飲料冰箱、海報、咖啡機、三明治飯糰便當架、泡麵架和櫃檯",
    hotel: "商務旅館的小房間"
  },

  /* 疊在空白招牌上的字（招牌上不標假名，點了商品才看得到讀音）。
     bg：底板的顏色（蓋掉圖上的亂碼）　ink：字的顏色 */
  labels: {
    outside: [
      { x: 32, y: 49.6, w: 36, h: 3.4, text: "ことばマート", bg: "#ffffff", ink: "#1f5fae" }
    ],
    inside: [
      { x: 31,   y: 18.4, w: 13,   h: 2.4, text: "お{茶|ちゃ}", bg: "#ffffff" },
      { x: 52,   y: 19,   w: 12,   h: 2.4, text: "ビール", bg: "#ffffff" },
      { x: 75.5, y: 30.6, w: 17.5, h: 2.4, text: "SNSで{話題|わだい}", bg: "#ffffff" },
      { x: 73,   y: 39.6, w: 13,   h: 2.4, text: "コーヒー", bg: "#ffffff" },
      { x: 1,    y: 37.8, w: 19,   h: 2.2, text: "サンドイッチ", bg: "#ffffff" },
      { x: 18,   y: 45.6, w: 14,   h: 2.2, text: "おにぎり", bg: "#ffffff" },
      { x: 18,   y: 52.6, w: 12,   h: 2.2, text: "お{弁当|べんとう}", bg: "#ffffff" },
      { x: 41,   y: 38,   w: 14,   h: 2.2, text: "カップ{麺|めん}", bg: "#ffffff" },
      { x: 52,   y: 63.5, w: 10,   h: 2.6, text: "レジ", bg: "#ffffff" }
    ]
  },

  /* 店內的熱點。thumb 是單字卡上那張小圖要裁的範圍（沒寫就用熱點本身）。
     action："checkout" 是櫃檯，"picks" 是社群推薦的海報（清單在 data/picks.js）。
     重疊的地方，寫在後面的熱點會蓋在上面 */
  hotspots: [
    { id: "tea",       x: 29,   y: 19.5, w: 18.5, h: 21.5, item: "tea",
      thumb: { x: 28, y: 25, w: 20, h: 9 } },
    { id: "beer",      x: 48.5, y: 19,   w: 19.5, h: 22,   item: "beer",
      thumb: { x: 58, y: 26, w: 11, h: 7 } },
    { id: "poster",    x: 79,   y: 27,   w: 10.5, h: 11,   action: "picks" },
    { id: "coffee",    x: 85,   y: 38,   w: 15,   h: 11,   word: "coffee" },   // 只看單字卡：咖啡在櫃檯點
    { id: "sandwich",  x: 0,    y: 39.5, w: 25,   h: 6.5,  item: "sandwich" },
    { id: "onigiri",   x: 0,    y: 46,   w: 25,   h: 7,    item: "onigiri" },
    { id: "bento",     x: 0,    y: 53,   w: 30,   h: 7,    item: "bento" },
    { id: "cupnoodle", x: 38.5, y: 39.5, w: 24,   h: 15,   item: "cupnoodle" },
    { id: "register",  x: 62,   y: 44,   w: 21,   h: 24,   action: "checkout" }
  ],

  /* 結帳時把櫃檯拉近 */
  focus: { x: 68, y: 57, scale: 1.75 },

  /* 價格是虛構的，只求合理。tags 決定結帳時會多問什麼 */
  items: {
    onigiri:   { word: "onigiri",   price: 160, tags: [] },
    bento:     { word: "bento",     price: 598, tags: ["hot", "chopsticks"] },
    sandwich:  { word: "sandwich",  price: 320, tags: [] },
    cupnoodle: { word: "cupnoodle", price: 238, tags: ["chopsticks"] },
    tea:       { word: "tea",       price: 140, tags: [] },
    beer:      { word: "beer",      price: 248, tags: ["alcohol"] },
    coffee:    { word: "coffee",    price: 120, tags: ["coffee"] }   // 不在貨架上：在櫃檯點（counter 的 add）
  },
  fees: { bag: 3 },

  /* 進門 */
  enter: [
    { type: "say", id: "irasshaimase",
      ja: "いらっしゃいませー", romaji: "irasshaimase", zh: "歡迎光臨",
      tip_zh: "店員對每個進門的人都會說，不用回應。",
      variants: [
        { lv: 2, ja: "いらっしゃいませ、こんばんはー", romaji: "irasshaimase, konbanwā", zh: "歡迎光臨，晚安",
          status: "draft" },
        { lv: 3, ja: "らっしゃいませー", romaji: "rasshaimase", zh: "歡迎光臨（講得很快）",
          tip_zh: "講很快的時候，開頭的「い」常常聽不到。一樣不用回應。", status: "draft" }
      ],
      status: "draft" }
  ],

  /* 走到櫃檯（點櫃檯或「去結帳」）時，店員先問一句：
       籃子裡有東西 → 問要不要結帳；可以順便點咖啡（add），或說「まだです」（set: { checkout: false }）回去逛
       籃子是空的　 → 問在找什麼；可以只點一杯咖啡 */
  counter: [
    { type: "line", id: "okaikei", when: { min: 1 },
      ja: "お{会計|かいけい}ですか？", romaji: "okaikei desu ka?", zh: "要結帳嗎？",
      choices: [
        { ja: "はい、お{願|ねが}いします", romaji: "hai, onegai shimasu", zh: "好，麻煩你" },
        { ja: "はい、コーヒーもお{願|ねが}いします", romaji: "hai, kōhī mo onegai shimasu", zh: "好，還要一杯咖啡",
          add: "coffee", tip_zh: "咖啡不在貨架上拿，要在櫃檯點。「〜も」是「〜也要」。" },
        { ja: "すみません、まだです", romaji: "sumimasen, mada desu", zh: "不好意思，我還沒挑好",
          set: { checkout: false },
          then: { ja: "はい、ごゆっくりどうぞ", romaji: "hai, goyukkuri dōzo", zh: "好的，請慢慢看", status: "draft" },
          tip_zh: "「お会計」是結帳。還沒挑好就說「すみません、まだです」，店員會說「ごゆっくりどうぞ」（請慢慢看）。" },
        { nod: true }
      ],
      status: "draft" },
    { type: "line", id: "osagashi", when: { max: 0 },
      ja: "{何|なに}かお{探|さが}しですか？", romaji: "nanika osagashi desu ka?", zh: "在找什麼嗎？",
      choices: [
        { ja: "コーヒーをお{願|ねが}いします", romaji: "kōhī o onegai shimasu", zh: "我要一杯咖啡",
          add: "coffee", tip_zh: "咖啡不在貨架上拿，要在櫃檯點，付完錢再自己去機器倒。" },
        { ja: "いいえ、{大丈夫|だいじょうぶ}です", romaji: "iie, daijōbu desu", zh: "不用了", set: { checkout: false } },
        { nod: true, set: { checkout: false }, narr_zh: "店員笑著等你開口。看你沒說話，就回去忙了。" }
      ],
      status: "draft" }
  ],

  /* 結帳：照順序一步一步，when 不成立就跳過。「微笑點頭」是 nod: true 的選項 */
  checkout: [
    { type: "line", id: "point-card",
      ja: "ポイントカードはお{持|も}ちですか？", romaji: "pointo kādo wa omochi desu ka?",
      zh: "有集點卡嗎？",
      choices: [
        { ja: "ないです", romaji: "nai desu", zh: "沒有" },
        { ja: "いいえ、{大丈夫|だいじょうぶ}です", romaji: "iie, daijōbu desu", zh: "不用了" },
        { nod: true, narr_zh: "店員在等你拿卡……尷尬的三秒。\n看你沒有動作，店員就繼續結帳了。" }
      ],
      variants: [
        { lv: 2, ja: "ポイントカード、お{持|も}ちですか？", romaji: "pointo kādo, omochi desu ka?",
          zh: "有集點卡嗎？", status: "draft" },
        { lv: 3, ja: "ポイントカードやアプリはお{持|も}ちですか？", romaji: "pointo kādo ya apuri wa omochi desu ka?",
          zh: "有集點卡或 App 嗎？", status: "draft" }
      ],
      status: "draft" },

    { type: "touch", id: "age-check", when: { has: "alcohol" }, rule: "drinking-age",
      ja: "{年齢確認|ねんれいかくにん}のため、{画面|がめん}のタッチをお{願|ねが}いします",
      romaji: "nenrei kakunin no tame, gamen no tatchi o onegai shimasu",
      zh: "要確認年齡，請按一下螢幕",
      tip_zh: "在日本，買酒和菸都要在螢幕上確認年齡。",
      screen: {
        ja: "20{歳|さい}{以上|いじょう}ですか？", zh: "你滿 20 歲了嗎？",
        buttons: [
          { ja: "はい", zh: "是" },
          { ja: "いいえ", zh: "不是", remove: "alcohol", narr_zh: "店員把啤酒收回去了。" }
        ]
      },
      choices: [
        { nod: true,
          then: { ja: "こちらの{画面|がめん}をタッチしてください", romaji: "kochira no gamen o tatchi shite kudasai",
                  zh: "請按這個螢幕", status: "draft" },
          narr_zh: "店員指了指螢幕。" }
      ],
      variants: [
        { lv: 2, ja: "{画面|がめん}のタッチをお{願|ねが}いします", romaji: "gamen no tatchi o onegai shimasu",
          zh: "請按一下螢幕", status: "draft" },
        { lv: 3, ja: "こちら、タッチお{願|ねが}いしまーす", romaji: "kochira, tatchi onegai shimāsu",
          zh: "這邊，請按一下", status: "draft" }
      ],
      status: "draft" },

    { type: "line", id: "atatame", when: { has: "hot" },
      ja: "お{弁当|べんとう}は{温|あたた}めますか？", romaji: "obentō wa atatamemasu ka?",
      zh: "便當要加熱嗎？",
      choices: [
        { ja: "はい、お{願|ねが}いします", romaji: "hai, onegai shimasu", zh: "好，麻煩你", set: { warm: true },
          then: { ja: "{少々|しょうしょう}お{待|ま}ちください", romaji: "shōshō omachi kudasai", zh: "請稍等", status: "draft" } },
        { ja: "いいえ、{大丈夫|だいじょうぶ}です", romaji: "iie, daijōbu desu", zh: "不用了", set: { warm: false } },
        { nod: true, set: { warm: true },
          then: { ja: "{少々|しょうしょう}お{待|ま}ちください", romaji: "shōshō omachi kudasai", zh: "請稍等", status: "draft" } }
      ],
      variants: [
        { lv: 2, ja: "こちら、{温|あたた}めますか？", romaji: "kochira, atatamemasu ka?",
          zh: "這個要加熱嗎？", status: "draft" },
        { lv: 3, ja: "{温|あたた}めますかー？", romaji: "atatamemasu kā?",
          zh: "要加熱嗎？", status: "draft" }
      ],
      status: "draft" },

    { type: "line", id: "ohashi", when: { has: "chopsticks" },
      ja: "お{箸|はし}はおつけしますか？", romaji: "ohashi wa otsuke shimasu ka?",
      zh: "需要筷子嗎？",
      choices: [
        { ja: "はい、お{願|ねが}いします", romaji: "hai, onegai shimasu", zh: "好，麻煩你", set: { chopsticks: true } },
        { ja: "いいえ、{大丈夫|だいじょうぶ}です", romaji: "iie, daijōbu desu", zh: "不用了", set: { chopsticks: false } },
        { nod: true, set: { chopsticks: true } }
      ],
      variants: [
        { lv: 2, ja: "お{箸|はし}はご{利用|りよう}ですか？", romaji: "ohashi wa goriyō desu ka?",
          zh: "需要筷子嗎？", status: "draft" },
        { lv: 3, ja: "お{箸|はし}は{何膳|なんぜん}おつけしますか？", romaji: "ohashi wa nanzen otsuke shimasu ka?",
          zh: "筷子要幾雙？",
          tip_zh: "「何膳（なんぜん）」是問要幾雙。筷子用「膳」來數：一膳、二膳。",
          choices: [
            { ja: "{一膳|いちぜん}でお{願|ねが}いします", romaji: "ichizen de onegai shimasu", zh: "一雙，麻煩你",
              set: { chopsticks: true } },
            { ja: "{二膳|にぜん}でお{願|ねが}いします", romaji: "nizen de onegai shimasu", zh: "兩雙，麻煩你",
              set: { chopsticks: true } },
            { ja: "いいえ、{大丈夫|だいじょうぶ}です", romaji: "iie, daijōbu desu", zh: "不用了", set: { chopsticks: false } },
            { nod: true, set: { chopsticks: true }, narr_zh: "店員看你點頭，想了一下，放了一雙筷子。" }
          ],
          status: "draft" }
      ],
      status: "draft" },

    /* 咖啡：在櫃檯付錢，店員給你空杯子，再自己去咖啡機倒 */
    { type: "line", id: "coffee", when: { has: "coffee" },
      ja: "ホットとアイス、どちらになさいますか？", romaji: "hotto to aisu, dochira ni nasaimasu ka?",
      zh: "咖啡要熱的還是冰的？",
      tip_zh: "付完錢店員會給你一個空杯子，自己拿去咖啡機放好、按按鈕。",
      choices: [
        { ja: "ホットでお{願|ねが}いします", romaji: "hotto de onegai shimasu", zh: "熱的，麻煩你", set: { coffee: "hot" } },
        { ja: "アイスでお{願|ねが}いします", romaji: "aisu de onegai shimasu", zh: "冰的，麻煩你", set: { coffee: "ice" } },
        { nod: true, set: { coffee: "hot" }, narr_zh: "店員看你點頭，拿了熱咖啡的杯子給你。" }
      ],
      variants: [
        /* 「ホットでよろしいですか」是確認「熱的可以嗎？」，點頭＝熱的 */
        { lv: 2, ja: "ホットでよろしいですか？", romaji: "hotto de yoroshii desu ka?", zh: "熱的可以嗎？",
          choices: [
            { ja: "はい、お{願|ねが}いします", romaji: "hai, onegai shimasu", zh: "好，麻煩你", set: { coffee: "hot" } },
            { ja: "アイスでお{願|ねが}いします", romaji: "aisu de onegai shimasu", zh: "我要冰的", set: { coffee: "ice" } },
            { nod: true, set: { coffee: "hot" } }
          ],
          status: "draft" }
      ],
      status: "draft" },

    { type: "line", id: "bag", when: { min: 1 }, rule: "bag-fee",
      ja: "レジ{袋|ぶくろ}はご{利用|りよう}ですか？", romaji: "rejibukuro wa goriyō desu ka?",
      zh: "需要塑膠袋嗎？",
      tip_zh: "日本的塑膠袋要另外付錢（這家店一個 3 円）。",
      choices: [
        { ja: "はい、お{願|ねが}いします", romaji: "hai, onegai shimasu", zh: "好，麻煩你", set: { bag: true } },
        { ja: "いいえ、{大丈夫|だいじょうぶ}です", romaji: "iie, daijōbu desu", zh: "不用了", set: { bag: false } },
        { nod: true, set: { bag: true } }
      ],
      variants: [
        { lv: 2, ja: "{袋|ふくろ}はご{利用|りよう}ですか？", romaji: "fukuro wa goriyō desu ka?",
          zh: "需要袋子嗎？", status: "draft" },
        /* 「よろしいですか」問的是「不用也可以嗎？」，所以點頭＝不要袋子 */
        { lv: 3, ja: "{袋|ふくろ}はよろしいですか？", romaji: "fukuro wa yoroshii desu ka?",
          zh: "袋子不用可以嗎？",
          tip_zh: "「〜はよろしいですか？」是在問「不用〜可以嗎？」，點頭等於「不用」。要袋子就說「お願いします」（一個 3 円）。",
          choices: [
            { ja: "お{願|ねが}いします", romaji: "onegai shimasu", zh: "要，麻煩你", set: { bag: true } },
            { ja: "{大丈夫|だいじょうぶ}です", romaji: "daijōbu desu", zh: "不用了", set: { bag: false } },
            { nod: true, set: { bag: false }, narr_zh: "店員點點頭，沒有拿袋子給你。" }
          ],
          status: "draft" }
      ],
      status: "draft" },

    /* 突發狀況：不要袋子時，店員會貼一張貼紙表示已結帳 */
    { type: "line", id: "sticker", event: true, when: { level: 2, min: 1, flag: { bag: false } },
      ja: "シールでよろしいですか？", romaji: "shīru de yoroshii desu ka?",
      zh: "貼張貼紙就好嗎？",
      tip_zh: "不拿袋子時，店員會在商品上貼一張「シール」（貼紙），表示已經結帳了。",
      choices: [
        { ja: "はい", romaji: "hai", zh: "好" },
        { ja: "やっぱり{袋|ふくろ}お{願|ねが}いします", romaji: "yappari fukuro onegai shimasu", zh: "我還是要袋子",
          set: { bag: true } },
        { nod: true }
      ],
      status: "draft" },

    { type: "touch", id: "pay", when: { min: 1 },
      ja: "お{支払|しはら}いは、こちらの{画面|がめん}でお{願|ねが}いします",
      romaji: "oshiharai wa, kochira no gamen de onegai shimasu",
      zh: "請在這個螢幕上付款",
      tip_zh: "很多店是店員刷條碼，客人自己在螢幕上付款。",
      screen: {
        ja: "お{支払|しはら}い{方法|ほうほう}", zh: "付款方式", total: true,
        buttons: [
          { ja: "{現金|げんきん}", zh: "現金", narr_zh: "把錢放進機器，找的錢從下面出來。" },
          { ja: "クレジットカード", zh: "信用卡", narr_zh: "感應一下信用卡，付好了。" },
          { ja: "{交通系|こうつうけい}IC", zh: "交通卡（Suica 等）", narr_zh: "嗶！付好了。" }
        ]
      },
      choices: [
        { nod: true,
          then: { ja: "こちらの{画面|がめん}をタッチしてください", romaji: "kochira no gamen o tatchi shite kudasai",
                  zh: "請按這個螢幕", status: "draft" },
          narr_zh: "店員指了指螢幕。" }
      ],
      variants: [
        { lv: 2, ja: "お{支払|しはら}い{方法|ほうほう}を{画面|がめん}でお{選|えら}びください",
          romaji: "oshiharai hōhō o gamen de oerabi kudasai", zh: "請在螢幕上選擇付款方式", status: "draft" },
        { lv: 3, ja: "お{支払|しはら}い、こちらでお{願|ねが}いしまーす", romaji: "oshiharai, kochira de onegai shimāsu",
          zh: "請在這邊付款", status: "draft" }
      ],
      status: "draft" },

    /* 突發狀況：問要不要收據 */
    { type: "line", id: "receipt", event: true, when: { level: 2, min: 1 },
      ja: "レシートはご{入用|いりよう}ですか？", romaji: "reshīto wa goiriyō desu ka?",
      zh: "需要收據嗎？",
      tip_zh: "「レシート」就是收據（receipt）。不要的話說「大丈夫です」。",
      choices: [
        { ja: "はい、お{願|ねが}いします", romaji: "hai, onegai shimasu", zh: "好，麻煩你" },
        { ja: "いいえ、{大丈夫|だいじょうぶ}です", romaji: "iie, daijōbu desu", zh: "不用了" },
        { nod: true, narr_zh: "店員把收據交給你。" }
      ],
      status: "draft" },

    { type: "say", id: "arigatou",
      ja: "ありがとうございました", romaji: "arigatō gozaimashita", zh: "謝謝光臨",
      tip_zh: "不用回，點個頭就好。也可以說「どうも」。",
      variants: [
        { lv: 2, ja: "ありがとうございました。またお{越|こ}しくださいませ",
          romaji: "arigatō gozaimashita. mata okoshi kudasaimase", zh: "謝謝光臨，歡迎再來", status: "draft" },
        { lv: 3, ja: "ありがとうございましたー、またお{越|こ}しくださいませー",
          romaji: "arigatō gozaimashitā, mata okoshi kudasaimasē", zh: "謝謝光臨，歡迎再來（講得很快）", status: "draft" }
      ],
      status: "draft" }
  ],

  /* 回到飯店後的結果：全部檢查一遍，成立的都顯示（順序有關係：just-right 要放最後） */
  endings: [
    { id: "hot-bento", icon: "🍱", title_zh: "熱便當",
      when: { has: "hot", flag: { warm: true } },
      zh: "便當熱熱的，好吃。",
      hint_zh: "買便當，請店員加熱？" },
    { id: "cold-bento", icon: "🧊", title_zh: "冷便當",
      when: { has: "hot", flag: { warm: false } },
      zh: "便當冷冰冰的……",
      tip_zh: "有些商務旅館有共用的微波爐，可以問問櫃台。",
      hint_zh: "買便當，然後不要加熱？" },
    { id: "no-chopsticks", icon: "🥢", title_zh: "沒有筷子",
      when: { has: "chopsticks", flag: { chopsticks: false } },
      zh: "準備開動……才發現沒有筷子。",
      tip_zh: "聽到「お箸」就說「はい」。",
      hint_zh: "買泡麵，然後不要筷子？" },
    { id: "carry", icon: "🤲", title_zh: "抱著走回去",
      when: { min: 3, flag: { bag: false } },
      zh: "東西太多，一路抱著走回飯店。",
      tip_zh: "袋子只要幾円，東西多就買一個。",
      hint_zh: "買三樣以上，然後不要袋子？" },
    { id: "kanpai", icon: "🍺", title_zh: "乾杯",
      when: { has: "alcohol" },
      zh: "乾杯！",
      tip_zh: "日本 20 歲才能喝酒。",
      hint_zh: "買一瓶啤酒？" },
    { id: "just-right", icon: "🌙", title_zh: "剛剛好",
      when: { min: 1, none: ["cold-bento", "no-chopsticks", "carry"] },
      zh: "一切剛剛好。晚安。",
      hint_zh: "每一題都選到適合的回答？" }
  ]
};
