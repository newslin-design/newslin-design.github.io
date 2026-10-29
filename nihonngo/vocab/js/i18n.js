/* ============================================================
   i18n.js ─ 介面文字（學習者的母語：繁中・简中・English・한국어）
   ------------------------------------------------------------
   這裡只放按鈕、提示這類介面文字；單字和說明內容放在 data/themes/<id>.js。
   t("key", {n: 3}) 會把 {n} 換掉。某語言漏寫時退回繁中。
   英文、韓文是 AI 翻的，公開前要請母語者看過。
   ============================================================ */
(function () {
  "use strict";

  var LANGS = [["hant", "繁體中文", "zh-Hant"], ["hans", "简体中文", "zh-Hans"], ["en", "English", "en"], ["ko", "한국어", "ko"]];

  var T = {
    /* 首頁與共用 */
    brandSub: { hant: "看得懂的日文單字卡・原型", hans: "看得懂的日语单词卡・原型", en: "Japanese word cards you can see · prototype", ko: "눈으로 이해하는 일본어 단어 카드 · 프로토타입" },
    langLabel: { hant: "母語", hans: "母语", en: "Your language", ko: "모국어" },
    themes: { hant: "主題", hans: "主题", en: "Themes", ko: "주제" },
    addTheme: { hant: "＋ 新增單字主題", hans: "＋ 新增单词主题", en: "+ New word theme", ko: "+ 새 단어 주제" },
    addThemeTitle: { hant: "新增單字主題", hans: "新增单词主题", en: "New word theme", ko: "새 단어 주제" },
    templatesNote: { hant: "選一個模板。每個主題都套用一種模板，新增主題只要加資料，不用改畫面。", hans: "选一个模板。每个主题都套用一种模板，新增主题只要加数据，不用改界面。", en: "Pick a template. Each theme uses one template, so a new theme only needs new data, not a new page.", ko: "템플릿을 고르세요. 주제마다 템플릿 하나를 쓰기 때문에, 새 주제는 데이터만 추가하면 돼요." },
    addThemeSoon: { hant: "建立主題的功能還在準備中。", hans: "创建主题的功能还在准备中。", en: "Creating themes isn't available yet.", ko: "주제 만들기 기능은 아직 준비 중이에요." },
    close: { hant: "關閉", hans: "关闭", en: "Close", ko: "닫기" },
    soon: { hant: "準備中", hans: "准备中", en: "Coming soon", ko: "준비 중" },
    cardsCount: { hant: "{n} 張卡片・{g} 個小遊戲", hans: "{n} 张卡片・{g} 个小游戏", en: "{n} cards · {g} games", ko: "카드 {n}장 · 게임 {g}개" },
    back: { hant: "主題一覽", hans: "主题一览", en: "All themes", ko: "주제 목록" },
    slow: { hant: "慢速語音", hans: "慢速语音", en: "Slow voice", ko: "느린 음성" },
    voiceF: { hant: "女聲", hans: "女声", en: "Female voice", ko: "여성 음성" },
    voiceM: { hant: "男聲", hans: "男声", en: "Male voice", ko: "남성 음성" },
    voiceSwitch: { hant: "切換男聲／女聲", hans: "切换男声／女声", en: "Switch voice", ko: "음성 바꾸기" },
    settings: { hant: "設定", hans: "设置", en: "Settings", ko: "설정" },
    bgLabel: { hant: "背景", hans: "背景", en: "Background", ko: "배경" },
    bgAuto: { hant: "跟裝置一樣", hans: "跟设备一样", en: "Same as device", ko: "기기 설정대로" },
    bgLight: { hant: "淺色", hans: "浅色", en: "Light", ko: "밝게" },
    bgDark: { hant: "深色", hans: "深色", en: "Dark", ko: "어둡게" },
    welcomeTitle: { hant: "你的母語是？", hans: "你的母语是？", en: "What's your language?", ko: "모국어가 무엇인가요?" },
    welcomeNote: { hant: "說明和翻譯會用這個語言。之後可以在右上角的設定改。", hans: "说明和翻译会用这个语言。之后可以在右上角的设置里改。", en: "Explanations and translations will use this language. You can change it later in Settings (top right).", ko: "설명과 번역이 이 언어로 나와요. 나중에 오른쪽 위 설정에서 바꿀 수 있어요." },
    se: { hant: "音效", hans: "音效", en: "Sound", ko: "효과음" },
    voiceNotice: { hant: "這個瀏覽器沒有日文語音，聽力題會改成顯示讀法。之後會換成預先生成的音檔。", hans: "这个浏览器没有日语语音，听力题会改为显示读法。之后会换成预先生成的音频。", en: "This browser has no Japanese voice, so listening questions show the reading instead. Pre-made audio will replace this later.", ko: "이 브라우저에는 일본어 음성이 없어서 듣기 문제는 읽는 법을 대신 보여 줘요. 나중에 미리 만든 음성 파일로 바뀝니다." },
    loadError: { hant: "主題載入失敗，請重新整理再試一次。", hans: "主题加载失败，请刷新后重试。", en: "Couldn't load this theme. Refresh and try again.", ko: "주제를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요." },
    replay: { hant: "再聽一次", hans: "再听一遍", en: "Play again", ko: "다시 듣기" },

    /* 月曆模板：總覽圖 */
    today: { hant: "今天是", hans: "今天是", en: "Today is", ko: "오늘은" },
    tabMap: { hant: "總覽圖", hans: "总览图", en: "Overview", ko: "한눈에 보기" },
    tabCards: { hant: "卡片", hans: "卡片", en: "Cards", ko: "카드" },
    tabGames: { hant: "小遊戲", hans: "小游戏", en: "Games", ko: "게임" },
    prevM: { hant: "上個月", hans: "上个月", en: "Previous month", ko: "이전 달" },
    nextM: { hant: "下個月", hans: "下个月", en: "Next month", ko: "다음 달" },
    sayMonth: { hant: "念出月份", hans: "读出月份", en: "Say the month", ko: "월 읽기" },
    hideRead: { hant: "藏起讀法，自己考自己", hans: "藏起读法，自己考自己", en: "Hide readings and test yourself", ko: "읽는 법을 숨기고 스스로 테스트" },
    legend: { hant: "紅圈＝特別讀法", hans: "红圈＝特别读法", en: "Red circle = special reading", ko: "빨간 동그라미 = 특별한 읽기" },
    legendToday: { hant: "藍框＝今天", hans: "蓝框＝今天", en: "Blue box = today", ko: "파란 테두리 = 오늘" },
    readoutHint: { hant: "點任何一天、星期或月份，聽它怎麼念", hans: "点任何一天、星期或月份，听它怎么读", en: "Tap any day, weekday, or month to hear it", ko: "날짜·요일·월을 누르면 읽는 법을 들려줘요" },

    /* 卡片（共用，js/deck.js） */
    progress: { hant: "記住了 {k} / {n}", hans: "记住了 {k} / {n}", en: "{k} / {n} learned", ko: "{k} / {n} 외움" },
    famTotal: { hant: "整體熟悉度", hans: "整体熟悉度", en: "Overall familiarity", ko: "전체 익숙함" },
    famPct: { hant: "熟悉度 {p}%", hans: "熟悉度 {p}%", en: "Familiarity {p}%", ko: "익숙함 {p}%" },
    famUp: { hant: "熟悉度 {a}% → {b}%", hans: "熟悉度 {a}% → {b}%", en: "Familiarity {a}% → {b}%", ko: "익숙함 {a}% → {b}%" },
    lv3: { hant: "記住了", hans: "记住了", en: "Learned", ko: "외움" },
    lv2: { hant: "快記住了", hans: "快记住了", en: "Almost", ko: "거의 외움" },
    lv1: { hant: "剛認識", hans: "刚认识", en: "Started", ko: "익히는 중" },
    lv0: { hant: "還沒學", hans: "还没学", en: "New", ko: "아직 안 배움" },
    deckRule: { hant: "一回 {n} 題。答對熟悉度 +1、答錯 -1，到 {g} 就算記住。", hans: "一回 {n} 题。答对熟悉度 +1、答错 -1，到 {g} 就算记住。", en: "{n} questions per round. Correct +1, wrong -1; a word is learned at {g}.", ko: "한 번에 {n}문제. 맞히면 익숙함 +1, 틀리면 -1, {g}이 되면 외운 거예요." },
    deckStart: { hant: "開始（{n} 題）", hans: "开始（{n} 题）", en: "Start ({n} questions)", ko: "시작 ({n}문제)" },
    qOf: { hant: "第 {i} / {n} 題", hans: "第 {i} / {n} 题", en: "Question {i} / {n}", ko: "{i} / {n}번" },
    deckFinish: { hant: "看結果", hans: "看结果", en: "See results", ko: "결과 보기" },
    roundDone: { hant: "這一回結束", hans: "这一回结束", en: "Round complete", ko: "이번 회 끝" },
    roundScore: { hant: "答對 {r} / {n}", hans: "答对 {r} / {n}", en: "{r} / {n} correct", ko: "{r} / {n} 정답" },
    newlyLearned: { hant: "新記住 {k} 個字", hans: "新记住 {k} 个字", en: "{k} new words learned", ko: "새로 외운 단어 {k}개" },
    roundList: { hant: "這一回的字・點一下再聽", hans: "这一回的字・点一下再听", en: "Words this round · tap to hear", ko: "이번 회 단어 · 눌러서 듣기" },
    famLabel: { hant: "熟悉度 {f} / {g}", hans: "熟悉度 {f} / {g}", en: "Familiarity {f} / {g}", ko: "익숙함 {f} / {g}" },
    deckAgain: { hant: "再來一回", hans: "再来一回", en: "Next round", ko: "한 번 더" },
    deckEnd: { hant: "結束", hans: "结束", en: "Done", ko: "끝내기" },

    /* 月曆模板：卡片 */
    seeDay: { hant: "看日期，先在心裡念一次", hans: "看日期，先在心里读一遍", en: "Look at the date and say it in your head", ko: "날짜를 보고 마음속으로 읽어 보세요" },
    seeMonth: { hant: "看月份，先在心裡念一次", hans: "看月份，先在心里读一遍", en: "Look at the month and say it in your head", ko: "월을 보고 마음속으로 읽어 보세요" },
    hearQ: { hant: "聽聲音，選出是哪一個", hans: "听声音，选出是哪一个", en: "Listen and choose the right one", ko: "듣고 맞는 것을 고르세요" },
    readQ: { hant: "看讀法，選出是哪一個", hans: "看读法，选出是哪一个", en: "Read it and choose the right one", ko: "읽는 법을 보고 맞는 것을 고르세요" },
    flip: { hant: "翻牌", hans: "翻牌", en: "Flip", ko: "뒤집기" },
    gotWrong: { hant: "念錯了", hans: "读错了", en: "I missed it", ko: "틀렸어요" },
    gotRight: { hant: "念對了", hans: "读对了", en: "I got it", ko: "맞았어요" },
    nextCard: { hant: "下一張", hans: "下一张", en: "Next card", ko: "다음 카드" },
    reset: { hant: "重設卡片進度", hans: "重置卡片进度", en: "Reset card progress", ko: "카드 진도 초기화" },
    resetConfirm: { hant: "再按一次就會清空卡片進度", hans: "再按一次就会清空卡片进度", en: "Tap again to clear card progress", ko: "한 번 더 누르면 카드 진도가 지워져요" },

    /* 月曆模板：小遊戲 */
    g1name: { hant: "找出特別日", hans: "找出特别日", en: "Find the special days", ko: "특별한 날 찾기" },
    g1desc: { hant: "把讀法特別的 13 天全部點出來，比速度", hans: "把读法特别的 13 天全部点出来，比速度", en: "Tap all 13 days with special readings, as fast as you can", ko: "읽기가 특별한 13일을 모두 빨리 누르세요" },
    g2name: { hant: "聽音點日期", hans: "听音点日期", en: "Hear and tap", ko: "듣고 누르기" },
    g2desc: { hant: "60 秒內聽讀法、點月曆，連續答對有加分", hans: "60 秒内听读法、点月历，连续答对有加分", en: "Hear a date, tap it on the calendar. 60 seconds, streaks score extra", ko: "60초 동안 듣고 달력에서 누르기. 연속 정답은 보너스" },
    g3name: { hant: "選出讀法", hans: "选出读法", en: "Pick the reading", ko: "읽는 법 고르기" },
    g3desc: { hant: "10 題，每題 8 秒，錯的選項都是常見念錯", hans: "10 题，每题 8 秒，错的选项都是常见读错", en: "10 questions, 8 seconds each. Wrong choices are common mistakes", ko: "10문제, 문제당 8초. 오답은 자주 틀리는 읽기" },
    gnote: { hant: "遊戲裡答錯的日子，會自動加進「卡片」多練幾次。", hans: "游戏里答错的日子，会自动加进「卡片」多练几次。", en: "Days you miss in games are added to Cards for extra practice.", ko: "게임에서 틀린 날짜는 카드에 자동으로 추가돼 더 연습하게 돼요." },
    never: { hant: "還沒玩過", hans: "还没玩过", en: "Not played yet", ko: "아직 안 함" },
    bestTime: { hant: "最佳 {t} 秒", hans: "最佳 {t} 秒", en: "Best {t}s", ko: "최고 {t}초" },
    bestScore: { hant: "最高 {s} 分", hans: "最高 {s} 分", en: "Best {s}", ko: "최고 {s}점" },
    quit: { hant: "結束", hans: "结束", en: "Quit", ko: "그만" },
    timeVal: { hant: "<b>{t}</b> 秒", hans: "<b>{t}</b> 秒", en: "<b>{t}</b>s", ko: "<b>{t}</b>초" },
    found: { hant: "找到 <b>{b}</b> / 13", hans: "找到 <b>{b}</b> / 13", en: "Found <b>{b}</b> / 13", ko: "찾음 <b>{b}</b> / 13" },
    left: { hant: "剩 <b>{b}</b> 秒", hans: "剩 <b>{b}</b> 秒", en: "<b>{b}</b>s left", ko: "<b>{b}</b>초 남음" },
    score: { hant: "<b>{b}</b> 分", hans: "<b>{b}</b> 分", en: "<b>{b}</b> pts", ko: "<b>{b}</b>점" },
    combo: { hant: "連擊 {c}", hans: "连击 {c}", en: "streak {c}", ko: "연속 {c}" },
    qNum: { hant: "第 <b>{b}</b> / 10 題", hans: "第 <b>{b}</b> / 10 题", en: "Question <b>{b}</b> / 10", ko: "<b>{b}</b> / 10번" },
    findPrompt: { hant: "把<b>讀法特別</b>的日子全部點出來<small>共 13 天・點錯加 2 秒</small>", hans: "把<b>读法特别</b>的日子全部点出来<small>共 13 天・点错加 2 秒</small>", en: "Tap every day with a <b>special reading</b><small>13 days · each wrong tap adds 2s</small>", ko: "<b>읽기가 특별한</b> 날을 모두 누르세요<small>총 13일 · 틀리면 2초 추가</small>" },
    findWrong: { hant: "{n}日 是規則讀法（{r}）　+2 秒", hans: "{n}日 是规则读法（{r}）　+2 秒", en: "{n}日 follows the rule ({r}) +2s", ko: "{n}日은 규칙대로 읽어요 ({r}) +2초" },
    listenPrompt: { hant: "聽到的是哪一天？<small>點喇叭可以再聽</small>", hans: "听到的是哪一天？<small>点喇叭可以再听</small>", en: "Which day did you hear?<small>Tap the speaker to hear it again</small>", ko: "어느 날짜였나요?<small>스피커를 누르면 다시 들려요</small>" },
    noVoiceShow: { hant: "沒有日文語音，改看讀法", hans: "没有日语语音，改看读法", en: "No Japanese voice here, so read it instead", ko: "일본어 음성이 없어 읽는 법으로 대신해요" },
    itWas: { hant: "剛剛是 {n}日（{r}）", hans: "刚才是 {n}日（{r}）", en: "That was {n}日 ({r})", ko: "방금은 {n}日 ({r})" },
    pickPrompt: { hant: "{d}怎麼念？", hans: "{d}怎么读？", en: "How do you read {d}?", ko: "{d}은 어떻게 읽을까요?" },
    notX: { hant: "不是「{p}」。", hans: "不是「{p}」。", en: "Not 「{p}」. ", ko: "오답: 「{p}」. " },
    timeUp: { hant: "時間到。", hans: "时间到。", en: "Time's up. ", ko: "시간 초과. " },
    timeUpShort: { hant: "時間到", hans: "时间到", en: "Time's up", ko: "시간 초과" },
    nextQ: { hant: "下一題", hans: "下一题", en: "Next", ko: "다음 문제" },
    newRec: { hant: "新紀錄", hans: "新纪录", en: "New record", ko: "신기록" },
    missN: { hant: "點錯 {m} 次（+{p} 秒）", hans: "点错 {m} 次（+{p} 秒）", en: "{m} wrong taps (+{p}s)", ko: "{m}번 틀림 (+{p}초)" },
    noMiss: { hant: "一次都沒點錯", hans: "一次都没点错", en: "No wrong taps", ko: "한 번도 안 틀림" },
    findHead: { hant: "這些是規則讀法，不是特別日", hans: "这些是规则读法，不是特别日", en: "These follow the rule, so they are not special", ko: "이 날짜들은 규칙대로 읽어요" },
    listenNote: { hant: "答對 {r} 題・最高連擊 {c}", hans: "答对 {r} 题・最高连击 {c}", en: "{r} correct · best streak {c}", ko: "{r}개 정답 · 최고 연속 {c}" },
    listenHead: { hant: "聽錯的日子（已加進卡片）", hans: "听错的日子（已加进卡片）", en: "Days you missed (added to Cards)", ko: "틀린 날짜 (카드에 추가됨)" },
    pickNote: { hant: "答對 {r} / 10", hans: "答对 {r} / 10", en: "{r} / 10 correct", ko: "{r} / 10 정답" },
    pickHead: { hant: "答錯的題目（已加進卡片）", hans: "答错的题目（已加进卡片）", en: "Questions you missed (added to Cards)", ko: "틀린 문제 (카드에 추가됨)" },
    youPicked: { hant: "你選了「{p}」", hans: "你选了「{p}」", en: "You chose 「{p}」", ko: "고른 답: 「{p}」" },
    tapToHear: { hant: "點一下再聽", hans: "点一下再听", en: "tap to hear", ko: "눌러서 듣기" },
    menu: { hant: "回選單", hans: "回菜单", en: "All games", ko: "게임 목록" },
    again: { hant: "再玩一次", hans: "再玩一次", en: "Play again", ko: "다시 하기" },

    /* 刻度模板：總覽圖 */
    lvOnly1: { hant: "只看第 1 級", hans: "只看第 1 级", en: "Level 1 only", ko: "1단계만" },
    lvAll: { hant: "加上第 2 級", hans: "加上第 2 级", en: "Add level 2", ko: "2단계 추가" },
    levelTag: { hant: "第 {l} 級・約 {p}%", hans: "第 {l} 级・约 {p}%", en: "Level {l} · about {p}%", ko: "{l}단계 · 약 {p}%" },
    naiTag: { hant: "後面要接〜ない", hans: "后面要接〜ない", en: "Takes a negative (〜ない)", ko: "뒤에 부정(〜ない)이 와요" },
    tapWord: { hant: "點直尺上的字，看意思和例句", hans: "点直尺上的字，看意思和例句", en: "Tap a word on the ruler to see its meaning and an example", ko: "자 위의 단어를 누르면 뜻과 예문이 나와요" },
    exLabel: { hant: "例句", hans: "例句", en: "Example", ko: "예문" },
    exPlay: { hant: "播放例句", hans: "播放例句", en: "Play the example", ko: "예문 듣기" },

    /* 刻度模板：卡片 */
    seeWordQ: { hant: "看日文，想想是什麼意思", hans: "看日文，想想是什么意思", en: "What does this word mean?", ko: "이 단어는 무슨 뜻일까요?" },
    hearMeanQ: { hant: "聽聲音，選出意思", hans: "听声音，选出意思", en: "Listen and choose the meaning", ko: "듣고 뜻을 고르세요" },
    readMeanQ: { hant: "看日文，選出意思", hans: "看日文，选出意思", en: "Read it and choose the meaning", ko: "보고 뜻을 고르세요" },
    pickJaQ: { hant: "這個意思的日文是哪一個？", hans: "这个意思的日文是哪一个？", en: "Which Japanese word means this?", ko: "이 뜻의 일본어는 어느 것일까요?" },
    gotWrongMean: { hant: "想錯了", hans: "想错了", en: "I missed it", ko: "틀렸어요" },
    gotRightMean: { hant: "想對了", hans: "想对了", en: "I got it", ko: "맞았어요" },

    /* 刻度模板：小遊戲 */
    s1name: { hant: "排排看", hans: "排排看", en: "Put them in order", ko: "순서대로 놓기" },
    s1desc: { hant: "從最常到最少依序點 4 個字，共 5 回，比速度", hans: "从最常到最少依次点 4 个字，共 5 回，比速度", en: "Tap 4 words from most to least often. 5 rounds, as fast as you can", ko: "가장 자주부터 가장 드물게까지 4개를 순서대로. 5라운드, 속도 대결" },
    s2name: { hant: "哪個比較常", hans: "哪个比较常", en: "Which is more often?", ko: "어느 쪽이 더 자주?" },
    s2desc: { hant: "兩個字選比較常的那個。60 秒，連續答對有加分", hans: "两个字选比较常的那个。60 秒，连续答对有加分", en: "Pick the more frequent of two words. 60 seconds, streaks score extra", ko: "둘 중 더 자주인 쪽 고르기. 60초, 연속 정답 보너스" },
    s3name: { hant: "〜ない 陷阱", hans: "〜ない 陷阱", en: "The 〜ない trap", ko: "〜ない 함정" },
    s3desc: { hant: "選出正確的句子。10 題，有些字後面一定要接否定", hans: "选出正确的句子。10 题，有些字后面一定要接否定", en: "Choose the right sentence. 10 questions; some words always take a negative", ko: "맞는 문장 고르기. 10문제, 뒤에 꼭 부정이 오는 단어도 있어요" },
    gnoteWord: { hant: "遊戲裡答錯的字，會自動加進「卡片」多練幾次。", hans: "游戏里答错的字，会自动加进「卡片」多练几次。", en: "Words you miss in games are added to Cards for extra practice.", ko: "게임에서 틀린 단어는 카드에 자동으로 추가돼 더 연습하게 돼요." },
    orderPrompt: { hant: "從<b>最常</b>到<b>最少</b>，依序點<small>點錯加 {s} 秒</small>", hans: "从<b>最常</b>到<b>最少</b>，依次点<small>点错加 {s} 秒</small>", en: "Tap from <b>most</b> to <b>least</b> often<small>each wrong tap adds {s}s</small>", ko: "<b>가장 자주</b>부터 <b>가장 드물게</b>까지 순서대로<small>틀리면 {s}초 추가</small>" },
    roundN: { hant: "第 <b>{b}</b> / 5 回", hans: "第 <b>{b}</b> / 5 回", en: "Round <b>{b}</b> / 5", ko: "<b>{b}</b> / 5 라운드" },
    orderWrong: { hant: "「{w}」還不是最常的那個　+{s} 秒", hans: "「{w}」还不是最常的那个　+{s} 秒", en: "「{w}」 is not the most frequent one left +{s}s", ko: "「{w}」보다 더 자주인 단어가 남아 있어요 +{s}초" },
    comparePrompt: { hant: "哪一個比較<b>常</b>？", hans: "哪一个比较<b>常</b>？", en: "Which one is <b>more often</b>?", ko: "어느 쪽이 더 <b>자주</b>일까요?" },
    compareWrong: { hant: "「{a}」（約 {pa}%）比「{b}」（約 {pb}%）常", hans: "「{a}」（约 {pa}%）比「{b}」（约 {pb}%）常", en: "「{a}」 (about {pa}%) is more often than 「{b}」 (about {pb}%)", ko: "「{a}」(약 {pa}%)가 「{b}」(약 {pb}%)보다 자주예요" },
    naiPrompt: { hant: "哪一句是「{m}」？", hans: "哪一句是「{m}」？", en: "Which sentence means \"{m}\"?", ko: "「{m}」에 맞는 문장은?" },
    missHead: { hant: "答錯的字（已加進卡片）", hans: "答错的字（已加进卡片）", en: "Words you missed (added to Cards)", ko: "틀린 단어 (카드에 추가됨)" },

    /* 一圖多詞模板：總覽圖 */
    levelLabel: { hant: "難度", hans: "难度", en: "Level", ko: "난이도" },
    lvEasy: { hant: "簡單", hans: "简单", en: "Easy", ko: "쉬움" },
    lvMid: { hant: "中", hans: "中", en: "Medium", ko: "보통" },
    lvHard: { hant: "難", hans: "难", en: "Hard", ko: "어려움" },
    lvBasic: { hant: "基本", hans: "基本", en: "Basic", ko: "기본" },
    lvAdv: { hant: "進階", hans: "进阶", en: "Advanced", ko: "심화" },
    partsCount: { hant: "{n} 個部位", hans: "{n} 个部位", en: "{n} parts", ko: "부위 {n}개" },
    hideNames: { hant: "藏起名稱，自己考自己", hans: "藏起名称，自己考自己", en: "Hide names and test yourself", ko: "이름을 숨기고 스스로 테스트" },
    trapTag: { hant: "紅色＝跟中文不一樣", hans: "红色＝跟中文不一样", en: "Red = tricky kanji", ko: "빨간색 = 한자 뜻이 달라요" },
    artNote: { hant: "暫代插圖，之後換成 Midjourney 的插畫", hans: "暂代插图，之后换成 Midjourney 的插画", en: "Placeholder art. Midjourney illustrations are coming.", ko: "임시 그림이에요. 나중에 Midjourney 그림으로 바뀌어요." },
    tapPart: { hant: "點圖上的部位，看讀法、常用句和慣用句", hans: "点图上的部位，看读法、常用句和惯用句", en: "Tap a part to see its reading, everyday phrases and idioms", ko: "부위를 누르면 읽는 법, 자주 쓰는 표현, 관용구가 나와요" },
    phrasesH: { hant: "常用句", hans: "常用句", en: "Everyday phrases", ko: "자주 쓰는 표현" },
    idiomsH: { hant: "慣用句（日本人的比喻）", hans: "惯用句（日本人的比喻）", en: "Idioms", ko: "관용구" },

    /* 一圖多詞模板：卡片 */
    whereQ: { hant: "這是哪裡？", hans: "这是哪里？", en: "What is this part called?", ko: "여기는 어디일까요?" },
    tapHearQ: { hant: "聽到的是哪裡？在圖上點點看", hans: "听到的是哪里？在图上点点看", en: "Which part did you hear? Tap it", ko: "들은 부위를 그림에서 눌러 보세요" },
    tapReadQ: { hant: "這是哪裡？在圖上點點看", hans: "这是哪里？在图上点点看", en: "Where is this? Tap it on the picture", ko: "어디일까요? 그림에서 눌러 보세요" },
    seePartQ: { hant: "想想看：在哪裡？什麼意思？", hans: "想想看：在哪里？什么意思？", en: "Where is it, and what does it mean?", ko: "어디인지, 무슨 뜻인지 떠올려 보세요" },
    tapHere: { hant: "點這裡", hans: "点这里", en: "Tap here", ko: "여기를 누르기" },

    /* 一圖多詞模板：小遊戲 */
    b1name: { hant: "點點看", hans: "点点看", en: "Tap the part", ko: "눌러 보기" },
    b1desc: { hant: "聽到部位的名稱，在圖上點出來。60 秒，連續答對有加分", hans: "听到部位的名称，在图上点出来。60 秒，连续答对有加分", en: "Hear a body part and tap it. 60 seconds, streaks score extra", ko: "부위 이름을 듣고 그림에서 누르기. 60초, 연속 정답 보너스" },
    b2name: { hant: "這是哪裡", hans: "这是哪里", en: "Name the part", ko: "이름 맞히기" },
    b2desc: { hant: "看亮起來的部位，選出讀法。10 題，每題 8 秒", hans: "看亮起来的部位，选出读法。10 题，每题 8 秒", en: "Choose the reading for the highlighted part. 10 questions, 8 seconds each", ko: "표시된 부위의 읽는 법 고르기. 10문제, 문제당 8초" },
    b3name: { hant: "慣用句挑戰", hans: "惯用句挑战", en: "Idiom challenge", ko: "관용구 도전" },
    b3desc: { hant: "慣用句缺了一個身體部位，選出正確的那個", hans: "惯用句缺了一个身体部位，选出正确的那个", en: "An idiom is missing a body part. Pick the right one", ko: "관용구에서 빠진 신체 부위를 고르세요" },
    itWasPart: { hant: "剛剛是「{w}」", hans: "刚才是「{w}」", en: "That was 「{w}」", ko: "방금은 「{w}」" },
    /* 圖卡模板 */
    groupAll: { hant: "全部", hans: "全部", en: "All", ko: "전체" },
    tapFood: { hant: "點圖卡，看讀法、意思和例句", hans: "点图卡，看读法、意思和例句", en: "Tap a picture to see its reading, meaning and an example", ko: "그림을 누르면 읽는 법·뜻·예문이 나와요" },
    artNoteEmoji: { hant: "暫代圖（emoji），之後換成 Midjourney 的插畫", hans: "暂代图（emoji），之后换成 Midjourney 的插画", en: "Placeholder pictures (emoji), to be replaced with illustrations", ko: "임시 그림(이모지), 나중에 일러스트로 바뀝니다" },
    whatQ: { hant: "這是什麼？", hans: "这是什么？", en: "What is this?", ko: "이건 뭘까요?" },
    seeFoodQ: { hant: "想想看：這是什麼？", hans: "想想看：这是什么？", en: "What is it? Picture it, then flip", ko: "뭘까요? 떠올려 보고 뒤집어 보세요" },
    c1name: { hant: "聽音找圖", hans: "听音找图", en: "Hear and find", ko: "듣고 찾기" },
    c1desc: { hant: "聽到名稱，從 6 張圖裡點出來。60 秒，連續答對有加分", hans: "听到名称，从 6 张图里点出来。60 秒，连续答对有加分", en: "Hear a word, tap it among 6 pictures. 60 seconds, streaks score extra", ko: "듣고 그림 6장 중에서 고르기. 60초, 연속 정답 보너스" },
    c2name: { hant: "這是什麼", hans: "这是什么", en: "Name it", ko: "이름 맞히기" },
    c2desc: { hant: "看圖選出讀法。10 題，每題 8 秒", hans: "看图选出读法。10 题，每题 8 秒", en: "See a picture, pick the reading. 10 questions, 8 seconds each", ko: "그림을 보고 읽는 법 고르기. 10문제, 문제당 8초" },
    c3name: { hant: "分分看", hans: "分分看", en: "Sort it", ko: "분류하기" },
    c3desc: { hant: "只看日文、沒有圖，分到對的類別。60 秒，所有分類一起出題", hans: "只看日文、没有图，分到对的类别。60 秒，所有分类一起出题", en: "Japanese only, no picture: put it in the right group. 60 seconds, all groups", ko: "그림 없이 일본어만 보고 분류하기. 60초, 모든 분류에서 출제" },
    sortQ: { hant: "這是哪一類？", hans: "这是哪一类？", en: "Which group is it?", ko: "어느 분류일까요?" },
    sortWrong: { hant: "「{w}」是「{g}」", hans: "「{w}」是「{g}」", en: "「{w}」 is 「{g}」", ko: "「{w}」는 「{g}」" },
    c4name: { hant: "點餐", hans: "点餐", en: "Take the order", ko: "주문 받기" },
    c4desc: { hant: "聽客人點了什麼，從 8 張圖裡全部點出來。60 秒，越後面點越多", hans: "听客人点了什么，从 8 张图里全部点出来。60 秒，越后面点越多", en: "Hear the order, then tap every item among 8 pictures. 60 seconds, orders get longer", ko: "주문을 듣고 그림 8장 중에서 모두 고르기. 60초, 갈수록 주문이 길어져요" },
    orderQ: { hant: "客人點了什麼？全部點出來", hans: "客人点了什么？全部点出来", en: "What did they order? Tap every item", ko: "무엇을 주문했을까요? 모두 고르세요" },
    orderAgain: { hant: "客人沒有點這個，再聽一次", hans: "客人没有点这个，再听一次", en: "That wasn't ordered. Listen again", ko: "그건 주문하지 않았어요. 다시 들어 보세요" },
    orderWas: { hant: "客人點的是", hans: "客人点的是", en: "The order was", ko: "주문은" },
    orderTr: { hant: "請給我{w}", hans: "请给我{w}", en: "{w}, please", ko: "{w} 주세요" },
    orderSep: { hant: "、", hans: "、", en: ", ", ko: ", " },
    orderJoin: { hant: "和", hans: "和", en: " and ", ko: ", " },
    orderNote: { hant: "完成 {r} 份點餐・最多連續 {c} 份", hans: "完成 {r} 份点餐・最多连续 {c} 份", en: "{r} orders served · best streak {c}", ko: "주문 {r}개 완료 · 최고 연속 {c}" },

    missHeadPart: { hant: "答錯的部位（已加進卡片）", hans: "答错的部位（已加进卡片）", en: "Parts you missed (added to Cards)", ko: "틀린 부위 (카드에 추가됨)" }
  };

  var lang = "hant";

  function t(key, vars) {
    var e = T[key];
    var s = e ? (e[lang] != null ? e[lang] : e.hant) : key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }

  /** 資料檔裡的多語物件 { hant, hans, en, ko } 取目前語言 */
  function loc(o) {
    if (!o) return "";
    return o[lang] != null ? o[lang] : o.hant;
  }

  /** 資料檔裡的說明文字：**粗體**，假名換成教科書體 */
  function rich(s) {
    return String(s)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/[ぁ-ゖゝゞァ-ヺー-ヾ]+/g, function (m) {
        return '<span class="kana">' + m + "</span>";
      });
  }

  /** 第一次來：照瀏覽器語言猜；其他語言都先給英文 */
  function detect() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var l = String(list[i]).toLowerCase();
      if (/^zh-(tw|hk|mo|hant)/.test(l)) return "hant";
      if (/^zh/.test(l)) return "hans";
      if (/^ko/.test(l)) return "ko";
      if (/^en/.test(l)) return "en";
    }
    return "en";
  }

  window.VocabI18n = {
    LANGS: LANGS,
    t: t,
    loc: loc,
    rich: rich,
    detect: detect,
    setLang: function (l) { if (LANGS.some(function (x) { return x[0] === l; })) lang = l; },
    getLang: function () { return lang; },
    htmlLang: function () {
      for (var i = 0; i < LANGS.length; i++) if (LANGS[i][0] === lang) return LANGS[i][2];
      return "zh-Hant";
    }
  };
})();
