/* ============================================================
   GameFlow：遊戲流程狀態機
   選單 → 單店/雙店 → 單廚/雙廚 → 選場數(1~4) → N 場
   每場都一樣：自己配料 或 讓當場客人隨機點（客人立繪 cust_*.png）→ 結算
   雙店＋雙廚：同一場內一號店做完 → 二號店做
   雙店＋單廚＝「對戰」：兩店同題兩盤同時做、直接比三場（省時間）
   雙廚／對戰：同配方兩盤同時做（左盤滑鼠、右盤鍵盤 1~5、Enter 起鍋）
   ============================================================ */
window.PC = window.PC || {};

PC.GameFlow = class {
    constructor() {
        this.mgr = new PC.SceneManager(document.getElementById('stage'));
        this.mgr.onTick = (dt, now) => this._tick(dt, now);
        this.mgr.onCanvasClick = (x, y) => this.sessions.forEach(s => s.tryClick(x, y));
        PC.charts.onZones = () => this.mgr.activeRigs().forEach(r => r.rebuildColors());

        this.storeMode = null;    // 'single' | 'versus'
        this.chefMode = null;     // 'solo' | 'duo'
        this.practice = false;    // 練習模式：直接選料製作、做完看結果、可再一盤或回首頁
        this.stores = [];
        this.roundCount = PC.config.ROUND_DEFAULT;   // 要比幾場（1~4，設定階段可選）
        this.roundIdx = 0;
        this.storeIdx = 0;
        this.sessions = [];
        this.mouseSide = 0;       // 雙盤時哪一盤用滑鼠（另一盤用鍵盤）；每場可於點菜單重選，預設左盤
        this.phase = 'menu';      // menu | setup | order | cooking | verdict | board | final

        addEventListener('keydown', e => {
            if (this.phase !== 'cooking') return;
            if (e.key >= '1' && e.key <= '5')
                this.sessions.forEach(s => s.tryKey(+e.key));
            else if (e.key === 'Enter')
                this.sessions.filter(s => s.input === 'keys').forEach(s => s.serve());
        });
    }

    boot() {
        PC.ui.init(this);
        this._showMenuScene();
    }

    // 選單場景：背景端出一盤展示品＋顯示主選單＋選單 BGM（boot 與「回首頁」共用）
    _showMenuScene() {
        const demo = JSON.parse(JSON.stringify(PC.config.DEFAULT_ORDER));
        const rigs = this.mgr.layout('solo');
        rigs[0].setPattern(demo.pattern);
        PC.charts.load(demo.pattern, demo, () => rigs[0].demoPlate(demo));
        this.mgr.freeView();
        PC.ui.showMenu();
        PC.audio.bgm('bgm_menu');
    }

    // ---------- 設定階段 ----------
    selectStoreMode(mode) {
        this.storeMode = mode;
        const defs = PC.config.STORES;
        const n = mode === 'versus' ? 2 : 1;
        this.stores = defs.slice(0, n).map(d => ({ ...d, chefs: [], results: [], total: 0 }));
        PC.ui.showChefMode();
    }
    selectChefMode(mode) {
        this.chefMode = mode;
        // 兩隊角色固定（第一隊無尾熊、第二隊貓）；每隊人數＝單廚 1／雙廚 2，兩盤都用該隊角色。
        const n = mode === 'duo' ? 2 : 1;
        this.stores.forEach(st => { st.chefs = Array.from({ length: n }, () => st.chef); });
        // 接著選要比幾場
        PC.ui.showRoundCount(this.roundCount);
    }
    selectRoundCount(n) {
        this.roundCount = Math.max(PC.config.ROUND_MIN, Math.min(PC.config.ROUND_MAX, n));
        // 「選隊友」只是提醒、不用真的選——現場自己喬
        PC.ui.showTeamIntro(this.stores, this.chefMode, () => this._startRounds());
    }

    // ---------- 練習模式 ----------
    // 跳過選店/選廚/回合，直接開點菜單，做完看結果，可再一盤或回首頁
    startPractice() {
        this.practice = true;
        this.storeMode = null;
        this.chefMode = 'solo';
        // 借第一隊角色當練習廚師；不進計分板（updateTally 會因 practice 略過）
        const def = PC.config.STORES[0];
        this.stores = [{ ...def, chefs: [def.chef], results: [], total: 0 }];
        this.storeIdx = 0;
        this.roundIdx = 0;
        this._practiceOrder();
    }

    _practiceOrder() {
        PC.audio.bgm('bgm_menu');   // 練習點菜畫面用開場曲
        const store = this.stores[0];
        this.phase = 'order';
        // 沿用上一盤的選擇，讓「再做一盤」更順手
        const order = this._lastPracticeOrder
            ? JSON.parse(JSON.stringify(this._lastPracticeOrder))
            : JSON.parse(JSON.stringify(PC.config.DEFAULT_ORDER));
        // 佈局重設（相機回標準位、盤面清空）
        const rigs = this.mgr.layout('solo');
        rigs.forEach(r => r.reset());
        this.mgr.freeView();
        PC.ui.setTitleInfo('練習模式 — 自由選料，做完看結果');
        PC.ui.openOrderModal({
            title: '練習模式',
            mascot: store.chef.img,
            mascotEmoji: store.chef.emoji,
            sub: '自由選料——想練哪道就選哪道，做完立刻看結果。',
            order,
            confirmText: '🧶 開始編織',
            onChange: o => this._previewOrder(o),
            onConfirm: o => { this._lastPracticeOrder = JSON.parse(JSON.stringify(o)); this._startCook(o); }
        });
    }

    _exitToMenu() {
        this.practice = false;
        this.storeMode = null;
        this.chefMode = null;
        this.stores = [];
        this.sessions = [];
        this.roundIdx = 0;
        this.storeIdx = 0;
        this.phase = 'menu';
        this._showMenuScene();
    }

    // ---------- 回合流程 ----------
    _startRounds() {
        this.roundIdx = 0;
        this._beginRound();
    }
    _beginRound() {
        this.storeIdx = 0;
        this._beginTurn();
    }
    _beginTurn() {
        this.phase = 'order';
        const duel = this._isDuel();
        // 佈局重設（相機回標準位、盤面清空）；對戰與雙廚都用兩盤佈局
        const rigs = this.mgr.layout((duel || this.chefMode === 'duo') ? 'duo' : 'solo');
        rigs.forEach(r => r.reset());
        this.mgr.freeView();
        // 每場先抽一位客人（立繪＋隨機點）——所有模式、每場都一樣
        this._roundCustomer = this._pick(PC.config.CUSTOMERS);
        const story = this._storyTurn();
        const tag = `第 ${this.roundIdx + 1}/${this.roundCount} 場${story ? ' · ' + story.theme : ''}`;
        if (duel) {
            const [a, b] = this.stores;
            PC.ui.setTitleInfo(`${tag} · ${a.name} ⚔️ ${b.name}`);
        } else {
            const store = this.stores[this.storeIdx];
            PC.ui.setTitleInfo(`${tag} · ${store.name} ${store.emoji}`);
        }
        this._orderPhase();
    }

    // 每場統一：自己配一盤，或按 🎲 讓當場客人隨機點（客人立繪＝mascot）
    _orderPhase() {
        PC.audio.bgm('bgm_menu');   // 點菜畫面回開場曲（與看分數曲區隔）
        const duel = this._isDuel();
        const store = this.stores[this.storeIdx];
        const story = this._storyTurn();   // 選 4 場時的固定劇本（角色／台詞／主題／難度）
        const cust = this._roundCustomer || (this._roundCustomer = this._pick(PC.config.CUSTOMERS));
        // 劇本模式：出題角色（查角色庫）與台詞照劇本、骰子出題套劇本難度；否則沿用隨機客人
        const who = story ? (PC.config.CHARACTERS[story.charKey] || cust) : cust;
        const dice = story
            ? { label: story.diceLabel || '🎲 隨機出題', gen: () => this._genOrder(story.weights) }
            : { label: `🎲 讓 ${cust.name} 隨機點`, gen: () => this._genOrder('customer') };
        PC.ui.openOrderModal({
            title: story ? `第 ${this.roundIdx + 1} 場 · ${story.theme}` : `第 ${this.roundIdx + 1} 場`,
            mascot: who.img || store.chef.img,
            mascotEmoji: who.emoji || store.chef.emoji,
            sub: `${PC.config.HIDE_ORDER_DIALOG_EMOJI ? '' : `${who.emoji} `}${who.name}：「${story ? story.line : who.line}」${PC.config.HIDE_ORDER_RANDOM_HINT ? '' : `——${duel ? '兩隊接同一張單' : '自己配一盤'}，或按 🎲 ${story ? '出題' : `讓 ${who.name} 隨機點`}！`}`,
            order: JSON.parse(JSON.stringify(PC.config.DEFAULT_ORDER)),
            confirmText: '🔥 接單開做',
            dice,
            inputChoice: this._inputChoice(duel),
            onChange: o => this._previewOrder(o),
            onConfirm: o => this._startCook(o)
        });
    }

    // 雙盤（對戰／雙廚）才需要：讓玩家每場指定左右盤誰用滑鼠、誰用鍵盤
    // 回傳 null＝單盤，點菜單就不顯示這塊
    _inputChoice(duel) {
        if (!duel && this.chefMode !== 'duo') return null;
        // 左盤＝seat 0、右盤＝seat 1。對戰兩盤各屬一隊；雙廚兩盤同隊，用「玩家 1／2」區分
        const seats = duel
            ? this.stores.map(st => ({ face: st.chef, name: st.chef.name, sub: st.name }))
            : [0, 1].map(i => {
                const st = this.stores[this.storeIdx];
                return { face: st.chef, name: `玩家 ${i + 1}`, sub: st.name };
            });
        return {
            seats,
            mouseSide: this.mouseSide,
            onPick: side => { this.mouseSide = side; }
        };
    }

    _previewOrder(order) {
        const rigs = this.mgr.activeRigs();
        rigs.forEach(r => { r.setPattern(order.pattern); r.setOrder(order); });
        PC.charts.load(order.pattern, order);
        PC.ui.setRecipe(order);
    }

    _startCook(order) {
        const duel = this._isDuel();
        // 對戰：兩盤各屬一隊；一般：整盤都屬當前店
        const owners = duel ? this.stores : [this.stores[this.storeIdx]];
        owners.forEach(st => st.currentOrder = order);
        PC.ui.hideOverlays();
        const rigs = this.mgr.activeRigs();
        rigs.forEach(r => { r.setPattern(order.pattern); r.setOrder(order); });
        PC.ui.setRecipe(order);

        // 織圖 zoneMap 就緒後才倒數（快取後幾乎即時）
        PC.charts.load(order.pattern, order, () => {
            this.mgr.lockView();    // 視角固定回標準機位，兩盤對齊各自的起鍋卡
            this.sessions = rigs.map((rig, i) => {
                const store = duel ? this.stores[i] : this.stores[this.storeIdx];
                const chef = duel ? store.chef : (store.chefs[i] || store.chefs[0]);
                const s = new PC.CookSession({
                    mgr: this.mgr, rig, order,
                    input: (i === this.mouseSide) ? 'mouse' : 'keys',   // 滑鼠盤由玩家在點菜單指定，另一盤用鍵盤
                    sideIdx: i,
                    chef
                });
                s.onServed = () => this._onServed();
                return s;
            });
            PC.ui.showHud(this.stores[this.storeIdx], this.sessions, order);
            // 倒數前先亮提示：盤上第一針標記＋起鍋卡的段落/按鍵提示（計時等 GO 才開始跑）
            this.sessions.forEach(s => s.preview());
            PC.ui.updateHud(this.sessions);
            PC.ui.countdown(() => {
                this.phase = 'cooking';
                this.sessions.forEach(s => s.start());
                PC.audio.bgm('bgm_cooking');
            });
        });
    }

    _tick(dt) {
        if (this.phase === 'cooking') {
            this.sessions.forEach(s => s.update(dt));
            PC.ui.updateHud(this.sessions);
        }
    }

    serveFromButton(sideIdx) {
        const s = this.sessions[sideIdx];
        if (s) s.serve();
    }

    _onServed() {
        PC.ui.updateHud(this.sessions);
        if (this.sessions.some(s => !s.served)) return;
        this.phase = 'verdict';
        setTimeout(() => this._isDuel() ? this._duelDone() : this._turnDone(), 1100);   // 讓配料掉完、鏡頭喘口氣
    }

    // 對戰（雙店＋單廚）：兩盤同題同時做完 → 各盤分數記到各自的店、一畫面比出本場勝方
    _duelDone() {
        const plates = this.sessions.map(s => s.result);
        const order = this.stores[0].currentOrder;
        this.stores.forEach((st, i) => {
            st.results[this.roundIdx] = { score: plates[i].total, plates: [plates[i]] };
            st.total += plates[i].total;
        });
        this.mgr.freeView();
        PC.audio.bgm(this._resultBgm(Math.max(...plates.map(p => p.total))));
        PC.audio.play('sfx_result');
        const last = this.roundIdx + 1 >= this.roundCount;
        // 兩隊分數相加沒有意義 → 用 headline 放勝負橫幅取代滾動總分，其餘與雙廚同一套版面
        const [pa, pb] = plates;
        const win = pa.total === pb.total ? null : (pa.total > pb.total ? this.stores[0] : this.stores[1]);
        PC.ui.showVerdict({
            eyebrow: `⚔️ 第 ${this.roundIdx + 1} 場`,
            headline: win ? `${win.emoji} ${win.name} 這場勝出！` : '🤝 這場平手！',
            plates,
            chefs: this.sessions.map(s => s.chef),
            inputs: this.sessions.map(s => s.input),
            order,
            pattern: order && order.pattern,
            nextLabel: last ? `看最終結果 <span class="mi">sports_score</span>` : `下一場 <span class="mi">play_arrow</span>`,
            onNext: () => this._nextRound()
        });
    }

    _turnDone() {
        const store = this.stores[this.storeIdx];
        const plates = this.sessions.map(s => s.result);
        const score = plates.reduce((a, r) => a + r.total, 0);
        store.results[this.roundIdx] = { score, plates };
        store.total += score;
        this.mgr.freeView();
        PC.audio.bgm(this._resultBgm(score, plates.length));
        PC.audio.play('sfx_result');
        PC.ui.showVerdict({
            store,
            roundLabel: `第 ${this.roundIdx + 1} 場`,
            eyebrow: this.practice ? '🧶 練習模式' : null,
            plates,
            chefs: this.sessions.map(s => s.chef),
            inputs: this.sessions.map(s => s.input),
            score,
            pattern: store.currentOrder && store.currentOrder.pattern,
            order: store.currentOrder,
            nextLabel: this.practice ? `再做一盤 <span class="mi">refresh</span>` : null,
            onNext: () => this.practice ? this._practiceOrder() : this._afterTurn(),
            onHome: this.practice ? () => this._exitToMenu() : null
        });
    }

    _afterTurn() {
        this.storeIdx++;
        if (this.storeIdx < this.stores.length) return this._beginTurn();
        // 這一場所有店做完
        if (this.storeMode === 'versus') {
            this.phase = 'board';
            PC.ui.showScoreboard(this.stores, this.roundIdx, () => this._nextRound());
        } else this._nextRound();
    }
    _nextRound() {
        this.roundIdx++;
        if (this.roundIdx < this.roundCount) return this._beginRound();
        this._finale();
    }
    _finale() {
        this.phase = 'final';
        if (this.storeMode === 'versus') PC.audio.play('sfx_win');
        PC.ui.showFinal(this.stores, this.storeMode);
    }

    // ---------- 工具 ----------
    // 對戰模式＝雙店競賽＋單廚：兩店的主廚兩盤同時對決（左盤滑鼠、右盤鍵盤），直接比三場
    _isDuel() { return this.storeMode === 'versus' && this.chefMode === 'solo'; }
    // 劇本模式：只有「場數 === STORY_SCRIPT.rounds」時，該場回傳對應劇本設定；否則 null（走隨機客人）
    _storyTurn() {
        const S = PC.config.STORY_SCRIPT;
        if (!S || this.roundCount !== S.rounds) return null;
        return S.turns[this.roundIdx] || null;
    }
    _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    // 看分數時的 BGM：達到門檻換更熱鬧的高分曲（#4）
    // 門檻按「盤數」放大：雙廚的 score 是兩盤相加，門檻同乘 2（110 → 220）
    _resultBgm(score, plateCount = 1) {
        return score >= PC.config.RESULT_HIGH_SCORE * plateCount ? 'bgm_result_high' : 'bgm_result';
    }
    // 難度綁在品項本身 → 依難度權重挑「品項」（顧客偏溫和、對手偏兇）
    _genOrder(kind) {
        // kind 可為 ORDER_WEIGHTS 的鍵，或直接傳難度權重陣列 [一般, 難, 超難]（劇本模式用）
        const C = PC.config, w = Array.isArray(kind) ? kind : C.ORDER_WEIGHTS[kind];
        const tierW = { normal: w[0], hard: w[1], expert: w[2] };
        const wPick = entries => {
            const tot = entries.reduce((a, [, d]) => a + tierW[d.diff], 0);
            let r = Math.random() * tot;
            for (const [k, d] of entries) { r -= tierW[d.diff]; if (r <= 0) return k; }
            return entries[entries.length - 1][0];
        };
        const tops = Object.entries(C.TOPPINGS);
        const t1 = wPick(tops);
        const t2 = wPick(tops.filter(([k]) => k !== t1));
        return {
            pattern: wPick(Object.entries(C.PATTERNS)),
            sauce: wPick(Object.entries(C.SAUCES)),
            tops: [t1, t2]
        };
    }
};
