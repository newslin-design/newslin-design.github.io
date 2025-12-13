// 問題數據 
const questions = [
    {
        "emoji": "🍽️",
        "img": "images/1000.png",
        "question": "朋友揪你吃一家很貴的料理餐廳，你最在意的是哪一點？",
        "options": [
            { "text": "聽說那家的食材超講究、味道超好吃！", "icon": "🥩", "score": [1, 0, 0, 0] },
            { "text": "他們主廚有自己的理念，整套菜是台灣高山森林走一圈的體驗！", "icon": "🎨", "score": [-1, 0, 0, 0] }
        ]
    }, {
        "emoji": "🧁",
        "img": "images/0010.png",
        "question": "公司附近的人氣甜點店裡有兩款新品，你選：",
        "options": [
            { "text": "巧克力甜甜圈啊，吃過很多次了一定好吃！", "icon": "🍩", "score": [0, 0, 1, 0] },
            { "text": "辣椒起司泡芙？沒吃過的味道！我想試試看", "icon": "🌶️", "score": [0, 0, -1, 0] }
        ]
    },
    {
        "emoji": "🌃",
        "img": "images/0100.png",
        "question": "上了一周很累的班，終於到了週五，晚上肚子餓你會想要",
        "options": [
            { "text": "找朋友揪一攤熱炒或居酒屋，一邊吃一邊聊天", "icon": "👥", "score": [0, 1, 0, 0] },
            { "text": "點自己最愛的餐廳外送，一個人配劇吃超爽", "icon": "🏠", "score": [0, -1, 0, 0] }
        ]
    },
    {
        "emoji": "🍱",
        "img": "images/0200.png",
        "question": "中午辦公室同事揪你一起去吃飯，你的直覺反應是：",
        "options": [
            { "text": "太好了！一起吃比較有氣氛，還能聊聊最近的事", "icon": "😊", "score": [0, 1, 0, 0] },
            { "text": "有點想自己靜靜吃便當，順便滑個手機放空一下", "icon": "📱", "score": [0, -1, 0, 0] }
        ]
    }, {
        "emoji": "🎉",
        "img": "images/1100.png",
        "question": "週末想犒賞自己，你會選擇：",
        "options": [
            { "text": "約朋友去那家超好吃的燒肉店，大家一起享受頂級和牛！", "icon": "🥩", "score": [1, 1, 0, 0] },
            { "text": "一個人去體驗那家孤獨美食主題餐廳，靜靜品味主廚的人生故事", "icon": "🍜", "score": [-1, -1, 0, 0] },
            { "text": "揪朋友去新開的台灣夜市環島主題餐廳，一起體驗創意料理", "icon": "🎪", "score": [-1, 1, 0, 0] },
            { "text": "自己在家點最愛的鹽酥雞配可樂，享受熟悉的美味", "icon": "🍗", "score": [1, -1, 0, 0] }
        ]
    }, {
        "emoji": "🍛",
        "img": "images/0001.png",
        "question": "公司的午餐時間，你在自助餐前排隊時會怎麼挑？",
        "options": [
            { "text": "依照今天的需求安排食物比例，例如昨天重訓所以蛋白質要多一些", "icon": "⚖️", "score": [0, 0, 0, 1] },
            { "text": "想吃什麼就夾什麼，今天想來點炸物加奶茶，完全看心情", "icon": "🎲", "score": [0, 0, 0, -1] }
        ]
    },
    {
        "emoji": "🌍",
        "img": "images/0020.png",
        "question": "中午走在超熱馬路上找餐廳時，看到沒吃過的異國餐廳新開張，你會：",
        "options": [
            { "text": "不太確定…等過陣子有評論再說，先去我熟悉的義大利麵店好了", "icon": "🔒", "score": [0, 0, 1, 0] },
            { "text": "超想試看看耶！馬上進去看看！", "icon": "🚀", "score": [0, 0, -1, 0] }
        ]
    },
    {
        "emoji": "🍝",
        "img": "images/2000.png",
        "question": "遠雄地下街有兩家店出了義大利燉飯，你會選：",
        "options": [
            { "text": "經典款，我就是要吃最對味的版本！", "icon": "👑", "score": [1, 0, 0, 0] },
            { "text": "創意款，好奇它怎麼詮釋傳統食物", "icon": "✨", "score": [-1, 0, 0, 0] }
        ]
    },
    {
        "emoji": "🌅",
        "img": "images/0002.png",
        "question": "又到了一如往常的早餐時間，你通常點餐時的方式是：",
        "options": [
            { "text": "通常都有固定的選擇，營養要均衡", "icon": "📋", "score": [0, 0, 0, 1] },
            { "text": "看今天心情想吃什麼就點什麼", "icon": "💭", "score": [0, 0, 0, -1] }
        ]
    },
    {
        "emoji": "✈️",
        "img": "images/0011.png",
        "question": "出國旅遊時，你的用餐方式是：",
        "options": [
            { "text": "事先查好當地必吃經典美食，按計畫逐一品嚐", "icon": "📋", "score": [0, 0, 1, 1] },
            { "text": "看到奇特的路邊攤就停下來試試，完全隨緣", "icon": "🎲", "score": [0, 0, -1, -1] },
            { "text": "規劃好要挑戰各種沒吃過的料理，列清單一一達成", "icon": "✅", "score": [0, 0, -1, 1] },
            { "text": "找熟悉口味的餐廳，看心情決定要不要進去", "icon": "🤔", "score": [0, 0, 1, -1] }
        ]
    }
]

