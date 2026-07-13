/* ============================================================
   毛線麵餐廳 — 全域設定（單一資料來源）
   所有可調數值都在這裡，遊戲邏輯不寫死數字。
   ============================================================ */
window.PC = window.PC || {};

PC.config = {
    VERSION: 'v1.0',

    // 首頁「餐廳的故事」：滿版背景圖 + 打字機對話框（點畫面推進、看完或跳過回首頁）。
    //   images：滿版背景圖（放到 assets/ 對應檔名；缺圖時畫面顯示提示檔名）。
    //   typeSpeed：打字速度（每字毫秒）。
    //   script：對話框腳本，一個物件＝一格對話框（＝原文案的 ---）。
    //     pos：對話框位置 —— 'bl' 下左｜'br' 下右｜'tc' 中上。
    //     img：進入這格時切換的背景圖 index（沿用上一張就不寫）。
    //     lines：這格的文字。第一行立即打字；之後每行要「點一下」才揭曉（＝原文案的 >）。
    //            某行需要「講到一半切背景圖」時，把該行寫成 { text, img } 即可（img＝要切到的背景 index）。
    // 只想放純圖投影片、不要對話框 → 把 STORY 改回字串陣列（會自動退回舊版 PPT 式）。
    STORY: {
        images: ['assets/story1.png', 'assets/story2.png', 'assets/story3.png'],
        typeSpeed: 45,
        script: [
            // ── 圖一（對話框：下右）──
            { img: 0, pos: 'br', lines: ['歡迎光臨～這是我們新開張的「編織義大利麵」餐廳！'] },
            {
                pos: 'br', lines: [
                    '我們為每位貴賓，端上一針一線勾出的勾針義大利麵。',
                    '瞧，娃娃客人們正排著隊呢——每天都絡繹不絕。'
                ]
            },
            { pos: 'br', lines: ['走，我們進去裡面瞧瞧吧！'] },
            // ── 圖二（對話框：中上）──
            {
                img: 1, pos: 'tc', lines: [
                    '座位上的洋娃娃客人也好多啊。',
                    '每天這樣忙進忙出，實在有些吃不消了。'
                ]
            },
            { pos: 'tc', lines: ['所以，我們正在尋找一位新主廚。'] },
            {
                pos: 'tc', lines: [
                    '我們想邀請一位既會下廚、又擅長編織的高手——',
                    // ↓ 這一行揭曉時切到圖三
                    { img: 2, text: '就是 CORA 大廚，來為我們掌廚！' }
                ]
            },
            // ── 圖三（對話框：中上）──
            { pos: 'tc', lines: ['不過想坐上主廚的位子，得先通過四道考驗，擊敗其他廚師才行。'] },
            {
                pos: 'tc', lines: [
                    '第一題——「CORA 的拿手菜」；',
                    '第二題——「競爭對手出的題」。'
                ]
            },
            {
                pos: 'tc', lines: [
                    '第三題——「交給客人自己點」；',
                    '第四題——則是嚴格的「掌門人考題」。'
                ]
            },
            { pos: 'tc', lines: ['好，那就開始吧！！'] }
        ]
    },

    // ===== 織圖角色區「哨兵色」（單一資料來源）=====
    // 新版織圖 SVG 用這 3 個純色「平塗區塊」標角色（同心環帶），程式再換成訂單顏色。
    // 選 CMY 三純色：不會出現在毛線針目線稿裡，一望即知是佔位色。
    // 出圖規格見 crochet_library/ZONES_SPEC.md。
    // 若某張 SVG 不含任何哨兵色 → charts.js 自動退回舊版「面積啟發式」以相容既有織圖。
    ZONE_SENTINELS: { sauce: '#E9E4DB', top0: '#F3E9E9', top1: '#FFFEFE' },
    ZONE_SENTINEL_TOL: 10,   // 比對容差：三色很接近（醬料↔配料1 僅差 18），容差須 <18 才不互撞；Figma 匯出為精確 hex，取 10 留些微餘裕

    // ===== 計分核心 =====
    BASE_SCORE: 100,      // 基礎總分（未加難度前）
    RESULT_HIGH_SCORE: 100,  // 看分數時：分數超過此值 → 換更熱鬧的高分結算 BGM（bgm_result_high）
    DOT_SPAN: 22,         // 點點時間預算（秒）：每點時間窗 = DOT_SPAN / 點點總數；計時相對制——每點從「出現」那刻起算自己的窗（v1.2）
    // 判定給分比例（以每點基礎分為 1）：完美 / 不完美 / 超級不完美
    // 例：總數10、總分100 → 每點基礎10分 → 完美10、不完美8、超糟6
    JUDGE_MULT: { perfect: 1.0, ok: 0.6, bad: 0.4 },
    // 完美帶佔每點時間窗的比例（置中）。原規格 w/2，使用者 2026-07-07 改窄成 w/4；窗內其餘＝不完美、窗外＝超糟
    PERFECT_FRAC: 0.25,
    // 上醬染色排程：第 [0] 個點開始變色、第 [1] 個點吸飽全色（跨點型別，與醬料點解耦）
    SAUCE_TINT_DOTS: [3, 6],
    COMBO_CHEER: 3,       // 連續完美 N 次 → 歡呼＋UI 變化

    // 難度表：bonus 加在基礎總分、dots 計入點點總數
    // 難度綁在「品項本身」（每個織圖/醬料/配料自帶 diff，如墨魚=超難），不是額外選項
    // 注意：配料「超難」的加分規格未定（使用者只給到 難+5），暫依織圖/醬料倍率規則取 +10
    DIFF: {
        pattern: {
            normal: { label: '一般', bonus: 0, dots: 3 },
            hard: { label: '難', bonus: 10, dots: 5 },
            expert: { label: '超難', bonus: 25, dots: 9 }
        },
        sauce: {
            normal: { label: '一般', bonus: 0, dots: 1 },
            hard: { label: '難', bonus: 8, dots: 3 },
            expert: { label: '超難', bonus: 18, dots: 5 }
        },
        topping: {
            normal: { label: '一般', bonus: 0, dots: 1 },
            hard: { label: '難', bonus: 5, dots: 2 },
            expert: { label: '超難', bonus: 10, dots: 3 }
        }
    },
    DIFF_KEYS: ['normal', 'hard', 'expert'],

    // ===== 熟度（依「起鍋時刻」判定，扣總分）=====
    // 完美區固定 16~23 秒；點點排程 22 秒剛好落在其中 → 按節奏做完再起鍋＝完美
    DONENESS: [
        { max: 12, key: 'raw', label: '沒熟', emoji: '🥶', penalty: -28 },
        { max: 16, key: 'almost', label: '差點熟', emoji: '😅', penalty: -8 },
        { max: 23, key: 'perfect', label: '完美熟度', emoji: '✨', penalty: 0 },
        { max: 27, key: 'over', label: '過熟', emoji: '😬', penalty: -8 },
        { max: 1e9, key: 'burnt', label: '燒焦', emoji: '🔥', penalty: -42 }
    ],
    DONENESS_COLORS: { raw: '#cfdcb4', almost: '#a5c47e', perfect: '#7fae5e', over: '#b8743f', burnt: '#55402e' },
    BURN_VISUAL_FROM: 23,   // 幾秒開始整盤漸焦變色
    FORCE_SERVE: 29,        // 強制起鍋（＝燒焦）
    BURN_WARN_LEAD: 3.5,    // 燒焦前幾秒先響一次警示音（sfx_burnt 提前預警，給玩家反應時間）

    // ===== 訂單素材（織圖 / 醬料 / 配料）=====
    // 每個品項自帶難度（diff）：織圖第三階（超難）預留給下一張織譜
    // img＝點菜單縮圖（織圖直接用譜 SVG；配料用實拍/插畫 PNG；沒圖的 UI 會退回色塊/emoji）
    PATTERNS: {
        sakura: {
            label: '櫻花五瓣', file: 'doily_桜.svg', diff: 'expert', img: 'crochet_library/doily_桜.svg',
            shape: { rounds: 17, sym: 5, outline: 'circle', petalAmp: 3.1, dipRatio: .55, petalFrom: .42, rMax: 7.2, lobePow: .9, notch: .3 }
        },
        d012: {
            label: '012 蕾絲圓盤', file: 'doily_012p.svg', diff: 'normal', img: 'crochet_library/doily_012p.svg',
            shape: { rounds: 17, sym: 12, outline: 'circle', petalAmp: 1.0, dipRatio: .35, petalFrom: .55, rMax: 7.6 }
        },
        // 新織圖（哨兵色制）。032＝菱形純醬料麵（醬料畫成旋轉方形）；004＝三色齊全；star＝六角星純醬料麵
        d032: {
            label: '◆ 032 菱形', file: 'doily_032.svg', diff: 'normal', img: 'crochet_library/doily_032.svg',
            shape: { rounds: 17, sym: 4, outline: 'diamond', petalAmp: 0, petalFrom: .5, rMax: 7.4 }
        },
        d004: {
            label: '004 蕾絲圓盤', file: '100doily_004.svg', diff: 'hard', img: 'crochet_library/100doily_004.svg',
            shape: { rounds: 17, sym: 8, outline: 'circle', petalAmp: 1.2, dipRatio: .35, petalFrom: .55, rMax: 7.5 }
        },
        star: {
            label: '✦ 六角星', file: 'star.svg', diff: 'hard', img: 'crochet_library/star.svg',
            shape: { rounds: 17, sym: 6, outline: 'star', points: 6, inner: .45, petalAmp: 0, petalFrom: .5, rMax: 7.5 }
        },
        // 第二批新織圖（2026-07-08）：兩圓 + 8瓣花 + 6尖雪花 + 六邊形
        circle1: {
            label: '● 圓形 1', file: 'circle_1.svg', diff: 'normal', img: 'crochet_library/circle_1.svg',
            shape: { rounds: 17, sym: 16, outline: 'circle', petalAmp: .5, dipRatio: .3, petalFrom: .5, rMax: 7.4 }
        },
        circle2: {
            label: '● 圓形 2', file: 'circle_2.svg', diff: 'hard', img: 'crochet_library/circle_2.svg',
            shape: { rounds: 17, sym: 24, outline: 'circle', petalAmp: .35, dipRatio: .3, petalFrom: .55, rMax: 7.5 }
        },
        flower1: {
            label: '❁ 八瓣花', file: 'flower01_3.svg', diff: 'expert', img: 'crochet_library/flower01_3.svg',
            shape: { rounds: 17, sym: 8, outline: 'circle', petalAmp: 2.2, dipRatio: .5, petalFrom: .45, rMax: 7.3 }
        },
        flower2: {
            label: '❄ 六尖雪花', file: 'flower02_3.svg', diff: 'expert', img: 'crochet_library/flower02_3.svg',
            shape: { rounds: 17, sym: 6, outline: 'star', points: 6, inner: .5, petalAmp: 0, petalFrom: .45, rMax: 7.5 }
        },
        hexagon: {
            label: '⬡ 六邊形', file: 'hexagon_2.svg', diff: 'hard', img: 'crochet_library/hexagon_2.svg',
            shape: { rounds: 17, sym: 6, outline: 'polygon', sides: 6, petalAmp: 0, petalFrom: .5, rMax: 7.4 }
        }
    },
    SAUCES: {
        '紅醬': { color: '#d96b47', rough: .78, diff: 'normal', img: 'assets/sauce_red.png' },
        '白醬': { color: '#f0e6d2', rough: .95, diff: 'normal', img: 'assets/sauce_white.png' },
        '青醬': { color: '#8ba05e', rough: .78, diff: 'normal', img: 'assets/sauce_green.png' },
        '清炒': { color: '#e8c987', rough: .3, diff: 'hard', img: 'assets/sauce_aglio.png' },
        '粉紅醬': { color: '#e89bab', rough: .85, diff: 'hard', img: 'assets/sauce_pink.png' },
        '彈珠汽水': { color: '#6fc3e0', rough: .3, diff: 'expert', img: 'assets/sauce_soda.png' },
        '墨魚': { color: '#55505c', rough: .72, diff: 'expert', img: 'assets/sauce_squid.png' }
    },
    // 依難度排序（一般 → 難 → 超難），魷魚圈固定放第一個；菜單直接照此物件順序渲染
    TOPPINGS: {
        tomato: { label: '🍅 番茄', color: '#cf4630', n: 5, diff: 'normal', img: 'assets/topping_tomato.png' },
        squid: { label: '🦑 魷魚圈', color: '#efe7d8', n: 3, diff: 'normal', img: 'assets/topping_Calamari.png' },

        basil: { label: '🌿 羅勒', color: '#4f7c39', n: 8, diff: 'normal', img: 'assets/topping_basil.png' },
        cheese: { label: '🧀 起司', color: '#fedf8b', n: 5, diff: 'hard', img: 'assets/topping_cheese.png' },
        mushroom: { label: '🍄 蘑菇', color: '#cdbb98', n: 5, diff: 'hard', img: 'assets/topping_mushroom.png' },
        // 新配料（2026-07-08）：3D 模型顏色直接讀本 color（單一旋鈕，改這裡即同步 3D）
        blueberry: { label: '🫐 藍莓', color: '#4e5da6', n: 5, diff: 'hard', img: 'assets/topping_blueberry.png' },
        bacon: { label: '🥓 培根', color: '#823a35', n: 3, diff: 'expert', img: 'assets/topping_bacon.png' },
        broccoli: { label: '🥦 花椰菜', color: '#5c8b3a', n: 3, diff: 'expert', img: 'assets/topping_broccoli.png' },
        caviar: { label: '🖤 魚子醬', color: '#2a2730', n: 3, diff: 'expert', img: 'assets/topping_caviari.png' }
    },
    DEFAULT_ORDER: { pattern: 'sakura', sauce: '白醬', tops: ['squid', 'squid'] },

    // ===== 回合流程（每場都一樣：自己配料，或讓客人隨機點；場數可選 1~4）=====
    ROUND_DEFAULT: 3,
    ROUND_MIN: 1,
    ROUND_MAX: 5,

    // ===== 兩隊固定角色（第一隊 無尾熊、第二隊 貓）=====
    // 隊友現場自己喬，選角只做 UI 提醒、不真的選。每隊角色綁在 store.chef 上。
    STORES: [
        { name: '無尾熊隊', emoji: '🐨', chef: { emoji: '🐨', name: '無尾熊', img: 'assets/chef_koala.png' } },
        { name: '貓咪隊', emoji: '🐱', chef: { emoji: '🐱', name: '貓咪', img: 'assets/chef_cat.png' } }
    ],
    RIVAL_STORE: { name: '毛線之家', emoji: '🏯' },   // 單店模式第 3 場的 AI 對手
    // ===== 角色庫（暱稱＋原型個性，取自 foodan 食物人格測驗）=====
    // 頭像複製自 foodan/images。name＝暱稱、origin＝原型角色、title/line＝個性（line 為隨機客人登場時說的台詞）。
    // 缺圖自動退回 emoji。掌門人 feili 不列入隨機客人，只在劇本壓軸登場（見 STORY_SCRIPT）。
    // 隨機客人清單於檔尾用 CHARACTERS 組出（PC.config.CUSTOMERS）。
    CHARACTERS: {
        suzi: { name: 'SUZI', origin: '幻想獨角獸', title: '感性味覺幻想家', emoji: '🦄', img: 'assets/char_suzi.png', line: '如果這盤麵會發光、還能飄起來，就太夢幻了～' },
        shulei: { name: '蔬蕾', origin: '格局象', title: '職人味覺社交家', emoji: '🐘', img: 'assets/char_shulei.png', line: '我不是龜毛，只是覺得這一味擺第 3 個上才合理…' },
        manshu: { name: '慢熟媽媽', origin: '慢熟貓', title: '宅系味覺療癒師', emoji: '🐱', img: 'assets/char_manshu.png', line: '今天就想炸雞配奶茶配劇，來碗療癒的吧～' },
        wenhua: { name: '文化豹', origin: '文化龍', title: '文化儀式食策展人', emoji: '🐆', img: 'assets/char_wenhua.png', line: '這不只是一盤麵，是一段土地記憶的時間軸。' },
        nuangua: { name: '暖瓜', origin: '靜味貓頭鷹', title: '沈靜系滋味守護人', emoji: '🦉', img: 'assets/char_nuangua.png', line: '安安靜靜的，把那個對的味道做給我就好。' },
        feili: { name: '飛狸', origin: '工程河狸', title: '自導型創食設計師', emoji: '🦫', img: 'assets/char_feili.png', line: '這盤我用四種味道自己調過——換你了，超厲害吧？' }
    },
    // 出題難度權重 [一般, 難, 超難]
    ORDER_WEIGHTS: {
        customer: [0.5, 0.3, 0.2],    // 顧客：偏溫和
        rival: [0.15, 0.45, 0.4]   // 對手：偏兇
    },

    // ===== 劇本模式（選「4 場」時觸發的固定流程）=====
    // 玩家 UI 完全不變：每場仍可自己配料、或按 🎲 出題；只有「角色台詞」與「骰子隨機出的難度」照劇本走。
    // charKey → 對應 CHARACTERS 的角色（頭像／暱稱由那裡決定）；line＝這場的情境台詞；theme＝主題。
    // 想換角色 → 改 charKey；想改話術 → 改 line；難度 → 改 weights [一般, 難, 超難]（[0,0,1]＝全部最難）。
    STORY_SCRIPT: {
        rounds: 4,   // 僅當「場數 === 此值」時啟用劇本；其他場數維持原本隨機客人
        turns: [
            {   // ① SUZI 的拿手菜（自己選，開場偏溫和）
                theme: '拿手菜', charKey: 'suzi', diceLabel: '🎲 SUZI 的拿手菜', weights: [0.6, 0.3, 0.1],
                line: '聽你說你的面會飛?第一題，就用你最有把握的拿手菜開場吧～'
            },
            {   // ② 蔬蕾的拿手菜（對方選，中高難）
                theme: '對手的拿手菜', charKey: 'shulei', diceLabel: '🎲 蔬蕾出題', weights: [0.2, 0.45, 0.35],
                line: '這是我的拿手菜，講究味道也講究順序——換你接招！'
            },
            {   // ③ 慢熟媽媽的訂單（真實客戶，隨機偏高難）
                theme: '真實客戶的訂單', charKey: 'manshu', diceLabel: '🎲 熟客的訂單', weights: [0.1, 0.4, 0.5],
                line: '老樣子那個療癒口味，拜託做得好吃一點嘛～'
            },
            {   // ④ 掌門人飛狸的考題（隨機全部最難）
                theme: '掌門人的考題', charKey: 'feili', diceLabel: '🎲 掌門人考題（最難）', weights: [0, 0, 1],
                line: '最終考題。我可是四種味道都自己調過的——拿出真本事！'
            }
        ]
    },

    // ===== 音效清單（sounds/，之後補檔即生效；缺檔靜默）=====
    SOUNDS: {
        bgm_menu: { file: 'bgm_menu.wav', loop: true, vol: .8, desc: '開場／選單／點菜 BGM（循環）' },
        bgm_cooking: { file: 'bgm_cooking.mp3', loop: true, vol: .65, desc: '烹飪中 BGM（循環、輕快）' },
        bgm_result: { file: 'bgm_result.mp3', loop: true, vol: .35, desc: '看分數／結算 BGM（循環）' },
        bgm_result_high: { file: 'bgm_result_high.mp3', loop: true, vol: .85, desc: '看分數・高分（>100）BGM（循環、更熱鬧）' },
        sfx_ui_click: { file: 'sfx_ui_click.mp3', loop: false, vol: .7, desc: '介面按鈕點擊' },
        sfx_order_open: { file: 'sfx_order_open.wav', loop: false, vol: .8, desc: '訂單／翻卡出現' },
        sfx_count: { file: 'sfx_countdown.mp3', loop: false, vol: .8, desc: '倒數整段 3-2-1（一個檔，開始前約 3 秒播一次）' },
        sfx_ready: { file: 'sfx_ready.wav', loop: false, vol: .8, desc: '起鍋提示音（麵好了、進綠色完美區時的短「叮」）' },
        sfx_go: { file: 'sfx_go.mp3', loop: false, vol: .9, desc: '開始！' },
        sfx_hit_perfect: { file: 'sfx_hit_perfect.mp3', loop: false, vol: 1, desc: '完美點擊（清脆「啵」）' },
        sfx_hit_ok: { file: 'sfx_hit_ok.wav', loop: false, vol: .9, desc: '不完美點擊（普通）' },
        sfx_hit_bad: { file: 'sfx_hit_bad.mp3', loop: false, vol: .9, desc: '超級不完美（悶悶的）' },
        sfx_hit_wrong: { file: 'sfx_hit_wrong.aac', loop: false, vol: .8, desc: '按錯鍵' },
        sfx_combo: { file: 'sfx_combo.aac', loop: false, vol: 1, desc: '三連完美歡呼' },
        sfx_serve: { file: 'sfx_serve.mp3', loop: false, vol: .9, desc: '起鍋／上菜' },
        sfx_topping_drop: { file: 'sfx_topping_drop.mp3', loop: false, vol: .8, desc: '配料落盤（咚）' },
        sfx_burnt: { file: 'sfx_burnt.mp3', loop: false, vol: .7, desc: '燒焦警報' },
        sfx_result: { file: 'sfx_result.mp3', loop: false, vol: .9, desc: '結算亮分' },
        sfx_win: { file: 'sfx_win.wav', loop: false, vol: 1, desc: '優勝（雙店競賽）' },
        sfx_score_tick: { file: 'sfx_score_tick.mp3', loop: false, vol: .5, desc: '分數滾動（可選）' }
    },

    // ===== 3D 場景 =====
    SCENE: {
        SOLO: { camR: 58, azim: .65, elev: 1.22, rigX: [0] },
        DUO: { camR: 76, azim: Math.PI / 2, elev: 1.12, rigX: [-17.5, 17.5] }
    }
};

