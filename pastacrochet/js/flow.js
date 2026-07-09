/* ============================================================
   GameFlow：遊戲流程狀態機
   選單 → 單店/雙店 → 單廚/雙廚＋選助理 → 3 場
   （自家招牌→顧客點單→對手指定）× 每店 → 結算
   雙店：同一場內一號店做完 → 二號店做
   雙廚：同配方兩盤同時做（左盤滑鼠、右盤鍵盤 1/2/3、Enter 起鍋）
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
        this.roundIdx = 0;
        this.storeIdx = 0;
        this.sessions = [];
        this.phase = 'menu';      // menu | setup | order | cooking | verdict | board | final

        addEventListener('keydown', e => {
            if (this.phase !== 'cooking') return;
            if (e.key >= '1' && e.key <= '3')
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
        this.mgr.spinning = true;
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
        const store = this.stores[0];
        this.phase = 'order';
        // 沿用上一盤的選擇，讓「再做一盤」更順手
        const order = this._lastPracticeOrder
            ? JSON.parse(JSON.stringify(this._lastPracticeOrder))
            : JSON.parse(JSON.stringify(PC.config.DEFAULT_ORDER));
        // 佈局重設（相機回標準位、盤面清空）
        const rigs = this.mgr.layout('solo');
        rigs.forEach(r => r.reset());
        this.mgr.spinning = true;
        PC.ui.setTitleInfo('練習模式 — 自由選料，做完看結果');
        PC.ui.openOrderModal({
            title: '練習模式',
            mascot: store.chef.img,
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
        const store = this.stores[this.storeIdx];
        const round = PC.config.ROUNDS[this.roundIdx];
        // 佈局重設（相機回標準位、盤面清空）
        const rigs = this.mgr.layout(this.chefMode === 'duo' ? 'duo' : 'solo');
        rigs.forEach(r => r.reset());
        this.mgr.spinning = true;
        PC.ui.setTitleInfo(`第 ${this.roundIdx + 1} 場｜${round.label} · ${store.name} ${store.emoji}`);

        PC.ui.showCard({
            icon: store.emoji,
            title: `第 ${this.roundIdx + 1} 場｜${round.label}`,
            sub: `${store.name}，準備上工！`,
            body: round.desc,
            btn: '開始備料 <span class="mi">assignment</span>',
            onBtn: () => this._orderPhase()
        });
    }

    _orderPhase() {
        const store = this.stores[this.storeIdx];
        const round = PC.config.ROUNDS[this.roundIdx];
        const type = round.key;

        if (type === 'self') {
            PC.ui.openOrderModal({
                title: round.label,
                mascot: store.chef.img,
                sub: '自己出題——難度看食材：超難的料（墨魚、培根、花椰菜…）加分更高，但點點更多更密！',
                order: JSON.parse(JSON.stringify(PC.config.DEFAULT_ORDER)),
                confirmText: '🧶 開始編織',
                onChange: o => this._previewOrder(o),
                onConfirm: o => this._startCook(o)
            });
        } else if (type === 'customer') {
            // 預設自己選、保留 🎲 讓顧客隨機點
            const cust = this._pick(PC.config.CUSTOMERS);
            PC.ui.openOrderModal({
                title: round.label,
                mascot: store.chef.img,
                sub: `${cust.emoji} ${cust.name}：「${cust.line}」——自己配一盤，或按 🎲 讓顧客隨機點！`,
                order: JSON.parse(JSON.stringify(PC.config.DEFAULT_ORDER)),
                confirmText: '🔥 接單開做',
                dice: { label: `🎲 讓 ${cust.name} 隨機點`, gen: () => this._genOrder('customer') },
                onChange: o => this._previewOrder(o),
                onConfirm: o => this._startCook(o)
            });
        } else {  // rival 對手指定
            if (this.storeMode === 'versus') {
                const rivalStore = this.stores[1 - this.storeIdx];
                PC.ui.openOrderModal({
                    title: round.label,
                    mascot: store.chef.img,
                    sub: `請 ${rivalStore.name} 的老闆來選——競品研究，別客氣！（難度越高，對方能拿的分也越高喔）`,
                    order: JSON.parse(JSON.stringify(PC.config.DEFAULT_ORDER)),
                    confirmText: '😏 就這道了',
                    onChange: o => this._previewOrder(o),
                    onConfirm: o => {
                        PC.ui.showCard({
                            icon: store.emoji,
                            title: `${store.name}，接招！`,
                            sub: `${rivalStore.name} 指定的難題來了`,
                            body: PC.ui.orderSummaryHTML(o),
                            btn: '🔥 接下戰帖',
                            onBtn: () => this._startCook(o)
                        });
                    }
                });
            } else {
                const rival = PC.config.RIVAL_STORE;
                const order = this._genOrder('rival');
                this._previewOrder(order);
                PC.ui.showOrderCard({
                    who: { ...rival, line: '哼，做得出這道再說吧。' },
                    order,
                    note: '競品研究——對手名店的指定菜！',
                    onConfirm: () => this._startCook(order)
                });
            }
        }
    }

    _previewOrder(order) {
        const rigs = this.mgr.activeRigs();
        rigs.forEach(r => { r.setPattern(order.pattern); r.setOrder(order); });
        PC.charts.load(order.pattern, order);
        PC.ui.setRecipe(order);
    }

    _startCook(order) {
        const store = this.stores[this.storeIdx];
        store.currentOrder = order;
        PC.ui.hideOverlays();
        const rigs = this.mgr.activeRigs();
        rigs.forEach(r => { r.setPattern(order.pattern); r.setOrder(order); });
        PC.ui.setRecipe(order);

        // 織圖 zoneMap 就緒後才倒數（快取後幾乎即時）
        PC.charts.load(order.pattern, order, () => {
            this.mgr.spinning = false;
            this.mgr.updateCamera();
            this.sessions = rigs.map((rig, i) => {
                const s = new PC.CookSession({
                    mgr: this.mgr, rig, order,
                    input: (this.chefMode === 'duo' && i === 1) ? 'keys' : 'mouse',
                    sideIdx: i,
                    chef: store.chefs[i] || store.chefs[0]
                });
                s.onServed = () => this._onServed();
                return s;
            });
            PC.ui.showHud(store, this.sessions, order);
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
        setTimeout(() => this._turnDone(), 1100);   // 讓配料掉完、鏡頭喘口氣
    }

    _turnDone() {
        const store = this.stores[this.storeIdx];
        const plates = this.sessions.map(s => s.result);
        const score = plates.reduce((a, r) => a + r.total, 0);
        store.results[this.roundIdx] = { score, plates };
        store.total += score;
        this.mgr.spinning = true;
        PC.audio.bgm('bgm_menu');
        PC.audio.play('sfx_result');
        PC.ui.showVerdict({
            store,
            roundLabel: `第 ${this.roundIdx + 1} 場｜${PC.config.ROUNDS[this.roundIdx].label}`,
            eyebrow: this.practice ? '🧶 練習模式' : null,
            plates,
            chefs: this.sessions.map(s => s.chef),
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
        if (this.roundIdx < PC.config.ROUNDS.length) return this._beginRound();
        this._finale();
    }
    _finale() {
        this.phase = 'final';
        if (this.storeMode === 'versus') PC.audio.play('sfx_win');
        PC.ui.showFinal(this.stores, this.storeMode);
    }

    // ---------- 工具 ----------
    _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    // 難度綁在品項本身 → 依難度權重挑「品項」（顧客偏溫和、對手偏兇）
    _genOrder(kind) {
        const C = PC.config, w = C.ORDER_WEIGHTS[kind];
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
