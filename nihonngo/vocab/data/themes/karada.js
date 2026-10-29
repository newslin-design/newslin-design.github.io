/* ============================================================
   karada.js ─ 主題「体（からだ）」的內容（套一圖多詞模板）
   ------------------------------------------------------------
   ★ 草稿（status: draft）：部位、分級、常用句、慣用句都是 Claude 整理的，等老師確認。
   level：1 基本、2 進階。總覽圖全部都畫、用顏色分；卡片和小遊戲選「基本」只出 1，選「進階」1、2 都出。
   scene：在哪一張圖上（body 全身、face 臉）。x、y 是部位在圖上的位置（0〜100，左上角是 0）。
   side：名稱標在圖的左邊（L）還是右邊（R）。
   trap：跟中文意思不一樣的漢字（圖上標紅），note 是說明。
   phrases ＝ 常用句，idioms ＝ 慣用句；idioms 的 part 是慣用句裡那個部位的寫法（遊戲挖空用）。
   scenes 的 svg 是暫代插圖；換成 Midjourney 的圖之後把 img 填上檔名，熱點座標要重量。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 暫代插圖（之後換成 MJ） ---------- */
  var SKIN = "#F5D5C0", SHADE = "#E9BFA6", HAIR = "#3A3028";
  var BODY_SVG =
    '<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M128 270 L124 370" stroke="' + SKIN + '" stroke-width="22" stroke-linecap="round"/>' +
      '<path d="M172 270 L176 370" stroke="' + SKIN + '" stroke-width="22" stroke-linecap="round"/>' +
      '<ellipse cx="116" cy="382" rx="22" ry="11" fill="' + SKIN + '"/>' +
      '<ellipse cx="184" cy="382" rx="22" ry="11" fill="' + SKIN + '"/>' +
      '<path d="M104 236 H196 V284 H158 L150 262 L142 284 H104 Z" fill="#4F6B8C"/>' +
      '<rect x="108" y="178" width="84" height="64" rx="20" fill="' + SKIN + '"/>' +
      '<circle cx="150" cy="214" r="3.2" fill="#C99682"/>' +
      '<path d="M104 150 Q104 128 128 128 H172 Q196 128 196 150 V188 H104 Z" fill="#E7B98A"/>' +
      '<path d="M110 138 Q88 170 80 198 Q74 222 68 240" stroke="' + SKIN + '" stroke-width="20" fill="none" stroke-linecap="round"/>' +
      '<path d="M190 138 Q212 170 220 198 Q226 222 232 240" stroke="' + SKIN + '" stroke-width="20" fill="none" stroke-linecap="round"/>' +
      '<path d="M54 264 l-5 11 M60 268 l-2 12 M67 268 l1 12 M74 264 l5 10" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M246 264 l5 11 M240 268 l2 12 M233 268 l-1 12 M226 264 l-5 10" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="64" cy="256" r="15" fill="' + SKIN + '"/><circle cx="236" cy="256" r="15" fill="' + SKIN + '"/>' +
      '<circle cx="49" cy="275" r="2.4" fill="#FBEAE3"/><circle cx="58" cy="280" r="2.4" fill="#FBEAE3"/>' +
      '<rect x="139" y="104" width="22" height="30" rx="6" fill="' + SHADE + '"/>' +
      '<circle cx="104" cy="72" r="11" fill="' + SKIN + '"/><circle cx="196" cy="72" r="11" fill="' + SKIN + '"/>' +
      '<circle cx="150" cy="70" r="46" fill="' + SKIN + '"/>' +
      '<path d="M104 66 Q106 20 150 20 Q194 20 196 66 Q186 44 150 42 Q114 44 104 66 Z" fill="' + HAIR + '"/>' +
      '<circle cx="132" cy="74" r="5" fill="' + HAIR + '"/><circle cx="168" cy="74" r="5" fill="' + HAIR + '"/>' +
      '<ellipse cx="122" cy="88" rx="8" ry="5" fill="#F2A99A" opacity=".7"/><ellipse cx="178" cy="88" rx="8" ry="5" fill="#F2A99A" opacity=".7"/>' +
      '<path d="M140 92 Q150 101 160 92" stroke="#C0473D" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    "</svg>";

  var FACE_SVG =
    '<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="52" cy="262" rx="28" ry="42" fill="' + SKIN + '"/><ellipse cx="348" cy="262" rx="28" ry="42" fill="' + SKIN + '"/>' +
      '<path d="M48 250 Q40 262 50 280 M352 250 Q360 262 350 280" stroke="' + SHADE + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="200" cy="258" rx="150" ry="172" fill="' + SKIN + '"/>' +
      '<path d="M50 236 Q46 70 200 64 Q354 70 350 236 Q330 140 200 128 Q70 140 50 236 Z" fill="' + HAIR + '"/>' +
      '<path d="M120 172 Q148 156 176 166 M224 166 Q252 156 280 172" stroke="' + HAIR + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="150" cy="220" rx="15" ry="19" fill="' + HAIR + '"/><ellipse cx="250" cy="220" rx="15" ry="19" fill="' + HAIR + '"/>' +
      '<path d="M136 205 l-9 -8 M144 201 l-4 -10 M154 200 l1 -10 M264 205 l9 -8 M256 201 l4 -10 M246 200 l-1 -10" stroke="' + HAIR + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M200 246 Q214 270 200 282" stroke="#D9A88F" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="116" cy="300" rx="30" ry="17" fill="#F2A99A" opacity=".7"/><ellipse cx="284" cy="300" rx="30" ry="17" fill="#F2A99A" opacity=".7"/>' +
      '<path d="M140 322 Q200 404 260 322 Q200 314 140 322 Z" fill="#7A2E2A"/>' +
      '<path d="M152 325 Q200 318 248 325 Q244 340 234 344 H166 Q156 340 152 325 Z" fill="#FFFFFF"/>' +
      '<ellipse cx="200" cy="376" rx="32" ry="22" fill="#E8737A"/>' +
      '<path d="M140 322 Q200 404 260 322 M140 322 Q200 312 260 322" stroke="#D0605C" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M178 420 Q200 428 222 420" stroke="' + SHADE + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    "</svg>";

  var T = {
    status: "draft",

    /* img 是 MJ 的圖（2026-10-29，原圖在 art-originals/vocab/）；pos 是照那張圖量的位置 [x, y, 名稱在左 L／右 R]，
       有 pos 就不用部位自己的 x、y。全身的 A、B 兩張還在比，alts 是 B，總覽圖右上角可以切換；選定後刪掉另一張 */
    scenes: [
      { id: "body", aspect: 1 / 2, img: "img/karada/body-a.jpg", bg: "#ede5d0", svg: BODY_SVG, name: { hant: "全身", hans: "全身", en: "Body", ko: "전신" },
        pos: {
          atama: [57, 7, "R"], kami: [39, 12, "L"], kao: [53, 14, "R"], kubi: [45.5, 19.5, "L"], nodo: [53, 21, "R"],
          kata: [35, 23, "L"], mune: [54, 27, "R"], onaka: [45, 36, "L"], heso: [52, 39, "R"], koshi: [63, 43, "R"],
          hiji: [32, 40, "L"], ude: [33, 47, "L"], tekubi: [33.5, 54.5, "L"], tsume: [36, 61, "L"],
          te: [69.5, 56, "R"], yubi: [71, 60.5, "R"], hiza: [61, 65, "R"], ashikubi: [42, 91, "L"], ashi: [64, 92.5, "R"]
        },
        alts: [
          { img: "img/karada/body-b.jpg", aspect: 1 / 2, bg: "#fbefd8",
            pos: {
              atama: [45, 6, "R"], kami: [37.5, 14, "L"], kao: [50, 15, "R"], kubi: [45.5, 20.5, "L"], nodo: [51.5, 21, "R"],
              kata: [35.5, 23, "L"], mune: [53, 27, "R"], onaka: [44, 34, "L"], heso: [50, 38.5, "R"], koshi: [60, 42, "R"],
              hiji: [33, 38, "L"], ude: [32.5, 45, "L"], tekubi: [31.8, 52, "L"], tsume: [28.6, 57, "L"],
              te: [66, 53, "R"], yubi: [70.5, 56.5, "R"], hiza: [57, 66, "R"], ashikubi: [39, 93, "L"], ashi: [57, 95, "R"]
            } }
        ] },
      { id: "face", aspect: 4 / 5, img: "img/karada/face.jpg", bg: "#f4edda", svg: FACE_SVG, name: { hant: "臉", hans: "脸", en: "Face", ko: "얼굴" },
        pos: {
          mayu: [32, 29.5, "L"], matsuge: [32.5, 44, "L"], me: [69, 43.5, "R"], mimi: [10.5, 52.5, "L"], hana: [51, 47, "R"],
          hoo: [75, 55, "R"], ha: [51, 55.5, "R"], kuchibiru: [62, 57.5, "R"], kuchi: [40.5, 57.5, "L"], shita: [51, 63, "L"],
          ago: [48.5, 77.5, "L"]
        } }
    ],

    items: [
      /* ---------- 簡單 ---------- */
      { id: "atama", ja: "頭", kana: "あたま", level: 1, scene: "body", x: 61.7, y: 10.5, side: "R",
        mean: { hant: "頭", hans: "头", en: "head", ko: "머리" },
        phrases: [{ ja: "頭が痛い", kana: "あたまが いたい", tr: { hant: "頭痛", hans: "头痛", en: "I have a headache", ko: "머리가 아파요" } }],
        idioms: [{ ja: "頭にくる", kana: "あたまに くる", part: "頭", tr: { hant: "火大、生氣", hans: "火大、生气", en: "to get angry", ko: "화가 나다" } }] },
      { id: "kao", ja: "顔", kana: "かお", level: 1, scene: "body", x: 50, y: 20.5, side: "R",
        mean: { hant: "臉", hans: "脸", en: "face", ko: "얼굴" },
        phrases: [{ ja: "顔を洗う", kana: "かおを あらう", tr: { hant: "洗臉", hans: "洗脸", en: "to wash your face", ko: "세수하다" } }],
        idioms: [{ ja: "顔が広い", kana: "かおが ひろい", part: "顔", tr: { hant: "人脈很廣（不是臉很大）", hans: "人脉很广（不是脸很大）", en: "to know a lot of people", ko: "발이 넓다 (아는 사람이 많다)" } }] },
      { id: "me", ja: "目", kana: "め", level: 1, scene: "face", x: 62.5, y: 43.6, side: "R",
        mean: { hant: "眼睛", hans: "眼睛", en: "eye", ko: "눈" },
        phrases: [{ ja: "目が覚める", kana: "めが さめる", tr: { hant: "醒來", hans: "醒来", en: "to wake up", ko: "잠이 깨다" } }],
        idioms: [{ ja: "目がない", kana: "めが ない", part: "目", tr: { hant: "超愛、毫無抵抗力（甘いものに目がない）", hans: "超爱、毫无抵抗力（甘いものに目がない）", en: "to be crazy about something", ko: "~라면 사족을 못 쓰다" } }] },
      { id: "mimi", ja: "耳", kana: "みみ", level: 1, scene: "face", x: 13, y: 52.4, side: "L",
        mean: { hant: "耳朵", hans: "耳朵", en: "ear", ko: "귀" },
        phrases: [{ ja: "耳をすます", kana: "みみを すます", tr: { hant: "仔細聽", hans: "仔细听", en: "to listen carefully", ko: "귀를 기울이다" } }],
        idioms: [{ ja: "耳が痛い", kana: "みみが いたい", part: "耳", tr: { hant: "被說中痛處、聽了刺耳", hans: "被说中痛处、听了刺耳", en: "it hurts to hear (because it's true)", ko: "정곡을 찔려 듣기 괴롭다" } }] },
      { id: "hana", ja: "鼻", kana: "はな", level: 1, scene: "face", x: 51.3, y: 53.6, side: "R",
        mean: { hant: "鼻子", hans: "鼻子", en: "nose", ko: "코" },
        phrases: [{ ja: "鼻をかむ", kana: "はなを かむ", tr: { hant: "擤鼻涕", hans: "擤鼻涕", en: "to blow your nose", ko: "코를 풀다" } }],
        idioms: [{ ja: "鼻が高い", kana: "はなが たかい", part: "鼻", tr: { hant: "得意、引以為傲", hans: "得意、引以为傲", en: "to be proud", ko: "자랑스럽다" } }] },
      { id: "kuchi", ja: "口", kana: "くち", level: 1, scene: "face", x: 35.5, y: 64.8, side: "L",
        mean: { hant: "嘴巴", hans: "嘴巴", en: "mouth", ko: "입" },
        phrases: [{ ja: "口を開ける", kana: "くちを あける", tr: { hant: "張開嘴", hans: "张开嘴", en: "to open your mouth", ko: "입을 벌리다" } }],
        idioms: [{ ja: "口が堅い", kana: "くちが かたい", part: "口", tr: { hant: "口風很緊", hans: "口风很紧", en: "to be good at keeping secrets", ko: "입이 무겁다" } }] },
      { id: "ha", ja: "歯", kana: "は", level: 1, scene: "face", x: 55.5, y: 66.6, side: "R",
        mean: { hant: "牙齒", hans: "牙齿", en: "tooth", ko: "이" },
        phrases: [{ ja: "歯をみがく", kana: "はを みがく", tr: { hant: "刷牙", hans: "刷牙", en: "to brush your teeth", ko: "이를 닦다" } }],
        idioms: [{ ja: "歯が立たない", kana: "はが たたない", part: "歯", tr: { hant: "完全比不過、啃不動", hans: "完全比不过、啃不动", en: "to be no match for", ko: "상대가 안 되다" } }] },
      { id: "te", ja: "手", kana: "て", level: 1, scene: "body", x: 21.3, y: 64, side: "L",
        mean: { hant: "手", hans: "手", en: "hand", ko: "손" },
        phrases: [{ ja: "手を洗う", kana: "てを あらう", tr: { hant: "洗手", hans: "洗手", en: "to wash your hands", ko: "손을 씻다" } }],
        idioms: [{ ja: "手を貸す", kana: "てを かす", part: "手", tr: { hant: "幫忙", hans: "帮忙", en: "to lend a hand", ko: "손을 빌려주다 (돕다)" } }] },
      { id: "ashi", ja: "足", kana: "あし", level: 1, scene: "body", x: 62, y: 96, side: "R", trap: true,
        mean: { hant: "腳、腿", hans: "脚、腿", en: "foot, leg", ko: "발, 다리" },
        note: { hant: "日文的「足」是腳，也常指整條腿。", hans: "日文的「足」是脚，也常指整条腿。", en: "足 can mean the foot or the whole leg.", ko: "足(あし)는 발, 그리고 다리 전체를 가리키기도 해요." },
        phrases: [{ ja: "足が痛い", kana: "あしが いたい", tr: { hant: "腳痛", hans: "脚痛", en: "my feet hurt", ko: "다리가 아파요" } }],
        idioms: [{ ja: "足を洗う", kana: "あしを あらう", part: "足", tr: { hant: "金盆洗手、改邪歸正", hans: "金盆洗手、改邪归正", en: "to quit a bad way of life", ko: "손을 씻다 (나쁜 일에서 손을 떼다)" } }] },
      { id: "onaka", ja: "お腹", kana: "おなか", level: 1, scene: "body", x: 42.7, y: 51, side: "L",
        mean: { hant: "肚子", hans: "肚子", en: "belly", ko: "배" },
        phrases: [{ ja: "おなかが すいた", kana: "おなかが すいた", tr: { hant: "肚子餓了", hans: "肚子饿了", en: "I'm hungry", ko: "배가 고파요" } }],
        idioms: [{ ja: "腹が立つ", kana: "はらが たつ", part: "腹", tr: { hant: "生氣（「腹」是肚子比較直接的說法）", hans: "生气（「腹」是肚子比较直接的说法）", en: "to get angry (腹 is a plainer word for belly)", ko: "화가 나다 (腹는 배를 뜻해요)" } }] },

      /* ---------- 中 ---------- */
      { id: "kami", ja: "髪", kana: "かみ", level: 1, scene: "body", x: 43.3, y: 7.5, side: "L",
        mean: { hant: "頭髮", hans: "头发", en: "hair", ko: "머리카락" },
        phrases: [{ ja: "髪を切る", kana: "かみを きる", tr: { hant: "剪頭髮", hans: "剪头发", en: "to get a haircut", ko: "머리를 자르다" } }],
        idioms: [{ ja: "後ろ髪を引かれる", kana: "うしろがみを ひかれる", part: "髪", tr: { hant: "依依不捨", hans: "依依不舍", en: "to be reluctant to leave", ko: "미련이 남다" } }] },
      { id: "kubi", ja: "首", kana: "くび", level: 1, scene: "body", x: 47, y: 28, side: "L", trap: true,
        mean: { hant: "脖子", hans: "脖子", en: "neck", ko: "목" },
        note: { hant: "中文的「首」是頭，日文的「首」是脖子。", hans: "中文的「首」是头，日文的「首」是脖子。", en: "首 means neck, not head.", ko: "首(くび)는 머리가 아니라 목이에요." },
        phrases: [{ ja: "首が痛い", kana: "くびが いたい", tr: { hant: "脖子痛", hans: "脖子痛", en: "my neck hurts", ko: "목이 아파요" } }],
        idioms: [{ ja: "首になる", kana: "くびに なる", part: "首", tr: { hant: "被開除", hans: "被开除", en: "to get fired", ko: "해고되다" } }] },
      { id: "kata", ja: "肩", kana: "かた", level: 1, scene: "body", x: 37.3, y: 34, side: "L",
        mean: { hant: "肩膀", hans: "肩膀", en: "shoulder", ko: "어깨" },
        phrases: [{ ja: "肩がこる", kana: "かたが こる", tr: { hant: "肩膀僵硬痠痛", hans: "肩膀僵硬酸痛", en: "to have stiff shoulders", ko: "어깨가 뻐근하다" } }],
        idioms: [{ ja: "肩を持つ", kana: "かたを もつ", part: "肩", tr: { hant: "偏袒、站在某人那邊", hans: "偏袒、站在某人那边", en: "to take someone's side", ko: "편을 들다" } }] },
      { id: "ude", ja: "腕", kana: "うで", level: 1, scene: "body", x: 30.7, y: 42, side: "L", trap: true,
        mean: { hant: "手臂", hans: "手臂", en: "arm", ko: "팔" },
        note: { hant: "中文的「腕」是手腕，日文的「腕」是整條手臂；手腕是「手首」。", hans: "中文的「腕」是手腕，日文的「腕」是整条手臂；手腕是「手首」。", en: "腕 is the whole arm; the wrist is 手首.", ko: "腕(うで)는 팔 전체예요. 손목은 手首(てくび)." },
        phrases: [{ ja: "腕を組む", kana: "うでを くむ", tr: { hant: "雙手抱胸", hans: "双手抱胸", en: "to fold your arms", ko: "팔짱을 끼다" } }],
        idioms: [{ ja: "腕がいい", kana: "うでが いい", part: "腕", tr: { hant: "手藝好、本領高", hans: "手艺好、本领高", en: "to be skilled", ko: "솜씨가 좋다" } }] },
      { id: "yubi", ja: "指", kana: "ゆび", level: 1, scene: "body", x: 79.3, y: 68, side: "R",
        mean: { hant: "手指", hans: "手指", en: "finger", ko: "손가락" },
        phrases: [{ ja: "指でさす", kana: "ゆびで さす", tr: { hant: "用手指指", hans: "用手指指", en: "to point with your finger", ko: "손가락으로 가리키다" } }],
        idioms: [{ ja: "指をくわえる", kana: "ゆびを くわえる", part: "指", tr: { hant: "眼巴巴看著（想要卻得不到）", hans: "眼巴巴看着（想要却得不到）", en: "to look on enviously", ko: "부러워하며 보기만 하다" } }] },
      { id: "mune", ja: "胸", kana: "むね", level: 1, scene: "body", x: 50, y: 39, side: "R",
        mean: { hant: "胸口", hans: "胸口", en: "chest", ko: "가슴" },
        phrases: [{ ja: "胸が痛い", kana: "むねが いたい", tr: { hant: "胸口痛（也可以是心痛）", hans: "胸口痛（也可以是心痛）", en: "my chest hurts (or: my heart aches)", ko: "가슴이 아파요" } }],
        idioms: [{ ja: "胸がいっぱい", kana: "むねが いっぱい", part: "胸", tr: { hant: "心裡滿滿的、很感動", hans: "心里满满的、很感动", en: "to be overwhelmed with emotion", ko: "가슴이 벅차다" } }] },
      { id: "koshi", ja: "腰", kana: "こし", level: 1, scene: "body", x: 65.3, y: 59.5, side: "R",
        mean: { hant: "腰（下背部）", hans: "腰（下背部）", en: "lower back, hips", ko: "허리" },
        phrases: [{ ja: "腰が痛い", kana: "こしが いたい", tr: { hant: "腰痛", hans: "腰痛", en: "my lower back hurts", ko: "허리가 아파요" } }],
        idioms: [{ ja: "腰が低い", kana: "こしが ひくい", part: "腰", tr: { hant: "謙虛有禮", hans: "谦虚有礼", en: "to be humble", ko: "겸손하다" } }] },
      { id: "hiza", ja: "膝", kana: "ひざ", level: 1, scene: "body", x: 58, y: 80.5, side: "R",
        mean: { hant: "膝蓋", hans: "膝盖", en: "knee", ko: "무릎" },
        phrases: [{ ja: "ひざを曲げる", kana: "ひざを まげる", tr: { hant: "彎膝蓋", hans: "弯膝盖", en: "to bend your knees", ko: "무릎을 굽히다" } }],
        idioms: [{ ja: "膝を交える", kana: "ひざを まじえる", part: "膝", tr: { hant: "促膝長談", hans: "促膝长谈", en: "to have a heart-to-heart talk", ko: "무릎을 맞대다" } }] },
      { id: "nodo", ja: "喉", kana: "のど", level: 1, scene: "body", x: 52, y: 32, side: "R",
        mean: { hant: "喉嚨", hans: "喉咙", en: "throat", ko: "목구멍" },
        phrases: [{ ja: "のどがかわいた", kana: "のどが かわいた", tr: { hant: "口渴", hans: "口渴", en: "I'm thirsty", ko: "목이 말라요" } }],
        idioms: [{ ja: "喉から手が出る", kana: "のどから てが でる", part: "喉", tr: { hant: "非常想要", hans: "非常想要", en: "to want something badly", ko: "몹시 갖고 싶다" } }] },
      { id: "kuchibiru", ja: "唇", kana: "くちびる", level: 1, scene: "face", x: 62, y: 68, side: "R",
        mean: { hant: "嘴唇", hans: "嘴唇", en: "lips", ko: "입술" },
        phrases: [{ ja: "唇が荒れる", kana: "くちびるが あれる", tr: { hant: "嘴唇乾裂", hans: "嘴唇干裂", en: "to have chapped lips", ko: "입술이 트다" } }],
        idioms: [{ ja: "唇をかむ", kana: "くちびるを かむ", part: "唇", tr: { hant: "咬著嘴唇（懊悔、不甘心）", hans: "咬着嘴唇（懊悔、不甘心）", en: "to bite your lip (in frustration)", ko: "입술을 깨물다" } }] },

      /* ---------- 難 ---------- */
      { id: "mayu", ja: "眉", kana: "まゆ", level: 2, scene: "face", x: 37, y: 33, side: "L",
        mean: { hant: "眉毛", hans: "眉毛", en: "eyebrow", ko: "눈썹" },
        phrases: [{ ja: "眉を描く", kana: "まゆを かく", tr: { hant: "畫眉毛", hans: "画眉毛", en: "to draw your eyebrows", ko: "눈썹을 그리다" } }],
        idioms: [{ ja: "眉をひそめる", kana: "まゆを ひそめる", part: "眉", tr: { hant: "皺眉（覺得不舒服）", hans: "皱眉（觉得不舒服）", en: "to frown", ko: "눈살을 찌푸리다" } }] },
      { id: "matsuge", ja: "まつげ", kana: "まつげ", level: 2, scene: "face", x: 67, y: 40.2, side: "R",
        mean: { hant: "睫毛", hans: "睫毛", en: "eyelash", ko: "속눈썹" },
        phrases: [{ ja: "まつげが長い", kana: "まつげが ながい", tr: { hant: "睫毛很長", hans: "睫毛很长", en: "to have long eyelashes", ko: "속눈썹이 길다" } }],
        idioms: [] },
      { id: "hoo", ja: "頬", kana: "ほお", level: 2, scene: "face", x: 70.5, y: 60, side: "R",
        mean: { hant: "臉頰", hans: "脸颊", en: "cheek", ko: "볼" },
        phrases: [{ ja: "頬が赤い", kana: "ほおが あかい", tr: { hant: "臉頰紅紅的", hans: "脸颊红红的", en: "rosy cheeks", ko: "볼이 빨갛다" } }],
        idioms: [{ ja: "ほっぺたが落ちる", kana: "ほっぺたが おちる", part: "ほっぺた", tr: { hant: "好吃到不行（ほっぺた＝臉頰）", hans: "好吃到不行（ほっぺた＝脸颊）", en: "so delicious (ほっぺた = cheek)", ko: "볼이 떨어질 만큼 맛있다" } }] },
      { id: "ago", ja: "あご", kana: "あご", level: 2, scene: "face", x: 50, y: 84, side: "L",
        mean: { hant: "下巴", hans: "下巴", en: "chin, jaw", ko: "턱" },
        phrases: [{ ja: "あごを引く", kana: "あごを ひく", tr: { hant: "收下巴", hans: "收下巴", en: "to tuck your chin in", ko: "턱을 당기다" } }],
        idioms: [{ ja: "あごで使う", kana: "あごで つかう", part: "あご", tr: { hant: "頤指氣使", hans: "颐指气使", en: "to boss people around", ko: "턱으로 부리다" } }] },
      { id: "hiji", ja: "ひじ", kana: "ひじ", level: 2, scene: "body", x: 26.7, y: 49.5, side: "L",
        mean: { hant: "手肘", hans: "手肘", en: "elbow", ko: "팔꿈치" },
        phrases: [{ ja: "ひじをつく", kana: "ひじを つく", tr: { hant: "用手肘撐著", hans: "用手肘撑着", en: "to rest on your elbows", ko: "팔꿈치를 괴다" } }],
        idioms: [] },
      { id: "tekubi", ja: "手首", kana: "てくび", level: 2, scene: "body", x: 23.3, y: 59, side: "L", trap: true,
        mean: { hant: "手腕", hans: "手腕", en: "wrist", ko: "손목" },
        note: { hant: "手腕在日文是「手首」（手的脖子）；「腕」是整條手臂。", hans: "手腕在日文是「手首」（手的脖子）；「腕」是整条手臂。", en: "The wrist is 手首, literally the hand's neck.", ko: "손목은 手首(てくび), '손의 목'이라는 뜻이에요." },
        phrases: [{ ja: "手首を回す", kana: "てくびを まわす", tr: { hant: "轉轉手腕", hans: "转转手腕", en: "to roll your wrists", ko: "손목을 돌리다" } }],
        idioms: [] },
      { id: "tsume", ja: "爪", kana: "つめ", level: 2, scene: "body", x: 17.3, y: 69.3, side: "L",
        mean: { hant: "指甲", hans: "指甲", en: "nail", ko: "손톱" },
        phrases: [{ ja: "爪を切る", kana: "つめを きる", tr: { hant: "剪指甲", hans: "剪指甲", en: "to cut your nails", ko: "손톱을 깎다" } }],
        idioms: [{ ja: "爪に火をともす", kana: "つめに ひを ともす", part: "爪", tr: { hant: "極度節儉", hans: "极度节俭", en: "to be extremely frugal", ko: "지독하게 아끼다" } }] },
      { id: "heso", ja: "へそ", kana: "へそ", level: 2, scene: "body", x: 50, y: 53.5, side: "R",
        mean: { hant: "肚臍", hans: "肚脐", en: "belly button", ko: "배꼽" },
        phrases: [],
        idioms: [{ ja: "へそを曲げる", kana: "へそを まげる", part: "へそ", tr: { hant: "鬧彆扭", hans: "闹别扭", en: "to sulk", ko: "토라지다" } }] },
      { id: "shita", ja: "舌", kana: "した", level: 2, scene: "face", x: 50, y: 75.2, side: "L",
        mean: { hant: "舌頭", hans: "舌头", en: "tongue", ko: "혀" },
        phrases: [{ ja: "舌を出す", kana: "したを だす", tr: { hant: "吐舌頭", hans: "吐舌头", en: "to stick out your tongue", ko: "혀를 내밀다" } }],
        idioms: [{ ja: "舌を巻く", kana: "したを まく", part: "舌", tr: { hant: "讚嘆不已", hans: "赞叹不已", en: "to be amazed", ko: "혀를 내두르다" } }] },
      { id: "ashikubi", ja: "足首", kana: "あしくび", level: 2, scene: "body", x: 41.7, y: 90.5, side: "L",
        mean: { hant: "腳踝", hans: "脚踝", en: "ankle", ko: "발목" },
        phrases: [{ ja: "足首をひねる", kana: "あしくびを ひねる", tr: { hant: "扭到腳踝", hans: "扭到脚踝", en: "to twist your ankle", ko: "발목을 삐다" } }],
        idioms: [] }
    ],

    text: {
      rulesTitle: { hant: "看圖的三個重點", hans: "看图的三个重点", en: "Three things to notice", ko: "그림을 볼 때 세 가지" },
      rules: [
        { hant: "**看顏色**：藍點是基本的 20 個部位，黃點是進階的 10 個。卡片和小遊戲可以選「基本」，或「進階」全部 30 個一起練", hans: "**看颜色**：蓝点是基本的 20 个部位，黄点是进阶的 10 个。卡片和小游戏可以选「基本」，或「进阶」全部 30 个一起练", en: "**Colors**: blue dots are the 20 basic parts, yellow dots the 10 advanced ones. In Cards and Games, pick Basic, or Advanced to practice all 30", ko: "**색으로 구분**: 파란 점은 기본 20개, 노란 점은 심화 10개예요. 카드와 미니게임에서 '기본', 또는 30개 전부인 '심화'를 고를 수 있어요" },
        { hant: "**紅色的字跟中文意思不一樣**：首＝脖子、腕＝手臂、手首＝手腕、足＝腳和腿", hans: "**红色的字跟中文意思不一样**：首＝脖子、腕＝手臂、手首＝手腕、足＝脚和腿", en: "**Red words are tricky kanji**: 首 = neck, 腕 = arm, 手首 = wrist, 足 = foot and leg", ko: "**빨간 단어는 한자 뜻이 달라요**: 首＝목, 腕＝팔, 手首＝손목, 足＝발과 다리" },
        { hant: "**點部位**看常用句和慣用句（日本人用身體部位做的比喻）", hans: "**点部位**看常用句和惯用句（日本人用身体部位做的比喻）", en: "**Tap a part** to see everyday phrases and idioms built on it", ko: "**부위를 누르면** 자주 쓰는 표현과 관용구가 나와요" }
      ],
      tip: {
        hant: "慣用句很像中文的成語：「顔が広い」是人脈很廣，不是臉很大。",
        hans: "惯用句很像中文的成语：「顔が広い」是人脉很广，不是脸很大。",
        en: "Idioms work like set phrases: 「顔が広い」 means you know lots of people, not that your face is wide.",
        ko: "관용구는 우리말과 비슷한 것도 많아요: 「顔が広い」는 '발이 넓다'와 같은 뜻이에요."
      }
    }
  };

  /* 要預先生成音檔的：每個部位、常用句、慣用句（都用假名送，避免念錯） */
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  T.clips = [];
  T.items.forEach(function (it, i) {
    T.clips.push({ id: "w" + pad(i + 1), label: it.ja, text: it.kana });
    it.phrases.forEach(function (p, j) { T.clips.push({ id: "p" + pad(i + 1) + "_" + (j + 1), label: p.ja, text: p.kana }); });
    it.idioms.forEach(function (p, j) { T.clips.push({ id: "i" + pad(i + 1) + "_" + (j + 1), label: p.ja, text: p.kana }); });
  });

  window.VOCAB_THEMES = window.VOCAB_THEMES || {};
  window.VOCAB_THEMES.karada = T;
})();
