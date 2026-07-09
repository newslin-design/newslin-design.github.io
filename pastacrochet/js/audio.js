/* ============================================================
   音效管理器（WebAudio）
   - 檔案清單來自 PC.config.SOUNDS（sounds/ 資料夾）
   - 缺檔：靜默略過（console 一次性彙報），之後補檔重整即生效
   - 瀏覽器 autoplay 限制：第一次使用者手勢才建立 AudioContext
   ============================================================ */
window.PC = window.PC || {};

PC.audio = (function () {
    let ctx = null;
    const buffers = {};          // name → AudioBuffer
    const missing = [];
    let muted = false;
    let bgmNode = null, bgmName = null, bgmGain = null;
    let pendingBgm = null;       // 解鎖前就被要求播的 BGM
    let loaded = false;

    function unlock() {
        if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
        try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { return; }
        loadAll();
    }

    async function loadAll() {
        if (loaded) return; loaded = true;
        const jobs = Object.entries(PC.config.SOUNDS).map(async ([name, def]) => {
            try {
                const res = await fetch('sounds/' + def.file);
                if (!res.ok) throw 0;
                buffers[name] = await ctx.decodeAudioData(await res.arrayBuffer());
            } catch (e) { missing.push(def.file); }
        });
        await Promise.all(jobs);
        if (missing.length)
            console.info('[PC.audio] 音效檔尚未提供（靜默略過）：' + missing.join(', '));
        if (pendingBgm) { const n = pendingBgm; pendingBgm = null; bgm(n); }
    }

    function play(name, opt = {}) {
        if (muted || !ctx || !buffers[name]) return;
        const def = PC.config.SOUNDS[name];
        const src = ctx.createBufferSource();
        src.buffer = buffers[name];
        if (opt.rate) src.playbackRate.value = opt.rate;
        const g = ctx.createGain();
        g.gain.value = (def.vol ?? 1) * (opt.vol ?? 1);
        src.connect(g).connect(ctx.destination);
        src.start();
    }

    function bgm(name) {
        if (!ctx || !loaded || muted) { pendingBgm = name; return; }
        if (bgmName === name) return;
        stopBgm();
        bgmName = name;
        if (!buffers[name]) return;
        const def = PC.config.SOUNDS[name];
        bgmNode = ctx.createBufferSource();
        bgmNode.buffer = buffers[name];
        bgmNode.loop = true;
        bgmGain = ctx.createGain();
        bgmGain.gain.value = def.vol ?? .35;
        bgmNode.connect(bgmGain).connect(ctx.destination);
        bgmNode.start();
    }
    function stopBgm() {
        if (bgmNode) { try { bgmNode.stop(); } catch (e) {} bgmNode = null; }
        bgmName = null;
    }

    function toggleMute() {
        muted = !muted;
        if (muted) { pendingBgm = bgmName || pendingBgm; stopBgm(); }
        else if (pendingBgm) { const n = pendingBgm; pendingBgm = null; bgm(n); }
        return muted;
    }

    // 任何第一次手勢都解鎖（點擊/按鍵）
    addEventListener('pointerdown', unlock, { once: false });
    addEventListener('keydown', unlock, { once: false });

    return { play, bgm, stopBgm, toggleMute, get muted() { return muted; } };
})();