// ===== 隨機客人＝角色庫中非掌門的 5 位（掌門人 feili 只在劇本壓軸登場）=====
// 想調整哪些角色會當隨機客人：改這行的 key 陣列即可。
PC.config.CUSTOMERS = ['suzi', 'shulei', 'manshu', 'wenhua', 'nuangua'].map(k => PC.config.CHARACTERS[k]);

// ===== 織圖來源與織法（掃碼＋中文說明，顯示在菜譜卡與得分卡）=====
// 資料來源：かぎあみカフェ（kagiami-cafe.com）；key 對齊 PATTERNS。
// url → 產生 QRcode；needle/yarn/size/steps → 中文織法。
PC.config.GUIDES = {
    sakura: {
        url: 'https://kagiami-cafe.com/archives/1949',
        needle: '鉤針 2/0 號', yarn: 'Emmy Grande No.100・117', size: '約 10cm',
        steps: [
            '起針以「輪」方式起針，鉤 10 針短針。',
            '前段是鎖針的地方，整束挑起來鉤。',
            '鉤好後熨燙整形即完成。'
        ]
    },
    d012: {
        url: 'https://kagiami-cafe.com/archives/1042',
        needle: '蕾絲針 6 號', yarn: '金票蕾絲線 #40，色號 342・343・852', size: '約 8.5cm',
        steps: [
            '起針以「輪」方式起針，鉤 6 針短針。',
            '前段是鎖針處，整束挑起來鉤。',
            '第 1～4 段用 342 號、5～7 段用 343 號、第 8 段用 852 號；換線時剪線，從下一段接新線。',
            '鉤好後熨燙即完成。'
        ]
    },
    d032: {
        url: 'https://kagiami-cafe.com/archives/1925',
        needle: '蕾絲針 6 號', yarn: '金票蕾絲線 802（白）、Tatting 蕾絲線〈中〉T205（黃）', size: '約 6.5cm',
        steps: [
            '起針以「輪」方式起針，鉤 3 針鎖針立起，接著照織圖鉤。',
            '前段是鎖針處，整束挑起來鉤。',
            '鉤好後熨燙即完成。'
        ]
    },
    d004: {
        url: 'https://kagiami-cafe.com/archives/1531',
        needle: '鉤針 2/0 號', yarn: '橘系 Emmy Grande No.783、Herbs No.252・777・732；粉系 Herbs No.141・252・777・732', size: '約 10.5cm',
        steps: [
            '起針以「輪」方式起針，鉤 6 針短針。',
            '前段是鎖針處，整束挑起來鉤。',
            '第 5 段從第 4 段鎖針中央接新線鉤 4 針短針，最後回到此處再鉤 3 針短針。（第 4 段剪線，5、6 段換色）',
            '鉤好後熨燙即完成。'
        ]
    },
    star: {
        url: 'https://kagiami-cafe.com/archives/1585',
        needle: '鉤針 2/0 號（或蕾絲針 6 號）', yarn: 'Emmy Grande No.804＋Herbs No.800；或金票蕾絲線 244・342・852', size: '約 10cm／約 7cm',
        steps: [
            '起針以「輪」方式起針，鉤 6 針短針。',
            '前段是鎖針處，整束挑起來鉤。',
            '第 4 段的 2 針長針玉編，從第 3 段鎖針 1 目前方、挑第 2 段長針 3 目的中央鉤。',
            '鉤好後熨燙即完成。'
        ]
    },
    circle1: {
        url: 'https://kagiami-cafe.com/archives/1022',
        needle: '鉤針 2/0 號', yarn: 'Emmy Grande 與 Herbs 多色（粉系 141・745＋804；米系 731＋252・745）', size: '約 11cm',
        steps: [
            '起針以「輪」方式起針，鉤 6 針短針。',
            '前段是鎖針處，整束挑起來鉤。',
            '於第 6～8 段換線色，換色時剪線再接新線。',
            '鉤好後熨燙即完成。'
        ]
    },
    circle2: {
        url: 'https://kagiami-cafe.com/archives/1389',
        needle: '鉤針 2/0 號', yarn: 'Emmy Grande No.584／783、Herbs No.141・252・732・777', size: '約 11cm',
        steps: [
            '起針以「輪」方式（魔術環）起針，鉤 6 針短針。',
            '前段是鎖針處，整束挑起來鉤。',
            '於第 3、4、5、6、8 段完成後依序換線色（A・B・C・D）。',
            '鉤好後熨燙即完成。'
        ]
    },
    flower1: {
        url: 'https://kagiami-cafe.com/archives/1310',
        needle: '鉤針 2/0 號', yarn: 'Herbs（藍系 343・732／黃系 582・732）；金票蕾絲線（黃系 503・852／粉系 154・802）', size: '約 7cm／約 4.5cm',
        steps: [
            '起針以「輪」方式起針，鉤 8 針短針。',
            '前段是鎖針處，整束挑起來鉤。',
            '第 4 段完成後更換花瓣線色。',
            '第 5 段短針：從第 4 段長針 6 目中央分開、挑第 3 段鎖針鉤（從後側挑）。',
            '鉤好後熨燙即完成。'
        ]
    },
    flower2: {
        url: 'https://kagiami-cafe.com/archives/1236',
        needle: '鉤針 2/0 號', yarn: 'Herbs No.745、Emmy Grande No.731', size: '約 12.5cm',
        steps: [
            '起針以「輪」方式起針，鉤短針。',
            '前段是鎖針處，整束挑起來鉤。',
            '第 5 段在 13 針鎖針的基底上鉤長針。',
            '鉤好後熨燙即完成。'
        ]
    },
    hexagon: {
        url: 'https://kagiami-cafe.com/archives/1331',
        needle: '鉤針 2/0 號', yarn: '黃系 Emmy Grande No.584・804；粉系 No.804＋Herbs No.119', size: '約 12cm',
        steps: [
            '起針以「輪」方式起針，鉤 3 針鎖針立起，接著鉤 17 針長針。',
            '前段是鎖針處，整束挑起來鉤。',
            '第 6 段鉤完後剪線，第 7 段起換線色鉤。',
            '鉤好後熨燙即完成。'
        ]
    }
};

