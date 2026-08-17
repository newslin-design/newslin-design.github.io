/* ============================================================
   UI 模組：所有 DOM 畫面與 HUD
   選單 / 選店 / 選廚師 / 訂單（含難度） / 烹飪 HUD / 浮字回饋 /
   倒數 / 結算卡 / 計分板 / 最終結果
   ============================================================ */
window.PC = window.PC || {};

PC.ui = (function () {
    let flow = null;
    let ov, hudWrap, fxLayer, cdEl, titleInfo, recipeCard, recipeChips, recipeGuide, tally, storyLayer, confirmLayer;
    const hudRefs = [];   // 每盤 HUD 元素快取
    // 游標起鍋鈕：滑鼠盤點點做完後貼著游標，就地起鍋
    let cursorServe = null, mouseServeSide = -1, csFrozen = false, csX = -100, csY = -100;

    const $ = (sel, root) => (root || document).querySelector(sel);
    const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
    // 本地圖示字體（Material Icons Round，ligature）
    const mi = (name) => `<span class="mi">${name}</span>`;
    // 遊戲風圖示：優先用設定中的素材資料夾；圖片不存在時自動退回 emoji
    const gicon = (name, emoji, extra = '') =>
        `<img class="gi ${extra}" src="${PC.config.UI_ASSET_BASE || 'assets/'}${name}.png" alt="${emoji}" data-emoji="${emoji}" onerror="PC.ui._iconFail(this)">`;
    function _iconFail(img) {
        const s = document.createElement('span');
        s.className = 'giFallback ' + img.className.replace('gi', '').trim();
        s.textContent = img.dataset.emoji;
        img.replaceWith(s);
    }
    // 點菜單角色頭像缺圖 → 退回 emoji（換劇本角色、圖還沒放時不破圖）
    function _faceFail(img) {
        const s = document.createElement('span');
        s.className = 'dialogFace dialogFaceEmoji';
        s.textContent = img.dataset.emoji || '🍽️';
        img.replaceWith(s);
    }
    // 難度統一用火焰表示（一般不顯示火）
    const DIFF_LABEL = (cat, key) => {
        const d = PC.config.DIFF[cat][key];
        const fire = PC.config.HIDE_DIFFICULTY_FIRE ? ''
            : key === 'normal' ? '' : key === 'hard' ? '🔥 ' : '🔥🔥 ';
        return `${fire}${d.dots}點${d.bonus ? `+${d.bonus}分` : ''}`;
    };
    // 品項自帶難度 → 火焰徽章（一般不顯示、難 🔥、超難 🔥🔥）
    const tierTag = d => PC.config.HIDE_DIFFICULTY_FIRE || d === 'normal' ? ''
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
            <div class="flex">
                <a class="cgQr" href="${g.url}" target="_blank" rel="noopener" >
                ${qrSvg(g.url)}
                </a>
                <div class="cgMeta">🪡 ${g.needle}<br>🧵 ${g.yarn}<br>📐 ${g.size}</div>
            </div>
     
            <div class="cgBody">
                
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
        storyLayer = $('#storyLayer');
        confirmLayer = $('#confirmLayer');

        $('#peekRestore').onclick = () => {
            document.body.classList.remove('peek', 'peekUi');
            // 最終結果卡自帶總分表，回到卡片時把「關閉」時叫出來的左側累積比分收回去
            if (flow && flow.phase === 'final') tally.classList.add('hide');
        };

        // 視窗縮放時盤面標籤跟著重新對位（倒數等沒有 tick 的期間也要即時跟上）
        // 註：scene 的 resize 監聽先註冊、先更新相機，這裡再投影才會拿到新座標
        addEventListener('resize', () => {
            if (flow && flow.sessions && flow.sessions.length) placePlateBadges(flow.sessions);
        });

        $('#spinBtn').onclick = e => {
            flow.mgr.spinning = !flow.mgr.spinning;
            e.currentTarget.classList.toggle('on', flow.mgr.spinning);
        };
        $('#shotBtn').onclick = () => saveShots();
        $('#musicBtn').onclick = e => {
            const off = PC.audio.toggleMusic();
            e.currentTarget.classList.toggle('on', !off);
            e.currentTarget.innerHTML = mi(off ? 'music_off' : 'music_note');
        };
        const orderUiBtn = $('#orderUiBtn');
        if (orderUiBtn) orderUiBtn.onclick = () => {
            clickSfx();
            setOrderUiHidden(!document.body.classList.contains('order-ui-hidden'));
        };
        $('#homeBtn').onclick = () => {
            clickSfx();
            askConfirm({
                icon: mi('home'), title: '回到主選單？', sub: '本局進度會消失，確定要離開嗎？',
                okText: `回主選單 ${mi('home')}`, cancelText: '繼續遊戲',
                onOk: () => location.reload()
            });
        };

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
    function setOrderUiHidden(hidden) {
        document.body.classList.toggle('order-ui-hidden', hidden);
        const btn = $('#orderUiBtn');
        if (!btn) return;
        const label = hidden ? '顯示對話與接單操作' : '隱藏對話與接單操作';
        btn.innerHTML = mi(hidden ? 'visibility_off' : 'visibility');
        btn.title = label;
        btn.setAttribute('aria-label', label);
        btn.setAttribute('aria-pressed', String(hidden));
    }
    function showOverlay(html) {
        restoreChart();
        setOrderUiHidden(false);
        hudWrap.classList.add('hide');
        ov.classList.remove('hide', 'verdictLayer');
        document.body.classList.remove('peek', 'peekUi', 'setup', 'order');
        ov.innerHTML = html;
    }
    function hideOverlays() {
        restoreChart();
        setOrderUiHidden(false);
        ov.classList.add('hide'); ov.classList.remove('verdictLayer'); ov.innerHTML = '';
        document.body.classList.remove('peek', 'peekUi', 'setup', 'order');
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
                <img src="${PC.config.HOME_LOGO || 'assets/logo.png'}" alt="毛線麵餐廳標誌">
            </div>
            
            <div class="bigChoices">
                <button class="choice" data-m="single"><b>${gicon('rank_rookie', '⚔️', 'giHero')}</b> <b>單店營業</b><span>經營你的勾針義大利麵店</span></button>
                <button class="choice" data-m="versus"><b>${gicon('versus', '⚔️', 'giHero ')}</b> <b>雙店競賽</b><span>跟朋友一起開店，一起競爭</span></button>
            </div>
            <div class="menuRow2">
                <button class="choice practiceChoice" data-m="practice"><b>${gicon('mascot_yarn', '⚔️', 'giInlineLg')}</b><b>居家練習</b><span>隨時上手、想做幾盤都行</span></button>
                <button class="choice storyChoice" data-m="story"><b>📖</b><span>餐廳的故事</span></button>
            </div>

        </div>`);
        ov.querySelectorAll('.choice').forEach(b =>
            b.onclick = () => {
                clickSfx();
                if (b.dataset.m === 'practice') flow.startPractice();
                else if (b.dataset.m === 'story') showStory();
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
                ? '兩店同時開做直接對決'
                : '滑鼠點針目'}</span></button>
                <button class="choice" data-m="duo"><b>👩‍🍳👨‍🍳 雙廚</b><span><br>雙人協力${vs ? '，兩隊輪流' : ''}</span></button>
            </div>
        </div>`);
        ov.querySelectorAll('.choice').forEach(b =>
            b.onclick = () => { clickSfx(); flow.selectChefMode(b.dataset.m); });
        document.body.classList.add('setup');
    }

    // 選場數：要比幾場（1~4）。點數字即開賽。
    function showRoundCount(current) {
        const C = PC.config, def = current || C.ROUND_DEFAULT;
        const storyN = C.STORY_SCRIPT && C.STORY_SCRIPT.rounds;
        const btns = [];
        for (let n = C.ROUND_MIN; n <= C.ROUND_MAX; n++) {
            const isStory = n === storyN;
            btns.push(`<button class="choice countChoice${n === def ? ' on' : ''}${isStory ? ' storyRound' : ''}" data-n="${n}">${isStory ? '<i class="roundTag">劇情</i>' : ''}<b>${n}</b><span>場</span></button>`);
        }
        showOverlay(`
        <div class="modalCard menuCard">
            <h2>要比幾場？</h2>
            <p class="lead">每場都是一道菜——自己配料，或讓當場客人隨機點。${storyN ? `選 <b>${storyN} 場</b> 會進入<b>劇情關卡</b>：四道固定考題，對話與難度都不一樣！` : '想比幾場自己決定！'}</p>
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
            ? `每隊 <b>2 人</b>：一位掌 ${mi('mouse')} 滑鼠盤、一位掌 ${mi('keyboard')} 鍵盤盤（1·2·3·4·5、Enter 起鍋）`
            : duel
                ? `兩隊<b>同時對決</b>：${stores[0].name} 掌 ${mi('mouse')} 滑鼠盤、${stores[1].name} 掌 ${mi('keyboard')} 鍵盤盤（1·2·3·4·5、Enter 起鍋）`
                : '每隊 <b>1 人</b> 掌廚：滑鼠點針目';
        const teamCard = (st, i) => `
            <div class="teamCard">
                ${st.chef.img ? `<img class="teamArt" src="${st.chef.img}" alt="">`
                : `<span class="teamArtEmoji">${st.chef.emoji}</span>`}
                <b class="teamName">${st.name}</b>
                ${PC.config.HIDE_TEAM_TAGS ? '' : `<span class="teamTag">${vs ? (i === 0 ? '第一隊' : '第二隊') : '你們這隊'}</span>`}
            </div>`;
        showOverlay(`
        <div class="modalCard menuCard teamIntroModal">
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

    // ---------- 首頁「餐廳的故事」：滿版背景圖 + 打字機對話框 ----------
    // 選單覆蓋層（#overlay）留在底下不動，故事層蓋在最上面；關閉後直接露出原本的首頁。
    // 資料來源＝PC.config.STORY：物件（含 script）→ 對話框劇情；純圖陣列 → 退回舊版投影片。
    let storyKey = null;
    function showStory(onDone) {
        const S = PC.config.STORY;
        const hasScript = S && !Array.isArray(S) && Array.isArray(S.script) && S.script.length;
        if (hasScript) return storyDialogue(S, onDone);
        const imgs = Array.isArray(S) && S.length ? S : ['assets/story1.png', 'assets/story2.png', 'assets/story3.png'];
        return storySlides(imgs, onDone);
    }

    // 打字機對話框版：背景圖 + 三段式對話框（下左 bl／下右 br／中上 tc）。
    // 一個 script 物件＝一格對話框（原文案的 ---）；框內第一行立即打字、之後每行要點一下才揭曉（原文案的 >）。
    function storyDialogue(S, onDone) {
        const script = S.script;
        const images = S.images || [];
        const typeSpeed = S.typeSpeed || 45;
        const reduce = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

        storyLayer.innerHTML = `
            ${images.map((src, idx) => `
                <div class="storySlide${idx === 0 ? ' on' : ''}">
                    <img src="${src}" alt="" onerror="this.classList.add('imgFail')">
                </div>`).join('')}
            <div class="storyTop">
                <div class="storyDots">${images.map((_, idx) => `<i class="${idx === 0 ? 'on' : ''}"></i>`).join('')}</div>
                <button class="storySkip">✕ 跳過</button>
            </div>
            <div class="storyDialog" id="storyDialog"><div class="sdBody"></div><span class="sdNext">▼</span></div>`;
        storyLayer.classList.remove('hide');

        const slides = [...storyLayer.querySelectorAll('.storySlide')];
        const dots = [...storyLayer.querySelectorAll('.storyDots i')];
        const dlg = storyLayer.querySelector('#storyDialog');
        const body = dlg.querySelector('.sdBody');
        const nextIcon = dlg.querySelector('.sdNext');

        let bi = -1;         // 目前對話框 index
        let li = 0;          // 框內已顯示到第幾行
        let typing = false, timer = null, done = false, imgIdx = 0;
        let lineEl = null, full = '';

        // 一行可為字串，或 { text, img }（img＝揭曉此行時要切到的背景圖 index）
        const lineText = ln => typeof ln === 'string' ? ln : (ln.text || '');
        const lineImg = ln => typeof ln === 'string' ? null : ln.img;
        const setNext = show => nextIcon.classList.toggle('show', !!show);
        const showImage = n => {
            if (n == null || n === imgIdx) return;
            imgIdx = n;
            slides.forEach((s, k) => s.classList.toggle('on', k === n));
            dots.forEach((d, k) => d.classList.toggle('on', k === n));
        };

        function finishLine() {
            if (timer) { clearTimeout(timer); timer = null; }
            typing = false;
            if (lineEl) { lineEl.textContent = full; lineEl.classList.remove('typing'); }
            const box = script[bi];
            setNext(li + 1 < box.lines.length || bi + 1 < script.length);   // 還有下一行或下一格 → 顯示繼續指示
        }
        function typeLine(ln) {
            showImage(lineImg(ln));                 // 此行帶 img → 先切背景
            full = lineText(ln);
            lineEl = document.createElement('p');
            lineEl.className = 'sdLine typing';
            body.appendChild(lineEl);
            setNext(false);
            if (reduce) return finishLine();        // 減少動態：整行直接出現
            typing = true;
            let i = 0;
            const step = () => {
                if (!typing) return;                // 被點擊打斷（已由 finishLine 補完）
                i++;
                lineEl.textContent = full.slice(0, i);
                if (i >= full.length) return finishLine();
                const ch = full[i - 1];
                const pause = '。！？…—、，「」'.includes(ch) ? typeSpeed * 6 : typeSpeed;
                timer = setTimeout(step, pause);
            };
            timer = setTimeout(step, typeSpeed);
        }
        function showBox(n) {
            bi = n; li = 0;
            const box = script[n];
            showImage(box.img);
            dlg.className = 'storyDialog pos-' + (box.pos || 'br') + ' show';
            body.innerHTML = '';
            lineEl = null;
            typeLine(box.lines[0]);
        }
        function advance() {
            if (typing) return finishLine();        // 打字中 → 先把整行補完
            const box = script[bi];
            if (li + 1 < box.lines.length) {         // 同框下一行（原文案的 >）
                li++; PC.audio.play('sfx_ui_click'); typeLine(box.lines[li]);
            } else if (bi + 1 < script.length) {      // 換下一格（原文案的 ---）
                PC.audio.play('sfx_ui_click'); showBox(bi + 1);
            } else finish();                          // 全部講完 → 回首頁
        }
        const finish = () => {
            if (done) return; done = true;
            if (timer) clearTimeout(timer);
            removeEventListener('keydown', storyKey); storyKey = null;
            storyLayer.classList.add('hide');
            storyLayer.innerHTML = '';
            onDone && onDone();
        };

        storyLayer.onclick = e => {
            if (e.target.closest('.storySkip')) { PC.audio.play('sfx_ui_click'); return finish(); }
            advance();
        };
        storyKey = e => {
            if (e.key === 'Escape') finish();
            else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); advance(); }
        };
        addEventListener('keydown', storyKey);
        showBox(0);
    }

    // 舊版純投影片：滿版三張圖，點畫面換下一張（無對話框；把 STORY 設成字串陣列時走這條）
    function storySlides(imgs, onDone) {
        let i = 0, done = false;
        const last = imgs.length - 1;
        storyLayer.innerHTML = `
            ${imgs.map((src, idx) => `
                <div class="storySlide${idx === 0 ? ' on' : ''}">
                    <img src="${src}" alt="" onerror="this.classList.add('imgFail')">
                </div>`).join('')}
            <div class="storyTop">
                <div class="storyDots">${imgs.map((_, idx) => `<i class="${idx === 0 ? 'on' : ''}"></i>`).join('')}</div>
                <button class="storySkip">✕ 跳過</button>
            </div>
            <div class="storyHint">點畫面繼續 ›</div>`;
        storyLayer.classList.remove('hide');
        const slides = [...storyLayer.querySelectorAll('.storySlide')];
        const dots = [...storyLayer.querySelectorAll('.storyDots i')];
        const hint = storyLayer.querySelector('.storyHint');

        const goTo = n => {
            slides.forEach((s, k) => s.classList.toggle('on', k === n));
            dots.forEach((d, k) => d.classList.toggle('on', k === n));
            if (hint) hint.textContent = n >= last ? '點一下回首頁 ↩' : '點畫面繼續 ›';
        };
        const finish = () => {
            if (done) return; done = true;
            removeEventListener('keydown', storyKey); storyKey = null;
            storyLayer.classList.add('hide');
            storyLayer.innerHTML = '';
            onDone && onDone();
        };
        const next = () => {
            if (i >= last) return finish();     // 最後一張再點 → 回首頁
            i++; PC.audio.play('sfx_ui_click'); goTo(i);
        };
        storyLayer.onclick = e => {
            if (e.target.closest('.storySkip')) { PC.audio.play('sfx_ui_click'); return finish(); }
            next();
        };
        storyKey = e => {
            if (e.key === 'Escape') finish();
            else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
        };
        addEventListener('keydown', storyKey);
    }

    // ---------- 確認對話框（取代瀏覽器 confirm）----------
    // 用自己的 #confirmLayer，不動 #overlay：工具列的鈕隨時都能按，
    // 走 showOverlay 會把底下正在看的畫面（點菜單／結算卡）整個洗掉。
    // 取消＝點背景、Esc、或取消鈕；確定才跑 onOk。
    function askConfirm({ icon, title, sub, okText, cancelText, onOk }) {
        PC.audio.play('sfx_order_open');
        confirmLayer.innerHTML = `
        <div class="modalCard confirmCard">
            <div class="cardIcon">${icon || '🧶'}</div>
            <h2>${title}</h2>
            ${sub ? `<p class="lead">${sub}</p>` : ''}
            <div class="confirmBtns">
                <button class="ghostBtn" id="cfNo">${cancelText || '取消'}</button>
                <button class="bigBtn" id="cfYes">${okText || '確定'}</button>
            </div>
        </div>`;
        confirmLayer.classList.remove('hide');

        const close = () => {
            removeEventListener('keydown', key);
            confirmLayer.classList.add('hide');
            confirmLayer.innerHTML = '';
        };
        const key = e => {
            if (e.key === 'Escape') { e.preventDefault(); clickSfx(); close(); }
        };
        addEventListener('keydown', key);
        // 點卡片外的暗底＝取消
        confirmLayer.onclick = e => { if (e.target === confirmLayer) { clickSfx(); close(); } };
        $('#cfNo', confirmLayer).onclick = () => { clickSfx(); close(); };
        $('#cfYes', confirmLayer).onclick = () => { clickSfx(); close(); onOk(); };
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

    // ---------- 點菜單（圖形織圖選擇＋右側成品照＋配料一/二＋可選 🎲 隨機）----------
    // 版面：dialogSay 收在左欄內 → 右側欄（orderSide）才能從 modal 頂端一路撐到底，右上不留洞。
    // 配料兩排各自獨立（兩格可以選同一種料，如預設的 squid+squid）——別合併成單一清單。
    function openOrderModal({ title, sub, mascot, mascotEmoji, order, confirmText, dice, inputChoice, onChange, onConfirm }) {
        PC.audio.play('sfx_order_open');
        const C = PC.config;
        showOverlay(`
        <div class="modalCard orderModal">
            <div class="orderCols">
                <div class="orderMain">
                    <div class="dialogSay">
                        ${mascot ? `<img class="dialogFace" src="${mascot}" alt="" data-emoji="${mascotEmoji || '🍽️'}" onerror="PC.ui._faceFail(this)">` : ''}
                        <div class="dialogText">
                            <b class="dialogTitle">${title}</b>
                            <span class="dialogLine">${sub}</span>
                        </div>
                        ${C.DICE_AFTER_DIALOG && dice ? `<button class="diceBtn dialogDice" id="mDice" title="${dice.label || '隨機點餐'}" aria-label="${dice.label || '隨機點餐'}">${C.DICE_ICON_ONLY ? '🎲' : (dice.label || '🎲 隨機點餐')}</button>` : ''}
                    </div>
                    ${C.COMPACT_ENGLISH_SECTION_LABELS ? `<div class="secRow patternSection">
                        <span class="secTitle">PATTERN</span>
                        <div class="itemGrid pat" id="mPat"></div>
                    </div>` : '<div class="itemGrid pat" id="mPat"></div>'}
                    <div class="secRow">
                        <span class="secTitle" title="醬料是你會用最多的毛線顏色">${C.COMPACT_ENGLISH_SECTION_LABELS ? 'SAUCE' : '醬料'}</span>
                        <div class="itemGrid" id="mSauce"></div>
                    </div>
                    <div class="secRow">
                        <span class="secTitle" title="可以選兩個配料，點綴你的編織義大利麵">${C.COMPACT_ENGLISH_SECTION_LABELS ? 'TOPPINGS' : '配料'}</span>
                        ${C.UNIFIED_TOPPINGS ? '<div class="itemGrid toppingsUnified" id="mTops"></div>' : `<div class="secGrids">
                            <div class="itemGrid" id="mTop0"></div>
                            <div class="itemGrid" id="mTop1"></div>
                        </div>`}
                    </div>
                </div>
                <div class="orderSide${C.BOTTOM_ORDER_DOCK ? ' orderBottomDock' : ''}">
                    <div id="mChartSlot">
                        <div class="patternPhoto${C.PHOTO_SCORE_HOVER ? ' scoreHoverPhoto' : ''}"${C.PHOTO_SCORE_HOVER ? ' tabindex="0" aria-label="實際鉤織參考；滑過或聚焦查看目前分數詳情"' : ''}>
                            <img id="mPatternPhoto" src="" alt="">
                            ${C.HIDE_ORDER_HELP_LABELS ? '' : `<span>${C.PHOTO_SCORE_HOVER ? '實際鉤織 · HOVER' : '實際鉤織參考'}</span>`}
                            ${C.PHOTO_SCORE_HOVER ? '<div class="photoScoreTooltip orderSummary" id="mSum"></div>' : ''}
                        </div>
                        <div id="mChartData" aria-hidden="true"></div>
                    </div>
                    ${C.PHOTO_SCORE_HOVER ? '' : '<div class="orderSummary" id="mSum"></div>'}
                    ${!C.BOTTOM_ORDER_DOCK && dice ? `<button class="diceBtn" id="mDice">${dice.label || '🎲 隨機點餐'}</button>` : ''}
                    ${inputChoice ? `<div class="inputAssign" id="mInput"></div>` : ''}
                    <button class="bigBtn" id="mOk">${C.BOTTOM_ORDER_DOCK ? '<span>接單<br>開做</span>' : (C.HIDE_DIFFICULTY_FIRE ? (confirmText || '🧶 開始編織').replace(/🔥+/g, '').trim() : (confirmText || '🧶 開始編織'))}</button>
                    ${C.BOTTOM_ORDER_DOCK && dice && !C.DICE_AFTER_DIALOG ? `<button class="diceBtn" id="mDice" title="${dice.label || '隨機點餐'}" aria-label="${dice.label || '隨機點餐'}">${C.DICE_ICON_ONLY ? '🎲' : (dice.label || '🎲 隨機點餐')}</button>` : ''}
                </div>
            </div>
        </div>`);
        // 點菜單專屬滿版手繪背景（dialogBg）；換畫面時 showOverlay/hideOverlays 會拿掉
        document.body.classList.add('order');
        // chartBox 仍負責解析織圖與驅動 3D 上色，但點菜時藏在成品照後方。
        // 關閉／換畫面時 restoreChart 會搬回菜譜卡。
        $('#mChartData').appendChild(document.getElementById('chartBox'));
        recipeCard.classList.add('hide');

        // 左側織圖只顯示簡化幾何圖形；右側才顯示實際鉤織成品照。
        // 配料只放圖不放名稱；名稱掛 title，滑過去仍可查到。
        // 醬料才給 name：色票／醬汁照片分不出「紅醬 vs 粉紅醬」「白醬 vs 清炒」。
        const itemCard = ({ img, thumbHTML, swatch, emoji, name, title, tier, on, count = 0, fn }) => {
            const thumb = thumbHTML || (img ? `<img src="${img}" alt="" loading="lazy">`
                : swatch ? `<i class="bigSwatch" style="background:${swatch}"></i>`
                    : `<span class="bigEmoji">${emoji || '🧶'}</span>`);
            const b = el(`<button class="itemCard${on ? ' on' : ''}"${title ? ` title="${title}"` : ''}>
                ${tierTag(tier)}
                ${count > 1 ? `<span class="pickCount" aria-label="已選 ${count} 份">×${count}</span>` : ''}
                <span class="itemThumb">${thumb}</span>
                ${name ? `<span class="itemName">${name}</span>` : ''}</button>`);
            b.onclick = fn;
            return b;
        };
        // 配料標籤是「🍅 番茄」：拆成 emoji（缺圖退回用）與純名稱（卡片文字用）
        const topEmoji = k => C.TOPPINGS[k].label.split(' ')[0];
        const topName = k => C.TOPPINGS[k].label.replace(/^\S+\s+/, '');

        // 選項只需要辨認外形，不放真實照片。相近的圓形款以內圈／花瓣數區分。
        const patternIconSVG = key => {
            const wrap = body => `<svg class="patternGlyph" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${body}</svg>`;
            const petals = n => Array.from({ length: n }, (_, i) =>
                `<ellipse cx="50" cy="25" rx="9" ry="20" transform="rotate(${i * 360 / n} 50 50)"></ellipse>`).join('');
            const icons = {
                sakura: `<g>${petals(5)}<circle cx="50" cy="50" r="10"></circle></g>`,
                d012: '<circle cx="50" cy="50" r="34"></circle><circle cx="50" cy="50" r="23" stroke-dasharray="3 5"></circle><circle cx="50" cy="50" r="8"></circle>',
                d032: '<rect x="23" y="23" width="54" height="54" rx="7" transform="rotate(45 50 50)"></rect><rect x="36" y="36" width="28" height="28" rx="4" transform="rotate(45 50 50)"></rect>',
                d004: `<g>${petals(8)}<circle cx="50" cy="50" r="18"></circle></g>`,
                star: '<polygon points="50,8 61,31 88,25 72,49 89,70 62,68 50,92 38,68 11,70 28,49 12,25 39,31"></polygon><circle cx="50" cy="50" r="12"></circle>',
                circle1: '<circle cx="50" cy="50" r="37"></circle><circle cx="50" cy="50" r="25"></circle><circle cx="50" cy="50" r="11"></circle>',
                circle2: '<circle cx="50" cy="50" r="38"></circle><circle cx="50" cy="50" r="29" stroke-dasharray="2 5"></circle><circle cx="50" cy="50" r="17"></circle><circle cx="50" cy="50" r="6"></circle>',
                flower1: `<g>${petals(8)}<circle cx="50" cy="50" r="9"></circle></g>`,
                flower2: '<g><path d="M50 10V90M15 30L85 70M15 70L85 30"></path><path d="M50 10L44 22M50 10L56 22M50 90L44 78M50 90L56 78M15 30L29 30M15 30L22 42M85 70L71 70M85 70L78 58M15 70L29 70M15 70L22 58M85 30L71 30M85 30L78 42"></path><circle cx="50" cy="50" r="8"></circle></g>',
                hexagon: '<polygon points="50,10 84,30 84,70 50,90 16,70 16,30"></polygon><polygon points="50,27 69,38 69,62 50,73 31,62 31,38"></polygon>'
            };
            return wrap(icons[key] || icons.circle1);
        };
        const patternName = label => label.replace(/^[◆●✦❁❄⬡]\s*/, '');

        // 織圖依難度排序（一般→難→超難）；左側使用簡化圖形，成品 PNG 只在右側顯示。
        const diffRank = { normal: 0, hard: 1, expert: 2 };
        let nextTopSlot = 0;
        const render = () => {
            const pat = $('#mPat'); pat.innerHTML = '';
            Object.entries(C.PATTERNS)
                .sort(([, a], [, b]) => (diffRank[a.diff] ?? 9) - (diffRank[b.diff] ?? 9))
                .forEach(([k, p]) => {
                    pat.appendChild(itemCard({
                        thumbHTML: p.icon ? `<img class="patternGeneratedIcon" src="${p.icon}" alt="">` : patternIconSVG(k),
                        name: C.HIDE_PATTERN_NAMES ? '' : patternName(p.label), tier: p.diff,
                        title: p.label,
                        on: order.pattern === k,
                        fn: () => { clickSfx(); order.pattern = k; render(); }
                    }));
                });
            const selectedPattern = C.PATTERNS[order.pattern];
            const patternPhoto = $('#mPatternPhoto');
            if (patternPhoto) {
                patternPhoto.src = (selectedPattern.img || '').replace(/\.svg$/i, '.png');
                patternPhoto.alt = `${selectedPattern.label}實際鉤織成品`;
            }
            const sau = $('#mSauce'); sau.innerHTML = '';
            Object.entries(C.SAUCES).forEach(([name, s]) =>
                sau.appendChild(itemCard({
                    img: s.img, swatch: s.color, name, tier: s.diff,
                    on: order.sauce === name,
                    fn: () => { clickSfx(); order.sauce = name; render(); }
                })));
            if (C.UNIFIED_TOPPINGS) {
                const box = $('#mTops'); box.innerHTML = '';
                Object.entries(C.TOPPINGS).forEach(([k, d]) => {
                    const count = order.tops.filter(top => top === k).length;
                    box.appendChild(itemCard({
                        img: d.img, emoji: topEmoji(k), title: topName(k), tier: d.diff,
                        on: count > 0,
                        count,
                        fn: () => {
                            if (count === 2) return;
                            clickSfx();
                            if (count === 1) {
                                const selectedSlot = order.tops.indexOf(k);
                                order.tops[1 - selectedSlot] = k;
                                nextTopSlot = selectedSlot;
                            } else {
                                order.tops[nextTopSlot] = k;
                                nextTopSlot = (nextTopSlot + 1) % 2;
                            }
                            render();
                        }
                    }));
                });
            } else {
                [0, 1].forEach(slot => {
                    const box = $('#mTop' + slot); box.innerHTML = '';
                    Object.entries(C.TOPPINGS).forEach(([k, d]) =>
                        box.appendChild(itemCard({
                            img: d.img, emoji: topEmoji(k), title: topName(k), tier: d.diff,
                            on: order.tops[slot] === k,
                            fn: () => { clickSfx(); order.tops[slot] = k; render(); }
                        })));
                });
            }
            $('#mSum').innerHTML = orderSummaryHTML(order);
            if (onChange) onChange(order);
        };
        render();

        // 雙盤：操作分配（誰滑鼠誰鍵盤）。點座位卡即把滑鼠指到該盤，另一盤自動轉鍵盤。
        // 與選料無關，只需渲染一次（render() 不會動到 #mInput）。
        function renderInputAssign() {
            const box = $('#mInput'); if (!box || !inputChoice) return;
            const seatBtn = (seat, i) => {
                const mouse = inputChoice.mouseSide === i;
                return `<button class="seatCard ${mouse ? 'mouse' : 'keys'}" data-side="${i}" title="${mouse ? '這盤用滑鼠' : '點一下改用滑鼠'}">
                    ${chefFaceHTML(seat.face, 'seatFace')}
                    ${C.HIDE_INPUT_NAMES ? '' : `<span class="seatWho"><b>${seat.name}</b>${seat.sub ? `<small>${seat.sub}</small>` : ''}</span>`}
                    <span class="seatDev">${mouse ? mi('mouse') + ' 滑鼠' : mi('keyboard') + ' 鍵盤'}</span>
                </button>`;
            };
            box.innerHTML = `
                ${C.HIDE_ORDER_HELP_LABELS ? '' : `<div class="iaHead">${mi('sports_esports')} 這場的操作 <small>點頭像交換</small></div>`}
                <div class="seatRow">${inputChoice.seats.map(seatBtn).join('<span class="iaVs">⇄</span>')}</div>`;
            box.querySelectorAll('.seatCard').forEach(b => b.onclick = () => {
                const side = +b.dataset.side;
                if (inputChoice.mouseSide === side) return;   // 已是滑鼠盤，不動作
                clickSfx();
                inputChoice.mouseSide = side;
                if (inputChoice.onPick) inputChoice.onPick(side);
                renderInputAssign();
            });
        }
        renderInputAssign();

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
        // 烹飪視角已鎖定標準機位（scene.lockView）：盤 0 固定在畫面左、盤 1 在右，
        // 起鍋卡照 session 順序排即與上方盤面對齊（舊的左右反轉是鏡頭隨機角度時代的補救，反而必錯邊）
        sessions.forEach((s, i) => {
            const chef = s.chef || { emoji: '👨‍🍳', name: '主廚' };
            const card = el(`
            <div class="card cookCard">
                <div class="chefLine">${chefFaceHTML(chef, 'chefFace')}<b>${chef.name}</b>
                    <span class="inputTag ${s.input}">${s.input === 'keys' ? mi('keyboard') + ' 鍵盤 1·2·3·4·5' : mi('mouse') + ' 滑鼠'}</span></div>
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
        // 盤面歸屬標籤：掛在各盤正上方（誰的盤、用什麼操作，抬頭就看得到）；單盤不需要
        if (sessions.length > 1) sessions.forEach((s, i) => {
            const chef = s.chef || { emoji: '👨‍🍳', name: '主廚' };
            const b = el(`<div class="plateBadge">
                ${chefFaceHTML(chef, 'plateFace')}<b>${chef.name}</b>
                <span class="inputTag ${s.input}">${s.input === 'keys' ? mi('keyboard') + ' 鍵盤' : mi('mouse') + ' 滑鼠'}</span>
            </div>`);
            hudWrap.appendChild(b);
            hudRefs[i].badge = b;
        });
        placePlateBadges(sessions);
        updateTally();
    }

    // 盤面標籤對位：把 3D 盤位投影成螢幕座標，貼在盤子上緣外側。
    // hudWrap 有 transform（成為 fixed/absolute 子元素的包含塊），所以扣掉 hudWrap 自身的螢幕位置
    function placePlateBadges(sessions) {
        const base = hudWrap.getBoundingClientRect();
        sessions.forEach((s, i) => {
            const b = hudRefs[i] && hudRefs[i].badge; if (!b) return;
            const p = flow.mgr.toScreen(s.rig.root.position.x, 2, -19);   // 盤緣（半徑 13.9）再往後一點
            b.style.left = (p.x - base.left) + 'px';
            b.style.top = (p.y - base.top) + 'px';
        });
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
        // 盤面標籤對位放在最後：keyHint 顯示/隱藏會改變卡片高度 → hudWrap（貼底）往上長，
        // 先量再改 DOM 會拿到舊基準，倒數期間標籤就飄掉（跑版）；改完 DOM 再量才準
        placePlateBadges(sessions);
    }

    // ---------- 回饋 FX ----------
    const GRADE_FX = {
        perfect: { cls: 'fxPerfect', text: g => `✨完美 +${g.toFixed(1)}` },
        ok: { cls: 'fxOk', text: g => `👌不錯 +${g.toFixed(1)}` },
        bad: { cls: 'fxBad', text: g => `+${g.toFixed(1)}` }
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
        // 倒數整段 3-2-1 是一個音檔：countdown 一開始（＝開始前約 3 秒）播一次
        PC.audio.play('sfx_count');
        const seq = ['3', '2', '1', '開始🍳'];
        cdEl.classList.remove('hide');
        let i = 0;
        const step = () => {
            if (i >= seq.length) { cdEl.classList.add('hide'); onGo(); return; }
            cdEl.textContent = seq[i];
            cdEl.classList.remove('pop'); void cdEl.offsetWidth; cdEl.classList.add('pop');
            if (i === seq.length - 1) PC.audio.play('sfx_go');   // 只有「開始」那拍再補一聲
            i++;
            setTimeout(step, i === seq.length ? 650 : 800);
        };
        step();
    }

    // ---------- 結算 ----------
    // 單盤得分明細
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

    // 所有模式共用單廚競賽版型：上方結果標題＋右側每盤一張 plateResult。
    // 對戰顯示勝負文字；其他模式顯示本場總分，但卡片結構與每盤得分列完全一致。
    function showVerdict({ store, roundLabel, plates, chefs, inputs, score, onNext, eyebrow, headline, nextLabel, onHome, pattern, order }) {
        const plateHTML = plates.map((r, i) => {
            const chef = chefs[i] || { emoji: '👨‍🍳', name: '主廚' };
            const tag = plates.length > 1 ? `<span class="plateTag">${inputs && inputs[i] === 'keys' ? mi('keyboard') + ' 鍵盤盤' : mi('mouse') + ' 滑鼠盤'}</span>` : '';
            return `
            <div class="plateResult">
                <div class="plateHead">${chefFaceHTML(chef, 'plateChefFace')}${chef.name}${tag}</div>
                ${plateStatsHTML(r, true)}
            </div>`;
        }).join('');
        // 非阻擋式結算：不蓋住 3D 成品。分數置中上方、細節靠右、下一步置中下方
        restoreChart();
        hideCursorServe();
        recipeCard.classList.add('hide');
        hudWrap.classList.add('hide');
        document.body.classList.remove('peek', 'peekUi', 'setup', 'order');
        ov.classList.remove('hide');
        ov.classList.add('verdictLayer');
        ov.innerHTML = `
            <div class="vScoreTop">
                <div class="verdictEyebrow">${eyebrow || `${store.emoji} ${store.name}｜${roundLabel}`}</div>
                <div class="duelResultLine">${headline || `本場 ${score} 分`}</div>
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
        $('#vPeek').onclick = () => document.body.classList.add('peek');
        if (onHome) $('#vHome').onclick = () => { clickSfx(); document.body.classList.remove('peek'); onHome(); };
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
            return `<td class="tTot">${isLead ? '👑</br>' : '😒</br>'}${s.total}</td>`;
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
            <div class="finalBtns">
                <button class="ghostBtn" id="fPeek">${mi('visibility')} 只看成品</button>
                <button class="ghostBtn" id="fClose">${mi('close')} 關閉</button>
                <button class="bigBtn" id="againBtn">${mi('replay')} 再玩一次</button>
            </div>
        </div>`);
        $('#fPeek').onclick = () => document.body.classList.add('peek');     // 全收：只留成品（拍乾淨畫面用）
        $('#fClose').onclick = () => {
            document.body.classList.add('peekUi');   // 只收結果卡：保留工具列（旋轉/拍照/回首頁）
            updateTally();                           // 累積比分也要回來（對決模式看兩隊總分）
        };
        $('#againBtn').onclick = () => location.reload();
    }

    return {
        init, showMenu, showChefMode, showRoundCount, showTeamIntro, showStory, showCard,
        openOrderModal, showOrderCard, orderSummaryHTML, setRecipe,
        showHud, updateHud, hitFx, comboSplash, wrongKeyFx,
        countdown, showVerdict, showScoreboard, showFinal, updateTally,
        hideOverlays, setTitleInfo, _iconFail, _faceFail
    };
})();