// 人格類型資料
const types = {

    "TSDM": {
        name: "格局象",
        title: "職人味覺社交家",
        quote: "我不是龜毛<br>我只是覺得這道菜應該排第3道上比較合理…",
        food: "港點拼盤、和牛套餐、桌菜組合",
        desc: "懂吃也懂場面，講究味道與場域配合，可以當同事聚餐的點菜領袖。飲食有邏輯，吃飯要吃對也要吃好。",
        avatar: "images/TSDM.png",
        compatible: "文化龍、理性鴞、儀式天鵝",
        incompatible: "覓味水獺、自由狐狸、幻想獨角獸",
        dimensions: ["味道", "社交", "傳統", "結構"]
    },
    "TSDF": {
        name: "熱情狗",
        title: "爽感系同樂吃貨",
        quote: "吃火鍋<br>沒人搶菜就不刺激啊～",
        food: "麻辣鍋、燒肉拼盤、夜市全制霸",
        desc: "跟朋友吃才開胃！熱愛重口味，跟心情一起吃出爽感。不計熱量、不問意義，就是爽。",
        avatar: "images/TSDF.png",
        compatible: "覓味水獺、美味妃蝶、自由狐狸",
        incompatible: "靜味貓頭鷹、穩定陸龜、孤食刺蝟",
        dimensions: ["味道", "社交", "傳統", "感覺"]
    },
    "TSEM": {
        name: "理性鴞",
        title: "理性冒險吃導師",
        quote: "這家我研究過食材<br>來源和熱量分布<br>可以吃",
        food: "異國拼盤、Buffet、健身餐",
        desc: "吃飯前會先查好功課、安排分量與順序，精準探索新口味，不浪費任何一口熱量。",
        avatar: "images/TSEM.png",
        compatible: "格局象、儀式天鵝、孤食刺蝟",
        incompatible: "幻想獨角獸、追憶無尾熊",
        dimensions: ["味道", "社交", "冒險", "結構"]
    },
    "TSEF": {
        name: "覓味水獺",
        title: "探索系即興吃霸",
        quote: "這個味道我沒吃過<br>聞起來很有趣欸<br>讓我先來嘗嘗看！",
        food: "夜市串燒、甜辣組合、限量便當",
        desc: "走到哪吃到哪，看到有趣就點！吃得開心最重要，是吃飯版的冒險家＋派對靈魂。",
        avatar: "images/TSEF.png",
        compatible: "熱情狗、美味妃蝶、幻想獨角獸",
        incompatible: "靜味貓頭鷹、穩定陸龜、格局象",
        dimensions: ["味道", "社交", "冒險", "感覺"]
    },
    "TLDM": {
        name: "穩定陸龜",
        title: "安定系飲食控",
        quote: "每天吃一樣的雞腿便當<br>讓我很安心",
        food: "雞腿便當、日式定食、早餐三明治",
        desc: "吃飯是生活節奏的一部分，熟悉的味道讓人安心。營養要平衡，菜色最好可以提前決定。",
        avatar: "images/TLDM.png",
        compatible: "靜味貓頭鷹、孤食刺蝟、格局象",
        incompatible: "覓味水獺、美味妃蝶、熱情狗",
        dimensions: ["味道", "私密", "傳統", "結構"]
    },
    "TLDF": {
        name: "慢熟貓",
        title: "宅系味覺療癒師",
        quote: "今天就是要<br>炸雞配奶茶配連續劇<br>誰都別吵我",
        food: "咖哩飯、蛋包飯、宅宅甜食",
        desc: "吃飯是自我照顧的儀式，憑感覺選食物，只求吃完很舒服，懶得社交也懶得配菜。",
        avatar: "images/TLDF.png",
        compatible: "追憶無尾熊、療癒鴿、孤食刺蝟",
        incompatible: "文化龍、儀式天鵝、熱情狗、幻想獨角獸",
        dimensions: ["味道", "私密", "傳統", "感覺"]
    },
    "TLEM": {
        name: "孤食刺蝟",
        title: "獨食型風味研究員",
        quote: "健身完的<br>蛋白質搭碳水怎麼好吃<br>這是門科學",
        food: "高蛋白便當、自製沙拉、自配風味",
        desc: "自己吃得剛剛好，不需配合別人。會按身體狀態安排菜色，重視食物的功能與體感反饋。",
        avatar: "images/TLEM.png",
        compatible: "理性鴞、儀式天鵝、穩定陸龜",
        incompatible: "熱情狗、覓味水獺、自由狐狸",
        dimensions: ["味道", "私密", "冒險", "結構"]
    },
    "TLEF": {
        name: "自由狐狸",
        title: "直覺派口感漂流者",
        quote: "今天甜的配辣的<br>明天冰的包熱的<br>我就這樣任性！",
        food: "Brunch、Tapas、混搭風味",
        desc: "今天想吃什麼？就吃什麼。邊走邊吃、邊看邊選，是自由靈魂派吃貨代表。",
        avatar: "images/TLEF.png",
        compatible: "幻想獨角獸、覓味水獺、熱情狗",
        incompatible: "格局象、靜味貓頭鷹、工程河狸",
        dimensions: ["味道", "私密", "冒險", "感覺"]
    },
    "ISDM": {
        name: "文化龍",
        title: "文化儀式食策展人",
        quote: "這不是菜單<br>這是土地記憶的時間軸",
        food: "無菜單料理、節氣料理、地方再詮釋套餐",
        desc: "吃飯不是只是吃，而是場關於地方、文化與敘事的參與。餐桌就是展場。",
        avatar: "images/ISDM.png",
        compatible: "格局象、儀式天鵝、療癒鴿",
        incompatible: "幻想獨角獸、慢熟貓、自由狐狸",
        dimensions: ["概念", "社交", "傳統", "結構"]
    },
    "ISDF": {
        name: "療癒鴿",
        title: "暖系說菜人",
        quote: "這道紅燒魚是我外婆的味道<br>配這個菜才對",
        food: "媽媽便當、滷味拼盤、情感連結料理",
        desc: "吃飯與情感密不可分，一口食物一段故事。最會邊吃邊聊這道菜我阿嬤以前也煮。",
        avatar: "images/ISDF.png",
        compatible: "追憶無尾熊、慢熟貓、文化龍",
        incompatible: "覓味水獺、理性鴞、孤食刺蝟",
        dimensions: ["概念", "社交", "傳統", "感覺"]
    },
    "ISEM": {
        name: "儀式天鵝",
        title: "嚴謹型創食向導",
        quote: "主菜先上還是甜點先上<br>我有個 Excel 表可以解釋",
        food: "主廚套餐、低碳便當、風格套餐",
        desc: "從不亂吃新東西，一定先研究菜單背後的設計理念與文化關聯。嘴巴開之前，腦袋先動過。",
        avatar: "images/ISEM.png",
        compatible: "理性鴞、格局象、孤食刺蝟",
        incompatible: "慢熟貓、自由狐狸、幻想獨角獸",
        dimensions: ["概念", "社交", "冒險", "結構"]
    },
    "ISEF": {
        name: "美味妃蝶",
        title: "體驗系味覺旅人",
        quote: "吃飯就要沈浸式<br>最好還有香氛＋背景音樂",
        food: "食物劇場、聯名甜點、氣味搭配料理",
        desc: "吃東西像看展覽，是一場旅程。對食物意義與體感超敏銳，吃完還能寫出心得。",
        avatar: "images/ISEF.png",
        compatible: "覓味水獺、幻想獨角獸、熱情狗",
        incompatible: "穩定陸龜、靜味貓頭鷹、工程河狸",
        dimensions: ["概念", "社交", "冒險", "感覺"]
    },
    "ILDM": {
        name: "靜味貓頭鷹",
        title: "沈靜系滋味守護人",
        quote: "我只吃一間滷味攤<br>而且只在週四晚上",
        food: "古早味便當、一人壽司、靜靜吃的角落美食",
        desc: "討厭吵雜吃飯環境，對熟悉的味道非常執著，內心儀式感豐富，是慢食、靜食派擁護者。",
        avatar: "images/ILDM.png",
        compatible: "穩定陸龜、追憶無尾熊、療癒鴿",
        incompatible: "熱情狗、覓味水獺、自由狐狸",
        dimensions: ["概念", "私密", "傳統", "結構"]
    },
    "ILDF": {
        name: "追憶無尾熊",
        title: "記憶味道蒐藏家",
        quote: "每次吃起司蛋糕<br>我都會想起某個人…",
        food: "泡麵配蛋、療癒甜點、夜晚點心",
        desc: "吃的是心情、記的是回憶。你最愛的食物，可能來自一段對話、一個地點或一場分手。",
        avatar: "images/ILDF.png",
        compatible: "療癒鴿、慢熟貓、靜味貓頭鷹",
        incompatible: "覓味水獺、理性鴞、美味妃蝶",
        dimensions: ["概念", "私密", "傳統", "感覺"]
    },
    "ILEM": {
        name: "工程河狸",
        title: "自導型創食設計師",
        quote: "這個便當<br>是我用4種醬料自己調的<br>超厲害吧",
        food: "自組便當、自煮拼盤、旅行靈感餐",
        desc: "喜歡設計每一口的排列組合，買現成的料理也會搭配自己組合。吃飯像策展，喜歡自己組出新東西。",
        avatar: "images/ILEM.png",
        compatible: "儀式天鵝、孤食刺蝟、理性鴞",
        incompatible: "熱情狗、覓味水獺、自由狐狸",
        dimensions: ["概念", "私密", "冒險", "結構"]
    },
    "ILEF": {
        name: "幻想獨角獸",
        title: "感性味覺幻想家",
        quote: "如果草莓蛋糕<br>能飄起來就好了<br>（咬第一口）",
        food: "夢幻聯名款、色彩甜點、飲品仙境",
        desc: "腦中浮現食物與感覺的聯想，吃東西是一種表演、一種療癒、一種內在的藝術展演。",
        avatar: "images/ILEF.png",
        compatible: "覓味水獺、美味妃蝶、自由狐狸",
        incompatible: "格局象、文化龍、儀式天鵝",
        dimensions: ["概念", "私密", "冒險", "感覺"]
    }

};