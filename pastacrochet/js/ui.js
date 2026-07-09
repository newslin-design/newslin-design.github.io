/* ============================================================
   UI 模組：所有 DOM 畫面與 HUD
   選單 / 選店 / 選廚師 / 訂單（含難度） / 烹飪 HUD / 浮字回饋 /
   倒數 / 結算卡 / 計分板 / 最終結果
   ============================================================ */
window.PC = window.PC || {};

PC.ui = (function () {
    let flow = null;
    let ov, hudWrap, fxLayer, cdEl, titleInfo, recipeCard, recipeChips, recipeGuide, tally;
    const hudRefs = [];   // 每盤 HUD 元素快取
    // 游標起鍋鈕：滑鼠盤點點做完後貼著游標，就地起鍋
    let cursorServe = null, mouseServeSide = -1, csFrozen = false, csX = -100, csY = -100;

    const $ = (sel, root) => (root || document).querySelector(sel);
    const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
    // 本地圖示字體（Material Icons Round，ligature）
    const mi = (name) => `<span class="mi">${name}</span>`;
    // 遊戲風圖示：優先用 assets/ 圖片；圖片不存在時自動退回 emoji
    const gicon = (name, emoji, extra = '') =>
        `<img class="gi ${extra}" src="assets/${name}.png" alt="${emoji}" data-emoji="${emoji}" onerror="PC.ui._iconFail(this)">`;
    function _iconFail(img) {
        const s = document.createElement('span');
        s.className = 'giFallback ' + img.className.replace('gi', '').trim();
        s.textContent = img.dataset.emoji;
        img.replaceWith(s);
    }
    // 難度統一用火焰表示（一般不顯示火）
    const DIFF_LABEL = (cat, key) => {
        const d = PC.config.DIFF[cat][key];
        const fire = key === 'normal' ? '' : key === 'hard' ? '🔥 ' : '🔥🔥 ';
        return `${fire}${d.dots}點${d.bonus ? `+${d.bonus}分` : ''}`;
    };
    // 品項自帶難度 → 火焰徽章（一般不顯示、難 🔥、超難 🔥🔥）
    const tierTag = d => d === 'normal' ? ''
        : `<i class="fireTag">${d === 'hard' ? '🔥' : '🔥🔥'}</i>`;
    // 廚師頭像：有立繪用圖，否則退回 emoji
    const chefFaceHTML = (chef, cls) => {
        const c = chef || { emoji: '👨‍🍳' };
        return c.img ? `<img class="${cls} chefImg" src="${c.img}" alt="">`
                     : `<span class="${cls}">${c.emoji}</span>`;
    };
    // 熟度圖示（assets/done_*.png，燒焦無圖退回 emoji）＋文字，例：「(icon) 完美」
    const DONE_ICON = { raw: 'done_raw', almost: 'done_almost', perfect: 'done_perfect', over: 'done_over' };
    const donenessHTML = (d) => {
        const name = DONE_ICON[d.key];
        return `${name ? gicon(name, d.emoji, 'giDone') : d.emoji} ${d.label}`;
    };

    // 織圖織法卡（QRcode + 中文說明）：菜譜卡與得分卡共用
    const _qrCache = {};
    function qrSvg(url) {
        if (_qrCache[url] != null) return _qrCache[url];
        if (typeof qrcode === 'undefined') return _qrCache[url] = '';
        try {
            const qr = qrcode(0, 'M');
            qr.addData(url); qr.make();
            return _qrCache[url] = qr.createSvgTag({ cellSize: 2, margin: 0, scalable: true });
        } catch (e) { return _qrCache[url] = ''; }
    }
    // ---- 收藏卡：把「當前織圖 SVG + QRcode + 活動標題」合成一張可下載 PNG ----
    // 內嵌向量 SVG（無外部圖）→ canvas 不會被污染，toDataURL 可用。
    function svgToImage(svg, px) {
        return new Promise((resolve, reject) => {
            const clone = svg.cloneNode(true);
            clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            const vb = svg.viewBox && svg.viewBox.baseVal;
            const vw = (vb && vb.width) || svg.clientWidth || px;
            const vh = (vb && vb.height) || svg.clientHeight || px;
            const scale = px / Math.max(vw, vh);          // 拉到高解析度出圖，向量不失真
            clone.setAttribute('width', Math.round(vw * scale));
            clone.setAttribute('height', Math.round(vh * scale));
            const xml = new XMLSerializer().serializeToString(clone);
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
        });
    }
    function drawContain(ctx, img, x, y, w, h) {
        const r = Math.min(w / img.width, h / img.height);
        const dw = img.width * r, dh = img.height * r;
        ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    }
    // 用 qrcode-generator 直接畫方塊（銳利，不靠 SVG 光柵化）
    function drawQR(ctx, text, cx, top, size, dark) {
        if (typeof qrcode === 'undefined') return;
        let qr;
        try { qr = qrcode(0, 'M'); qr.addData(text); qr.make(); }
        catch (e) { return; }
        const n = qr.getModuleCount(), quiet = 4;         // 靜區 4 模組
        const cell = size / (n + quiet * 2);
        const x0 = cx - size / 2, y0 = top;
        ctx.fillStyle = '#ffffff';                        // QR 白底（含靜區）好掃
        ctx.fillRect(x0, y0, size, size);
        ctx.fillStyle = dark;
        for (let r = 0; r < n; r++)
            for (let c = 0; c < n; c++)
                if (qr.isDark(r, c))
                    ctx.fillRect(Math.round(x0 + (c + quiet) * cell), Math.round(y0 + (r + quiet) * cell),
                                 Math.ceil(cell), Math.ceil(cell));
    }
    async function downloadKeepsake() {
        const box = document.getElementById('chartBox');
        const svg = box && box.querySelector('svg');
        if (!svg) return;                                  // 沒有織圖（例如還在主選單）就跳過
        const K = PC.config.KEEPSAKE || {};
        const key = PC.charts.order && PC.charts.order.pattern;
        const guide = key && PC.config.GUIDES[key];
        const url = (guide && guide.url) || K.url || location.href;

        const S = 2, W = 720, H = 720;                     // 2x 超取樣、正方形版面
        const cv = document.createElement('canvas');
        cv.width = W * S; cv.height = H * S;
        const ctx = cv.getContext('2d');
        ctx.scale(S, S);
        ctx.fillStyle = K.bg || '#e7e1d5';
        ctx.fillRect(0, 0, W, H);

        // 織圖背景已透明（charts.js）→ 直接融入底色，無白方塊
        const chart = await svgToImage(svg, 1400);
        const cx = 60, cy = 56, cw = W - 120, ch = 470;    // 織圖區（上 2/3）
        drawContain(ctx, chart, cx, cy, cw, ch);

        const qrSize = K.qrSize || 104, qrTop = cy + ch + 30;
        drawQR(ctx, url, W / 2, qrTop, qrSize, K.qrDark || '#33291f');

        const a = document.createElement('a');
        a.href = cv.toDataURL('image/png');
        a.download = 'pastacrochet_chart.png';
        a.click();
    }
    // 下載美照：①3D 成品照 ②織圖＋QRcode 收藏卡（兩張）
    function saveShots() {
        flow.mgr.screenshot();
        setTimeout(downloadKeepsake, 300);                 // 隔一下再觸發第二次下載，避免被瀏覽器擋
    }

    function crochetGuideHTML(patternKey) {
        const g = PC.config.GUIDES && PC.config.GUIDES[patternKey];
        if (!g) return '';
        return `<div class="crochetGuide">
            <a class="cgQr" href="${g.url}" target="_blank" rel="noopener" title="掃碼或點擊看織圖">
                ${qrSvg(g.url)}<span class="cgScan">掃碼看織圖</span>
            </a>
            <div class="cgBody">
                <div class="cgMeta">🪡 ${g.needle}<br>🧵 ${g.yarn}<br>📐 ${g.size}</div>
                <ol class="cgSteps">${g.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            </div>
        </div>`;
    }

    function init(f) {
        flow = f;
        ov = $('#overlay'); hudWrap = $('#hudWrap'); fxLayer = $('#fxLayer');
        cdEl = $('#countdown'); titleInfo = $('#titleInfo');
        recipeCard = $('#recipeCard'); recipeChips = $('#recipeChips');
        recipeGuide = $('#recipeGuide');
        tally = $('#tally');

        $('#peekRestore').onclick = () => document.body.classList.remove('peek');

        $('#spinBtn').onclick = e => {
            flow.mgr.spinning = !flow.mgr.spinning;
            e.currentTarget.classList.toggle('on', flow.mgr.spinning);
        };
        $('#shotBtn').onclick = () => saveShots();
        $('#muteBtn').onclick = e => {
            const m = PC.audio.toggleMute();
            e.currentTarget.innerHTML = mi(m ? 'volume_off' : 'volume_up');
        };
        $('#homeBtn').onclick = () => { if (confirm('回到主選單？本局進度會消失。')) location.reload(); };

        // 游標起鍋鈕：建一次，之後靠 show/hide 控制
        cursorServe = el(`<button id="cursorServe" class="hide" title="起鍋！">${gicon('serve', '🍽️', 'giCursor')}</button>`);
        document.body.appendChild(cursorServe);
        // 滑到鈕上時凍結位置，否則游標一靠近鈕就被推走 → 永遠點不到
        cursorServe.addEventListener('pointerenter', () => csFrozen = true);
        cursorServe.addEventListener('pointerleave', () => csFrozen = false);
        cursorServe.onclick = () => {
            if (mouseServeSide < 0) return;
            clickSfx();
            hideCursorServe();
            flow.serveFromButton(mouseServeSide);
        };
        // 隱藏時仍記錄游標位置，讓下次現身直接出現在游標旁（不閃 0,0）
        addEventListener('pointermove', e => {
            csX = e.clientX; csY = e.clientY;
            if (csFrozen || cursorServe.classList.contains('hide')) return;
            cursorServe.style.left = csX + 'px';
            cursorServe.style.top = csY + 'px';
            aimCursorArrow();
        });
    }

    function showCursorServe(ready) {
        if (!cursorServe) return;
        cursorServe.style.left = csX + 'px';
        cursorServe.style.top = csY + 'px';
        cursorServe.classList.remove('hide');
        cursorServe.classList.toggle('ready', !!ready);
        aimCursorArrow();
    }
    // 讓箭頭指向該盤底部的 HUD 起鍋鈕（游標在畫面任何位置都指得準）
    function aimCursorArrow() {
        if (!cursorServe || mouseServeSide < 0) return;
        const r = hudRefs[mouseServeSide]; if (!r || !r.serve) return;
        const t = r.serve.getBoundingClientRect();
        const cx = csX + 37, cy = csY + 35;   // 鈕心＝游標＋margin(14,12)＋半徑23
        const ang = Math.atan2((t.top + t.height / 2) - cy, (t.left + t.width / 2) - cx) * 180 / Math.PI;
        cursorServe.style.setProperty('--arrowAngle', ang.toFixed(1) + 'deg');
    }
    function hideCursorServe() {
        if (cursorServe) { cursorServe.classList.add('hide'); csFrozen = false; }
    }

    function setTitleInfo(t) { titleInfo.textContent = t; }
    // 織圖預覽（#chartBox）會被搬進點菜單；覆蓋層換內容前先搬回菜譜卡，避免被 innerHTML 清掉
    function restoreChart() {
        const cb = document.getElementById('chartBox');
        if (cb && cb.parentElement !== recipeCard) {
            recipeCard.insertBefore(cb, recipeChips);
            recipeCard.classList.remove('hide');
        }
    }
    function showOverlay(html) {
        restoreChart();
        hudWrap.classList.add('hide');
        ov.classList.remove('hide', 'verdictLayer');
        document.body.classList.remove('peek', 'setup');
        ov.innerHTML = html;
    }
    function hideOverlays() {
        restoreChart();
        ov.classList.add('hide'); ov.classList.remove('verdictLayer'); ov.innerHTML = '';
        document.body.classList.remove('peek', 'setup');
    }
    function clickSfx() { PC.audio.play('sfx_ui_click'); }

    // ---------- 選單 ----------
    function showMenu() {
        recipeCard.classList.add('hide');
        tally.classList.add('hide');
        setTitleInfo(`遊戲本體 ${PC.config.VERSION} — 節奏編織料理`);
        showOverlay(`
        <div class="modalCard menuCard menuHome">
            <div class="menuSign">
                <img src="assets/logo.png" alt="毛線麵餐廳">
            </div>
            <p class="lead">照織圖節奏下針、上醬、擺料——在完美熟度起鍋！</p>
            <button class="choice practiceChoice" data-m="practice"><b>🧶 練習模式</b><span>直接選料開做，做完看結果——隨時上手、想做幾盤都行</span></button>
            <div class="bigChoices">
                <button class="choice" data-m="single"><b>🏪 單店營業</b><span>一間店做 3 場菜，挑戰高分</span></button>
                <button class="choice" data-m="versus"><b>${gicon('versus', '⚔️', 'giInline')} 雙店競賽</b><span>兩間店比總分，高分者勝<br>單廚同時對決、雙廚協力賽</span></button>
            </div>
            <p class="tinyNote">${mi('mouse')} 拖曳可旋轉視角</p>
        </div>`);
        ov.querySelectorAll('.choice').forEach(b =>
            b.onclick = () => {
                clickSfx();
                if (b.dataset.m === 'practice') flow.startPractice();
                else flow.selectStoreMode(b.dataset.m);
            });
        document.body.classList.add('setup');
    }

    function showChefMode() {
        const vs = flow.storeMode === 'versus';
        showOverlay(`
        <div class="modalCard menuCard">
            <h2>每隊幾人掌廚？</h2>
            <p class="lead">${vs
                ? '單廚＝兩店同時對決；雙廚＝每隊 2 人協力（一滑鼠一鍵盤，分數相加）。'
                : '雙廚一次做兩盤（分數相加），一位滑鼠一位鍵盤，考驗默契！'}</p>
            <div class="bigChoices">
                <button class="choice" data-m="solo"><b>👨‍🍳 單廚${vs ? '對決' : ''}</b><span>${vs
                    ? '每隊 1 人，兩店<b>同時開做</b>直接對決<br>左盤滑鼠、右盤鍵盤 1·2·3·4'
                    : '每隊 1 人，滑鼠點針目'}</span></button>
                <button class="choice" data-m="duo"><b>👩‍🍳👨‍🍳 雙廚</b><span>每隊 2 人！左盤滑鼠、右盤鍵盤 1·2·3·4<br>（雙人協力${vs ? '，兩隊輪流' : ''}）</span></button>
            </div>
        </div>`);
        ov.querySelectorAll('.choice').forEach(b =>
            b.onclick = () => { clickSfx(); flow.selectChefMode(b.dataset.m); });
        document.body.classList.add('setup');
    }

    // 選場數：要比幾場（1~4）。點數字即開賽。
    function showRoundCount(current) {
        const C = PC.config, def = current || C.ROUND_DEFAULT;
        const btns = [];
        for (let n = C.ROUND_MIN; n <= C.ROUND_MAX; n++)
            btns.push(`<button class="choice countChoice${n === def ? ' on' : ''}" data-n="${n}"><b>${n}</b><span>場</span></button>`);
        showOverlay(`
        <div class="modalCard menuCard">
            <h2>要比幾場？</h2>
            <p class="lead">每場都是一道菜——自己配料，或讓當場客人隨機點。想比幾場自己決定！</p>
            <div class="countChoices">${btns.join('')}</div>
        </div>`);
        ov.querySelectorAll('.countChoice').forEach(b =>
            b.onclick = () => { clickSfx(); flow.selectRoundCount(+b.dataset.n); });
        document.body.classList.add('setup');
    }

    // 兩隊固定・出場提醒（不用真的選，隊友現場自己喬）
    function showTeamIntro(stores, chefMode, onDone) {
        const duo = chefMode === 'duo';
        const vs = stores.length > 1;
        const duel = vs && !duo;   // 雙店＋單廚＝對戰
        const roleHint = duo
            ? `每隊 <b>2 人</b>：一位掌 ${mi('mouse')} 滑鼠盤、一位掌 ${mi('keyboard')} 鍵盤盤（1·2·3·4、Enter 起鍋）`
            : duel
                ? `兩隊<b>同時對決</b>：${stores[0].name} 掌 ${mi('mouse')} 滑鼠盤、${stores[1].name} 掌 ${mi('keyboard')} 鍵盤盤（1·2·3·4、Enter 起鍋）`
                : '每隊 <b>1 人</b> 掌廚：滑鼠點針目';
        const teamCard = (st, i) => `
            <div class="teamCard">
                ${st.chef.img ? `<img class="teamArt" src="${st.chef.img}" alt="">`
                              : `<span class="teamArtEmoji">${st.chef.emoji}</span>`}
                <b class="teamName">${st.name}</b>
                <span class="teamTag">${vs ? (i === 0 ? '第一隊' : '第二隊') : '你們這隊'}</span>
            </div>`;
        showOverlay(`
        <div class="modalCard menuCard">
            <h2>${vs ? '兩隊對決！' : '你們的隊伍'}</h2>
            <p class="lead">隊伍固定，<b>隊友現場自己喬</b>就好 😉<br>${roleHint}</p>
            <div class="teamGrid${vs ? ' vs' : ''}">
                ${stores.map(teamCard).join(vs ? '<span class="vsBadge">VS</span>' : '')}
            </div>
            <button class="bigBtn" id="teamOk">準備好了 ${mi('play_arrow')}</button>
        </div>`);
        $('#teamOk').onclick = () => { clickSfx(); onDone(); };
        document.body.classList.add('setup');
    }

    // ---------- 通用卡片 ----------
    function showCard({ icon, title, sub, body, btn, onBtn }) {
        PC.audio.play('sfx_order_open');
        showOverlay(`
        <div class="modalCard">
            <div class="cardIcon">${icon || '🧶'}</div>
            <h2>${title}</h2>
            ${sub ? `<p class="lead">${sub}</p>` : ''}
            ${body ? `<div class="cardBody">${body}</div>` : ''}
            <button class="bigBtn" id="cardBtn">${btn}</button>
        </div>`);
        $('#cardBtn').onclick = () => { clickSfx(); onBtn(); };
    }

    // ---------- 訂單摘要 ----------
    function orderSummaryHTML(order) {
        const C = PC.config;
        const st = PC.orderStats(order);
        const li = (label, cat, diff) =>
            `<div class="sumLine"><span>${label}</span><em>${DIFF_LABEL(cat, diff)}</em></div>`;
        return `
        ${li(C.PATTERNS[order.pattern].label, 'pattern', C.PATTERNS[order.pattern].diff)}
        ${li(`<span class="sw" style="background:${C.SAUCES[order.sauce].color}"></span>${order.sauce}`, 'sauce', C.SAUCES[order.sauce].diff)}
        ${order.tops.map(k => li(`<span class="sw" style="background:${C.TOPPINGS[k].color}"></span>${C.TOPPINGS[k].label}`, 'topping', C.TOPPINGS[k].diff)).join('')}
        <div class="sumStats">${mi('adjust')} 點點 <b>${st.dots}</b> 顆（每點 ${st.dotSec.toFixed(1)}s）<br>${mi('paid')} 基礎總分 <b>${st.base}</b>（100＋難度 ${st.bonus}）<br>每點 ${st.perDot.toFixed(1)} 分</div>`;
    }

    // ---------- 點菜單（圖片卡＋配料一/二＋織圖即時上色預覽＋可選 🎲 隨機）----------
    function openOrderModal({ title, sub, mascot, order, confirmText, dice, onChange, onConfirm }) {
        PC.audio.play('sfx_order_open');
        const C = PC.config;
        showOverlay(`
        <div class="modalCard orderModal">
            <div class="orderHead">
                ${mascot ? `<img class="orderMascot" src="${mascot}" alt="">` : ''}
                <div class="orderTitleSign">
                    <img src="assets/logo_signboard.png" alt="">
                    <span class="orderTitleText">${title}</span>
                </div>
            </div>
            <p class="lead">${sub}</p>
            <div class="orderCols">
                <div class="orderMain">
                    <div class="itemGrid pat" id="mPat"></div>
                    <div class="secTitle">醬料</div>
                    <div class="itemGrid" id="mSauce"></div>
                    <div class="secTitle">配料一</div>
                    <div class="itemGrid" id="mTop0"></div>
                    <div class="secTitle">配料二</div>
                    <div class="itemGrid" id="mTop1"></div>
                </div>
                <div class="orderSide">
                    <div id="mChartSlot"></div>
                    <div class="orderSummary" id="mSum"></div>
                    ${dice ? `<button class="diceBtn" id="mDice">${dice.label || '🎲 隨機點餐'}</button>` : ''}
                    <button class="bigBtn" id="mOk">${confirmText || '🧶 開始編織'}</button>
                </div>
            </div>
        </div>`);
        // 可即時上色的織圖預覽搬進點菜單（關閉／換畫面時 restoreChart 會搬回菜譜卡）
        $('#mChartSlot').appendChild(document.getElementById('chartBox'));
        recipeCard.classList.add('hide');

        const itemCard = ({ img, swatch, emoji, name, tier, on, fn }) => {
            const thumb = img ? `<img src="${img}" alt="" loading="lazy">`
                : swatch ? `<i class="bigSwatch" style="background:${swatch}"></i>`
                : `<span class="bigEmoji">${emoji || '🧶'}</span>`;
            const b = el(`<button class="itemCard${on ? ' on' : ''}">
                ${tierTag(tier)}
                <span class="itemThumb">${thumb}</span>
                ${name ? `<span class="itemName">${name}</span>` : ''}</button>`);
            b.onclick = fn;
            return b;
        };
        // 織圖依難度排序（一般→難→超難），縮圖用同檔名成品 PNG
        const diffRank = { normal: 0, hard: 1, expert: 2 };
        const render = () => {
            const pat = $('#mPat'); pat.innerHTML = '';
            Object.entries(C.PATTERNS)
                .sort(([, a], [, b]) => (diffRank[a.diff] ?? 9) - (diffRank[b.diff] ?? 9))
                .forEach(([k, p]) =>
                pat.appendChild(itemCard({
                    img: (p.img || '').replace(/\.svg$/i, '.png'), tier: p.diff,
                    on: order.pattern === k,
                    fn: () => { clickSfx(); order.pattern = k; render(); }
                })));
            const sau = $('#mSauce'); sau.innerHTML = '';
            Object.entries(C.SAUCES).forEach(([name, s]) =>
                sau.appendChild(itemCard({
                    img: s.img, swatch: s.color, name, tier: s.diff,
                    on: order.sauce === name,
                    fn: () => { clickSfx(); order.sauce = name; render(); }
                })));
            [0, 1].forEach(slot => {
                const box = $('#mTop' + slot); box.innerHTML = '';
                // 配料卡只放圖不放名稱；兩格可以選同一種料
                Object.entries(C.TOPPINGS).forEach(([k, d]) =>
                    box.appendChild(itemCard({
                        img: d.img, emoji: d.label.split(' ')[0], tier: d.diff,
                        on: order.tops[slot] === k,
                        fn: () => { clickSfx(); order.tops[slot] = k; render(); }
                    })));
            });
            $('#mSum').innerHTML = orderSummaryHTML(order);
            if (onChange) onChange(order);
        };
        render();
        if (dice) $('#mDice').onclick = () => {
            clickSfx();
            Object.assign(order, dice.gen());
            render();
        };
        $('#mOk').onclick = () => { clickSfx(); onConfirm(order); };
    }

    // ---------- 顧客／對手出題卡 ----------
    function showOrderCard({ who, order, note, onConfirm }) {
        PC.audio.play('sfx_order_open');
        recipeCard.classList.remove('hide');
        showOverlay(`
        <div class="modalCard">
            <div class="custHead">
                <span class="custFace">${who.emoji}</span>
                <div><b>${who.name}</b><p class="custLine">「${who.line}」</p></div>
            </div>
            ${note ? `<p class="lead">${note}</p>` : ''}
            <div class="cardBody">${orderSummaryHTML(order)}</div>
            <button class="bigBtn" id="takeOrder">🔥 接單開做！</button>
        </div>`);
        $('#takeOrder').onclick = () => { clickSfx(); onConfirm(); };
    }

    // 菜譜色票（醬料 + 各派料名稱）：菜譜卡與結算卡共用，確保結果卡也看得到派料名稱
    function recipeChipsHTML(order) {
        const C = PC.config;
        return `<span class="chip mini on" style="border-color:${C.SAUCES[order.sauce].color}">
                <span class="sw" style="background:${C.SAUCES[order.sauce].color}"></span>${order.sauce}</span>
            ${order.tops.map(k => `<span class="chip mini on">
                <span class="sw" style="background:${C.TOPPINGS[k].color}"></span>${C.TOPPINGS[k].label}</span>`).join('')}`;
    }

    // ---------- 菜譜卡（右上，烹飪中唯讀）----------
    function setRecipe(order) {
        recipeCard.classList.remove('hide');
        recipeChips.innerHTML = `<div class="dishName">${PC.dishName(order)}</div>` + recipeChipsHTML(order);
        recipeGuide.innerHTML = crochetGuideHTML(order.pattern);
    }

    // ---------- 烹飪 HUD ----------
    function timeBarGradient() {
        const C = PC.config;
        const stops = []; let prev = 0;
        C.DONENESS.forEach(d => {
            const end = Math.min(d.max, C.FORCE_SERVE) / C.FORCE_SERVE * 100;
            stops.push(`${C.DONENESS_COLORS[d.key]} ${prev}% ${end}%`);
            prev = end;
        });
        return `linear-gradient(90deg, ${stops.join(', ')})`;
    }

    function showHud(store, sessions, order) {
        hudRefs.length = 0;
        mouseServeSide = sessions.findIndex(s => s.input === 'mouse');
        hideCursorServe();
        hudWrap.classList.remove('hide');
        hudWrap.innerHTML = '';
        hudWrap.classList.toggle('duo', sessions.length > 1);
        // 底下起鍋卡左右反轉，讓卡片與上方兩盤對齊（使用者回饋：原本鍵盤/滑鼠與起鍋鈕左右相反）
        const domOrder = sessions.map((_, i) => i);
        if (sessions.length > 1) domOrder.reverse();
        domOrder.forEach(i => {
            const s = sessions[i];
            const chef = s.chef || { emoji: '👨‍🍳', name: '主廚' };
            const card = el(`
            <div class="card cookCard">
                <div class="chefLine">${chefFaceHTML(chef, 'chefFace')}<b>${chef.name}</b>
                    <span class="inputTag">${s.input === 'keys' ? mi('keyboard') + ' 鍵盤 1·2·3·4' : mi('mouse') + ' 滑鼠'}</span></div>
                <div class="phaseLine" data-f="phase">準備中…</div>
                <div class="keyHint hide" data-f="keyhint">按 <b data-f="keynum">1</b></div>
                <div class="scoreLine">分數 <b data-f="score">0</b><span class="comboTag" data-f="combo"></span></div>
                <div class="timeBar" style="background:${timeBarGradient()}"><div class="needle" data-f="needle"></div></div>
                <div class="zoneLabel">沒熟 ─ 差點熟 ─ <b>完美 16~23s</b> ─ 過熟 ─ 燒焦</div>
                <button class="serveBtn" data-f="serve">${gicon('serve', '🍽️', 'giBtn')} 起鍋！${s.input === 'keys' ? '（Enter）' : ''}</button>
                <div class="plateVerdict hide" data-f="verdict"></div>
            </div>`);
            $('[data-f=serve]', card).onclick = e => { e.currentTarget.blur(); flow.serveFromButton(i); };
            hudWrap.appendChild(card);
            hudRefs[i] = {
                card,
                phase: $('[data-f=phase]', card),
                keyhint: $('[data-f=keyhint]', card),
                keynum: $('[data-f=keynum]', card),
                score: $('[data-f=score]', card),
                combo: $('[data-f=combo]', card),
                needle: $('[data-f=needle]', card),
                serve: $('[data-f=serve]', card),
                verdict: $('[data-f=verdict]', card)
            };
        });
        updateTally();
    }

    function updateHud(sessions) {
        sessions.forEach((s, i) => {
            const r = hudRefs[i]; if (!r) return;
            const snap = s.snapshot();
            // 滑鼠盤點點做完、還沒起鍋 → 游標旁冒出起鍋 icon（完美熟度區時轉綠脈動）
            if (i === mouseServeSide) {
                if (snap.doneDots && !snap.served) showCursorServe(snap.serveNow);
                else hideCursorServe();
            }
            r.phase.textContent = snap.phase;
            r.score.textContent = Math.round(snap.score);
            r.combo.textContent = snap.combo >= 2 ? `🔥x${snap.combo}` : '';
            r.needle.style.left = `calc(${Math.min(100, snap.clock / PC.config.FORCE_SERVE * 100)}% - 2px)`;
            r.serve.classList.toggle('glow', !!snap.serveNow);
            if (snap.keyNum) {
                r.keyhint.classList.remove('hide');
                r.keynum.textContent = snap.keyNum;
            } else r.keyhint.classList.add('hide');
            if (snap.served && !r.serve.disabled) {
                r.serve.disabled = true;
                const res = s.result;
                r.verdict.classList.remove('hide');
                r.verdict.innerHTML = `${res.doneness.emoji} ${res.doneness.label}（${res.serveSec.toFixed(1)}s）
                    ＋${Math.round(res.scoreDots)} 針目分${res.penalty ? `、熟度 ${res.penalty}` : ''}
                    → <b>${res.total} 分</b>`;
            }
        });
    }

    // ---------- 回饋 FX ----------
    const GRADE_FX = {
        perfect: { cls: 'fxPerfect', text: g => `✨完美 +${g.toFixed(1)}` },
        ok:      { cls: 'fxOk',      text: g => `👌不錯 +${g.toFixed(1)}` },
        bad:     { cls: 'fxBad',     text: g => `+${g.toFixed(1)}` }
    };
    function hitFx(pos, grade, gain, combo, lateText) {
        const f = GRADE_FX[grade];
        const d = el(`<div class="fx ${f.cls}">${lateText || ''}${f.text(gain)}${combo >= 2 && grade === 'perfect' ? `<small> x${combo}</small>` : ''}</div>`);
        d.style.left = pos.x + 'px'; d.style.top = pos.y + 'px';
        fxLayer.appendChild(d);
        setTimeout(() => d.remove(), 800);
    }
    function comboSplash(n) {
        const d = el(`<div class="comboSplash">${gicon('combo', '🎉', 'giCombo')} ${n} COMBO!</div>`);
        fxLayer.appendChild(d);
        setTimeout(() => d.remove(), 1200);
    }
    function wrongKeyFx(sideIdx) {
        const r = hudRefs[sideIdx]; if (!r) return;
        r.card.classList.remove('shake');
        void r.card.offsetWidth;   // 重觸發動畫
        r.card.classList.add('shake');
    }

    // ---------- 倒數 ----------
    function countdown(onGo) {
        hideOverlays();
        hudWrap.classList.remove('hide');
        const seq = ['3', '2', '1', '開始🍳'];
        cdEl.classList.remove('hide');
        let i = 0;
        const step = () => {
            if (i >= seq.length) { cdEl.classList.add('hide'); onGo(); return; }
            cdEl.textContent = seq[i];
            cdEl.classList.remove('pop'); void cdEl.offsetWidth; cdEl.classList.add('pop');
            PC.audio.play(i === seq.length - 1 ? 'sfx_go' : 'sfx_countdown');
            i++;
            setTimeout(step, i === seq.length ? 650 : 800);
        };
        step();
    }

    // ---------- 結算 ----------
    // 單盤得分明細（showVerdict／showDuelVerdict 共用）
    function plateStatsHTML(r, showTotal) {
        return `<div class="plateStats">
            <div class="stat"><span>針目得分（滿分 ${r.baseTotal}）</span><b>+${Math.round(r.scoreDots)}</b></div>
            <div class="stat sub"><span>${gicon('grade_perfect', '✨', 'giInline')} 完美</span><b>${r.grades.perfect}</b></div>
            <div class="stat sub"><span>${gicon('grade_ok', '👌', 'giInline')} 不錯</span><b>${r.grades.ok}</b></div>
            <div class="stat sub"><span>${gicon('grade_bad', '💦', 'giInline')} 超糟</span><b>${r.grades.bad}</b></div>
            ${r.missing ? `<div class="stat sub"><span>${gicon('grade_miss', '❌', 'giInline')} 漏針</span><b>${r.missing}</b></div>` : ''}
            <div class="stat sub"><span>🔥 最高連擊</span><b>${r.maxCombo}</b></div>
            <div class="stat"><span>熟度 ${donenessHTML(r.doneness)}（${r.serveSec.toFixed(1)}s 起鍋${r.forced ? '・強制' : ''}）</span><b>${r.penalty || '±0'}</b></div>
            ${showTotal ? `<div class="stat totalRow"><span>本盤得分</span><b>${r.total}</b></div>` : ''}
        </div>`;
    }

    function showVerdict({ store, roundLabel, plates, chefs, score, onNext, eyebrow, nextLabel, onHome, pattern, order }) {
        const plateHTML = plates.map((r, i) => {
            const chef = chefs[i] || { emoji: '👨‍🍳', name: '主廚' };
            const tag = plates.length > 1 ? `<span class="plateTag">${i === 0 ? mi('mouse') + ' 滑鼠盤' : mi('keyboard') + ' 鍵盤盤'}</span>` : '';
            return `
            <div class="plateResult">
                <div class="plateHead">${chefFaceHTML(chef, 'plateChefFace')}${chef.name}${tag}</div>
                ${plateStatsHTML(r, plates.length > 1)}
            </div>`;
        }).join('');
        // 非阻擋式結算：不蓋住 3D 成品。分數置中上方、細節靠右、下一步置中下方
        restoreChart();
        hideCursorServe();
        recipeCard.classList.add('hide');
        hudWrap.classList.add('hide');
        document.body.classList.remove('peek', 'setup');
        ov.classList.remove('hide');
        ov.classList.add('verdictLayer');
        ov.innerHTML = `
            <div class="vScoreTop">
                <div class="verdictEyebrow">${eyebrow || `${store.emoji} ${store.name}｜${roundLabel}`}</div>
                <div class="turnScore">0<small>分</small></div>
            </div>
            <div class="card vDetail"><div id="vChartSlot"></div>${order ? `<div class="dishName vDishName">${PC.dishName(order)}</div><div class="vRecipeChips">${recipeChipsHTML(order)}</div>` : ''}${plateHTML}${crochetGuideHTML(pattern)}</div>
            <div class="vFoot">
                <button class="ghostBtn" id="vPeek">${mi('visibility')} 只看成品</button>
                ${onHome ? `<button class="ghostBtn" id="vHome">${mi('home')} 回首頁</button>` : ''}
                <button class="bigBtn" id="vNext">${nextLabel || `繼續 ${mi('play_arrow')}`}</button>
            </div>`;
        // 織圖搬進得分卡（單例，restoreChart 之後會搬回菜譜卡）
        const cb = document.getElementById('chartBox');
        if (cb) document.getElementById('vChartSlot').appendChild(cb);
        updateTally();
        // 總分從 0 滾動跳分到實際分數；畫面被換掉（元素移出 DOM）就停
        const big = $('.turnScore', ov);
        const t0 = performance.now(), dur = 900;
        (function tick() {
            if (!big.isConnected) return;
            const p = Math.min(1, (performance.now() - t0) / dur);
            big.firstChild.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
        })();
        $('#vPeek').onclick = () => document.body.classList.add('peek');
        if (onHome) $('#vHome').onclick = () => { clickSfx(); document.body.classList.remove('peek'); onHome(); };
        $('#vNext').onclick = () => { clickSfx(); document.body.classList.remove('peek'); onNext(); };
    }

    // ---------- 對戰結算（雙店＋單廚）----------
    // 兩隊同題＝同一張比較表（列＝項目、欄＝隊伍；重複標籤只出現一次），標出本場勝方
    function showDuelVerdict({ roundLabel, stores, chefs, plates, order, pattern, nextLabel, onNext }) {
        restoreChart();
        hideCursorServe();
        recipeCard.classList.add('hide');
        hudWrap.classList.add('hide');
        document.body.classList.remove('peek', 'setup');
        ov.classList.remove('hide');
        ov.classList.add('verdictLayer');

        const [pa, pb] = plates;
        const winIdx = pa.total === pb.total ? -1 : (pa.total > pb.total ? 0 : 1);
        const resultLine = winIdx < 0
            ? `${gicon('result_tie', '🤝', 'giInline')} 這場平手！`
            : `${stores[winIdx].emoji} ${stores[winIdx].name} 這場勝出！`;

        const winCls = i => winIdx === i ? ' win' : '';
        // 表頭：隊伍（立繪＋操作方式＋勝方皇冠）
        const headCell = i => {
            const st = stores[i], chef = chefs[i] || st.chef;
            return `<th class="dtTeam${winCls(i)}">
                <span class="dtTeamName">${chefFaceHTML(chef, 'dtFace')}${st.name}${winIdx === i ? ' ' + gicon('lead_crown', '👑', 'giCrown') : ''}</span>
                <span class="dtTag">${i === 0 ? mi('mouse') + ' 滑鼠' : mi('keyboard') + ' 鍵盤'}</span></th>`;
        };
        // 一列＝一個項目，標籤只出現一次（左欄）
        const row = (label, fn, cls = '') =>
            `<tr class="${cls}"><th class="dtLabel">${label}</th>${plates.map((p, i) => `<td class="${winCls(i).trim()}">${fn(p, i)}</td>`).join('')}</tr>`;

        const anyMissing = plates.some(p => p.missing);
        const anyPenalty = plates.some(p => p.penalty);
        const rows = [
            row('針目得分', p => `+${Math.round(p.scoreDots)}`),
            row(`${gicon('grade_perfect', '✨', 'giInline')} 完美`, p => p.grades.perfect, 'sub'),
            row(`${gicon('grade_ok', '👌', 'giInline')} 不錯`, p => p.grades.ok, 'sub'),
            row(`${gicon('grade_bad', '💦', 'giInline')} 超糟`, p => p.grades.bad, 'sub'),
            anyMissing ? row(`${gicon('grade_miss', '❌', 'giInline')} 漏針`, p => p.missing || 0, 'sub') : '',
            row('🔥 最高連擊', p => p.maxCombo, 'sub'),
            row('熟度', p => `${donenessHTML(p.doneness)}<small class="dtSub">${p.serveSec.toFixed(1)}s${p.forced ? '・強制' : ''}</small>`),
            anyPenalty ? row('熟度扣分', p => p.penalty || '±0', 'sub') : '',
            row('本盤得分', p => p.total, 'dtTotal')
        ].join('');

        ov.innerHTML = `
            <div class="vScoreTop">
                <div class="verdictEyebrow">⚔️ ${roundLabel}</div>
                <div class="duelResultLine">${resultLine}</div>
            </div>
            <div class="card vDetail duelDetail">
                ${order ? `<div class="ddDishBar">
                    <div class="dishName vDishName">${PC.dishName(order)}</div>
                    <div class="vFullMark">滿分 ${plates[0].baseTotal}</div>
                    <div class="vRecipeChips">${recipeChipsHTML(order)}</div>
                </div>` : ''}
                <div class="ddTop">
                    <div class="ddChart"><div id="vChartSlot"></div></div>
                    <div class="ddInfo">${crochetGuideHTML(pattern)}</div>
                </div>
                <table class="duelTable">
                    <tr><th class="dtLabel"></th>${headCell(0)}${headCell(1)}</tr>
                    ${rows}
                </table>
            </div>
            <div class="vFoot">
                <button class="ghostBtn" id="vPeek">${mi('visibility')} 只看成品</button>
                <button class="bigBtn" id="vNext">${nextLabel || `繼續 ${mi('play_arrow')}`}</button>
            </div>`;
        const cb = document.getElementById('chartBox');
        if (cb) document.getElementById('vChartSlot').appendChild(cb);
        updateTally();
        $('#vPeek').onclick = () => document.body.classList.add('peek');
        $('#vNext').onclick = () => { clickSfx(); document.body.classList.remove('peek'); onNext(); };
    }

    // 左側累積比分：場次由上而下、隊伍分左右欄；底部合計，領先隊標皇冠
    function updateTally() {
        const stores = flow.stores;
        if (flow.practice || !stores || !stores.length) { tally.classList.add('hide'); return; }
        const n = flow.roundCount || PC.config.ROUND_DEFAULT;
        const lead = stores.length > 1 ? Math.max(...stores.map(s => s.total)) : -1;
        const header = `<tr><th class="tCorner">場次</th>${stores.map(s =>
            `<th class="tTeam">${s.emoji}<span>${s.name.replace('隊', '')}</span></th>`).join('')}</tr>`;
        let body = '';
        for (let i = 0; i < n; i++) {
            const cur = i === flow.roundIdx && flow.phase !== 'final';
            body += `<tr class="${cur ? 'curRow' : ''}"><td class="tRound">第 ${i + 1} 場</td>${stores.map(s => {
                const r = s.results[i];
                return `<td>${r ? r.score : '·'}</td>`;
            }).join('')}</tr>`;
        }
        const foot = `<tr class="tFoot"><td class="tRound">總分</td>${stores.map(s => {
            const isLead = stores.length > 1 && lead > 0 && s.total === lead;
            return `<td class="tTot">${s.total}${isLead ? '<br>' + gicon('lead_crown', '👑', 'giCrown') : ''}</td>`;
        }).join('')}</tr>`;
        tally.innerHTML = `
            <div class="tallyHead">${mi('leaderboard')} 累積比分</div>
            <table class="tallyTable">${header}${body}${foot}</table>`;
        tally.classList.remove('hide');
    }

    function showScoreboard(stores, roundIdx, onNext) {
        const n = flow.roundCount || PC.config.ROUND_DEFAULT;
        const cols = Array.from({ length: n }, (_, i) => i);
        const head = cols.map(i => `<th>${i + 1}</th>`).join('');
        const rows = stores.map(s => `
            <tr><td>${s.emoji} ${s.name}</td>
            ${cols.map(i => `<td>${s.results[i] ? s.results[i].score : '—'}</td>`).join('')}
            <td class="totCell">${s.total}</td></tr>`).join('');
        const lead = stores[0].total === stores[1].total ? '平手！'
            : `${(stores[0].total > stores[1].total ? stores[0] : stores[1]).name} 領先！`;
        showOverlay(`
        <div class="modalCard">
            <h2>${mi('leaderboard')} 第 ${roundIdx + 1} 場結束</h2>
            <p class="lead">${lead}</p>
            <table class="scoreTable">
                <tr><th></th>${head}<th>合計</th></tr>${rows}
            </table>
            <button class="bigBtn" id="bNext">${roundIdx + 1 < n ? '下一場 ' + mi('play_arrow') : '看最終結果 ' + mi('sports_score')}</button>
        </div>`);
        $('#bNext').onclick = () => { clickSfx(); onNext(); };
    }

    function showFinal(stores, mode) {
        recipeCard.classList.add('hide');
        tally.classList.add('hide');
        let headHTML;
        if (mode === 'versus') {
            const [a, b] = stores;
            headHTML = a.total === b.total
                ? `<div class="cardIcon">${gicon('result_tie', '🤝', 'giHero')}</div><h1>平手！</h1>`
                : `<div class="cardIcon">${gicon('rank_champion', '🏆', 'giHero')}</div><h1>${(a.total > b.total ? a : b).emoji} ${(a.total > b.total ? a : b).name} 獲勝！</h1>`;
        } else {
            const s = stores[0];
            const possible = s.results.reduce((sum, r) => sum + r.plates.reduce((x, p) => x + p.baseTotal, 0), 0);
            const ratio = possible ? s.total / possible : 0;
            const tier = ratio >= .92 ? { img: 'rank_legend', emoji: '🌟', label: '傳說主廚' }
                : ratio >= .8 ? { img: 'rank_gold', emoji: '🥇', label: '金牌主廚' }
                : ratio >= .65 ? { img: 'rank_silver', emoji: '🥈', label: '銀牌主廚' }
                : ratio >= .45 ? { img: 'rank_bronze', emoji: '🥉', label: '銅牌主廚' }
                : { img: 'rank_rookie', emoji: '🍳', label: '見習廚師' };
            headHTML = `<div class="cardIcon">${gicon(tier.img, tier.emoji, 'giHero')}</div><h1>${tier.label}</h1>
                <p class="lead">達成率 ${Math.floor(ratio * 100)}%</p>`;
        }
        const n = flow.roundCount || PC.config.ROUND_DEFAULT;
        const cols = Array.from({ length: n }, (_, i) => i);
        const rows = stores.map(s => `
            <tr><td>${s.emoji} ${s.name}</td>
            ${cols.map(i => `<td>${s.results[i] ? s.results[i].score : '—'}</td>`).join('')}
            <td class="totCell">${s.total}</td></tr>`).join('');
        showOverlay(`
        <div class="modalCard menuCard">
            ${headHTML}
            <table class="scoreTable">
                <tr><th></th>${cols.map(i => `<th>${i + 1}</th>`).join('')}<th>合計</th></tr>${rows}
            </table>
            <button class="bigBtn" id="againBtn">${mi('replay')} 再玩一次</button>
        </div>`);
        $('#againBtn').onclick = () => location.reload();
    }

    return {
        init, showMenu, showChefMode, showRoundCount, showTeamIntro, showCard,
        openOrderModal, showOrderCard, orderSummaryHTML, setRecipe,
        showHud, updateHud, hitFx, comboSplash, wrongKeyFx,
        countdown, showVerdict, showDuelVerdict, showScoreboard, showFinal, updateTally,
        hideOverlays, setTitleInfo, _iconFail
    };
})();