// ===== 收藏卡（下載美照時多存的第二張圖：織圖 + QRcode + 活動標題）=====
// title＝活動標題（可改）；QR 連到「當前織圖」的織法頁（GUIDES[key].url），沒有就退回 url。
PC.config.KEEPSAKE = {
    url: 'https://kagiami-cafe.com/',   // 無對應織圖時的 QR 退路
    bg: '#e7e1d5',                       // 卡片底色（暖灰米）
    qrDark: '#33291f',                   // QRcode 深色（近黑暖褐，仍可掃）
    qrSize: 104                          // QRcode 邊長（px）
};

// 下載美照（3D 成品）出圖時的曝光倍率：>1 稍亮
PC.config.PHOTO_EXPOSURE = 1.15;

// 每張織圖的「麵型暱稱」（組菜名用，如 蕾絲 → 蕾絲義大利麵）
PC.config.NOODLE_NAMES = {
    sakura: '櫻花', d012: '蕾絲', d032: '菱格', d004: '圓盤', star: '星星',
    circle1: '圓圈', circle2: '細圓', flower1: '花瓣', flower2: '雪花', hexagon: '六角'
};

// 依訂單組出菜名：醬料 + 派料（去重、去 emoji）+ 麵型 + 義大利麵
// 例：白醬 + 番茄培根 + 蕾絲 → 白醬番茄培根蕾絲義大利麵
PC.dishName = function (order) {
    const C = PC.config;
    const sauce = C.SAUCES[order.sauce] ? order.sauce : '';
    const tops = [...new Set(order.tops)]
        .filter(k => C.TOPPINGS[k])
        .map(k => C.TOPPINGS[k].label.replace(/^\S+\s+/, ''))   // 去掉開頭 emoji
        .join('');
    const noodle = C.NOODLE_NAMES[order.pattern] || '';
    return sauce + tops + noodle + '義大利麵';
};

// 完美熟度區間 [起, 迄]＝由 DONENESS 表推導（perfect 帶的前一帶 max ~ perfect max），避免兩處數字不同步
(function () {
    const D = PC.config.DONENESS;
    const i = D.findIndex(d => d.key === 'perfect');
    PC.config.PERFECT_ZONE = [D[i - 1].max, D[i].max];
})();

// ---- 純函式：訂單 → 計分參數（難度由品項自帶 diff 決定）----
PC.orderStats = function (order) {
    const C = PC.config, D = C.DIFF;
    const p = D.pattern[C.PATTERNS[order.pattern].diff];
    const s = D.sauce[C.SAUCES[order.sauce].diff];
    const t = order.tops.map(k => D.topping[C.TOPPINGS[k].diff]);
    const bonus = p.bonus + s.bonus + t[0].bonus + t[1].bonus;
    const dots = p.dots + s.dots + t[0].dots + t[1].dots;
    const base = C.BASE_SCORE + bonus;
    return { bonus, dots, base, perDot: base / dots, dotSec: C.DOT_SPAN / dots };
};

// 起鍋時刻 → 熟度
PC.judgeDoneness = function (sec) {
    return PC.config.DONENESS.find(d => sec <= d.max);
};
