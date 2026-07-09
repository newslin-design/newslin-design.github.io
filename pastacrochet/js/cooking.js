/* ============================================================
   CookSession：一盤菜的一次烹飪（節奏判定＋計分＋熟度）
   - 點點排程：總長 DOT_SPAN 秒平均分給 N 點；每點窗 w
     完美＝窗中間 w/2（滿分）、不完美＝前後各 w/4（80%）、
     超級不完美＝窗外（60%）——對應規格 10/8/6 分例
   - 熟度：看「起鍋時刻」落在哪個帶（完美 16~23s），扣總分
   - input: 'mouse'（點針目）或 'keys'（按 1/2/3/4）
   ============================================================ */
window.PC = window.PC || {};

PC.CookSession = class {
    constructor({ mgr, rig, order, input, sideIdx, chef }) {
        this.mgr = mgr; this.rig = rig; this.order = order;
        this.input = input; this.sideIdx = sideIdx; this.chef = chef;

        const stats = PC.orderStats(order);
        this.baseTotal = stats.base;
        this.N = stats.dots;
        this.perDot = stats.perDot;

        this.dots = this._buildDots(order);
        this.idx = 0;
        this.clock = 0;
        this.running = false;
        this.served = false;
        this.scoreDots = 0;
        this.grades = { perfect: 0, ok: 0, bad: 0 };
        this.combo = 0; this.maxCombo = 0;
        this.result = null;
    }

    _buildDots(order) {
        const C = PC.config, D = C.DIFF;
        const nP = D.pattern[C.PATTERNS[order.pattern].diff].dots;
        const nS = D.sauce[C.SAUCES[order.sauce].diff].dots;
        const list = [];
        // 第一幕：織麵（麵條隨點長出）
        for (let i = 0; i < nP; i++)
            list.push({ type: 'pattern', prog: 0.02 + 0.98 * (i + 1) / nP, segLabel: '🧶 織麵', segI: i, segN: nP });
        // 第二幕：上醬（麵從淡色逐步吸飽醬色）
        for (let j = 0; j < nS; j++)
            list.push({ type: 'sauce', level: (j + 1) / nS, frac: (j + 1) / (nS + 1), segLabel: '💧 上醬', segI: j, segN: nS });
        // 第三幕：擺料（每點掉一批配料；難度＝配料自帶）
        order.tops.forEach((key, slot) => {
            const def = C.TOPPINGS[key];
            const dots = D.topping[def.diff].dots;
            const base = Math.floor(def.n / dots), extra = def.n % dots;
            let from = 0;
            for (let k = 0; k < dots; k++) {
                const count = base + (k < extra ? 1 : 0);
                list.push({ type: 'top', slot, key, from, count, segLabel: def.label.split(' ')[0] + ' 擺料', segI: k, segN: dots });
                from += count;
            }
        });
        // 每點時間窗長 = DOT_SPAN / N；計時採相對制——從「該點出現」那一刻起算（v1.2 使用者拍板）
        this.dotW = C.DOT_SPAN / list.length;
        list.forEach((d, i) => {
            d.i = i;
            d.key = 1 + Math.floor(Math.random() * 4);   // 鍵盤模式提示 1/2/3/4
        });
        return list;
    }

    start() {
        this.running = true;
        this.clock = 0;
        this.rig.beginCook();
        this._showCurrentMarker();
    }

    _showCurrentMarker() {
        const d = this.dots[this.idx];
        this.dotShownAt = this.clock;   // 該點的時間窗從此刻起算
        this.rig.showMarkerFor(d || null, d && this.input === 'keys' ? d.key : null);
    }

    /** 判定（相對制）：完美＝窗中點 ± w×PERFECT_FRAC/2、窗內其餘＝不完美、超過窗＝超糟 */
    _judge() {
        const w = this.dotW, r = this.clock - this.dotShownAt;
        if (Math.abs(r - w / 2) <= w * PC.config.PERFECT_FRAC / 2) return 'perfect';
        if (r <= w) return 'ok';
        return 'bad';
    }

    _hitCurrent(screenPos) {
        if (!this.running || this.served || this.idx >= this.N) return;
        const d = this.dots[this.idx];
        const grade = this._judge();
        const gain = this.perDot * PC.config.JUDGE_MULT[grade];
        this.scoreDots += gain;
        this.grades[grade]++;

        let cheer = false;
        if (grade === 'perfect') {
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            if (this.combo % PC.config.COMBO_CHEER === 0) cheer = true;
        } else this.combo = 0;

        // 點的效果
        if (d.type === 'pattern') this.rig.setProgressTarget(d.prog);
        else if (d.type === 'top') this.rig.dropBatch(d.slot, d.from, d.count);
        // 上醬染色與點型別解耦：第 SAUCE_TINT_DOTS[0] 點開始變色、第 [1] 點吸飽全色
        const [tf, tt] = PC.config.SAUCE_TINT_DOTS;
        this.rig.setSauceLevel(((this.idx + 1) - (tf - 1)) / (tt - tf + 1));

        // 音效＋浮字
        PC.audio.play(grade === 'perfect' ? 'sfx_hit_perfect' : grade === 'ok' ? 'sfx_hit_ok' : 'sfx_hit_bad');
        if (cheer) PC.audio.play('sfx_combo');
        const pos = screenPos || this.rig.markerScreen(this.mgr.camera);
        const late = grade === 'bad' ? '太晚！' : '';   // 相對制下超糟只會是「拖過窗」
        PC.ui.hitFx(pos, grade, gain, this.combo, late);
        if (cheer) PC.ui.comboSplash(this.combo, this.sideIdx);

        this.idx++;
        this._showCurrentMarker();
    }

    tryClick(x, y) {
        if (this.input !== 'mouse') return;
        if (!this.running || this.served || this.idx >= this.N) return;
        if (this.mgr.hitTestRig(this.rig, x, y)) this._hitCurrent({ x, y });
    }
    tryKey(num) {
        if (this.input !== 'keys') return;
        if (!this.running || this.served || this.idx >= this.N) return;
        const d = this.dots[this.idx];
        if (num === d.key) this._hitCurrent();
        else {
            PC.audio.play('sfx_hit_wrong');
            PC.ui.wrongKeyFx(this.sideIdx);
        }
    }

    serve(forced = false) {
        if (!this.running || this.served) return;
        this.served = true;
        this.running = false;
        const C = PC.config;
        const doneness = PC.judgeDoneness(this.clock);
        const missing = this.N - this.idx;
        const raw = this.scoreDots + doneness.penalty;
        this.result = {
            serveSec: this.clock,
            scoreDots: this.scoreDots,
            grades: { ...this.grades },
            missing,
            doneness,
            penalty: doneness.penalty,
            maxCombo: this.maxCombo,
            baseTotal: this.baseTotal,
            N: this.N,
            forced,
            total: Math.max(0, Math.round(raw))
        };
        this.rig.endCook();
        PC.audio.play(doneness.key === 'burnt' ? 'sfx_burnt' : 'sfx_serve');
        if (this.onServed) this.onServed(this);
    }

    update(dt) {
        if (!this.running || this.served) return;
        this.clock += dt;
        const C = PC.config;

        // 進度環（節奏提示）：從該點出現起算，掃滿一圈＝時間窗、綠色扇區＝完美帶
        const d = this.dots[this.idx];
        if (d) this.rig.setMarkerProgress((this.clock - this.dotShownAt) / this.dotW);

        // 點點做完、進入完美熟度區的那一刻 → 提示音（HUD 起鍋鈕同步發光）
        if (this.idx >= this.N && !this._serveCued && this.clock >= C.PERFECT_ZONE[0]) {
            this._serveCued = true;
            PC.audio.play('sfx_countdown', { rate: 1.4 });
        }
        // 漸焦視覺
        if (this.clock > C.BURN_VISUAL_FROM) {
            const k = Math.min(1, (this.clock - C.BURN_VISUAL_FROM) / (C.FORCE_SERVE - C.BURN_VISUAL_FROM));
            this.rig.setBurn(k);
        }
        // 強制起鍋（燒焦）
        if (this.clock >= C.FORCE_SERVE) this.serve(true);
    }

    /** HUD 用快照 */
    snapshot() {
        const C = PC.config;
        const d = this.dots[this.idx];
        const [z0, z1] = C.PERFECT_ZONE;
        const serveNow = !this.served && !d && this.clock >= z0 && this.clock <= z1;
        let phase;
        if (this.served) phase = this.result.doneness.emoji + ' ' + this.result.doneness.label;
        else if (!d) {
            phase = this.clock < z0 ? '🍜 麵好了——等進綠色區起鍋！'
                : serveNow ? '✨ 完美熟度——就是現在，起鍋！'
                : '😱 要過熟了，快起鍋！';
        }
        else phase = `${d.segLabel} ${d.segI + 1}/${d.segN}`;
        return {
            score: this.scoreDots, combo: this.combo,
            idx: this.idx, N: this.N,
            clock: this.clock, served: this.served,
            phase, serveNow,
            keyNum: (!this.served && d && this.input === 'keys') ? d.key : null,
            doneDots: !d
        };
    }

    // ---- 測試掛鉤：以指定偏移（相對窗中點＝完美時刻）直接命中目前點 ----
    debugHitAt(offset = 0) {
        if (!this.dots[this.idx]) return;
        this.clock = this.dotShownAt + this.dotW / 2 + offset;
        this._hitCurrent();
    }
};
