/* ============================================================
   織圖模組：載入 SVG 織圖、面積規則自動歸帶、依訂單即時上色
   （移植自 POC v5.5 統一「底色塊驅動」邏輯，改為訂單物件驅動）
   - 大色塊依 RGB 距離併家族、按面積排序：最大＝醬料、第 2/3＝派料
   - zoneMap：48 環「半徑 → 角色」，供 3D 麵條分區上色
   ============================================================ */
window.PC = window.PC || {};

PC.charts = (function () {
    const cache = {};                       // key → svg 原文
    let groups = { sauce: [], top0: [], top1: [] };
    let zoneMap = [];
    let currentKey = null;
    let box = null;                         // 織圖顯示容器（ui 提供）
    let curOrder = null;
    let onZones = null;                     // zoneMap 更新後回呼（rig 重上色）

    function hsvOf(r, g, b) {
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
        let h = 0;
        if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
        return { h, s: mx ? d / mx : 0, v: mx };
    }
    function lighten(hex, k) {
        return '#' + new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), k).getHexString();
    }
    function roleColor(role, order) {
        order = order || curOrder;
        if (!order) return '#cccccc';
        const C = PC.config;
        if (role === 'sauce') return C.SAUCES[order.sauce].color;
        const fallback = lighten(C.SAUCES[order.sauce].color, .45);
        if (role === 'top0') return order.tops[0] ? C.TOPPINGS[order.tops[0]].color : fallback;
        return order.tops[1] ? C.TOPPINGS[order.tops[1]].color : fallback;
    }
    function recolor(order) {
        if (order) curOrder = order;
        groups.sauce.forEach(p => p.setAttribute('fill', roleColor('sauce')));
        groups.top0.forEach(p => p.setAttribute('fill', roleColor('top0')));
        groups.top1.forEach(p => p.setAttribute('fill', roleColor('top1')));
    }

    // ── 哨兵色工具 ──────────────────────────────────────────
    function hexToRgb(hex) {
        const n = parseInt(hex.replace('#', ''), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function sentinelList() {
        const S = PC.config.ZONE_SENTINELS;
        return Object.keys(S).map(role => ({ role, rgb: hexToRgb(S[role]) }));
    }
    function fillRoleOf(fill, sents, tol) {
        if (!/^#[0-9A-Fa-f]{6}$/.test(fill || '')) return null;
        const rgb = hexToRgb(fill);
        for (const s of sents) {
            if (Math.hypot(rgb[0] - s.rgb[0], rgb[1] - s.rgb[1], rgb[2] - s.rgb[2]) <= tol) return s.role;
        }
        return null;
    }
    // 滿版且未旋轉的 rect＝背景（會被刷白，白底距 top1 僅 1.4 會誤判）。
    // 角色區塊若畫成 rect（如 032 的旋轉方形醬料）帶 rotate/尺寸較小 → 不算背景，照常偵測。
    function isBgRect(el, vb) {
        if ((el.tagName || '').toLowerCase() !== 'rect') return false;
        if (/rotate|matrix|skew/i.test(el.getAttribute('transform') || '')) return false;
        const w = parseFloat(el.getAttribute('width')) || 0;
        const h = parseFloat(el.getAttribute('height')) || 0;
        return vb && w >= vb.width * 0.95 && h >= vb.height * 0.95;
    }

    /** 路由：SVG 含哨兵色 → 明確模式；否則退回舊版面積啟發式 */
    function analyze(txt, key, svgEl, done) {
        const sents = sentinelList();
        const tol = PC.config.ZONE_SENTINEL_TOL;
        const vb = svgEl.viewBox.baseVal;
        groups = { sauce: [], top0: [], top1: [] };
        let hasSentinel = false;
        // 含 rect（角色塊可能是方形/旋轉方形），但跳過滿版背景 rect（刷白後會誤判成 top1）
        svgEl.querySelectorAll('path, circle, ellipse, polygon, rect').forEach(p => {
            if (isBgRect(p, vb)) return;
            const role = fillRoleOf(p.getAttribute('fill'), sents, tol);
            if (role) { groups[role].push(p); hasSentinel = true; }
        });
        if (hasSentinel) return analyzeExplicit(svgEl, sents, tol, done);
        return analyzeHeuristic(txt, key, svgEl, done);
    }

    // ── 明確模式：角色由哨兵色決定 ──
    // zoneMap 用「標記遮罩」：把角色色塊暫換成純紅/綠/藍、其餘元素全藏起來再點陣化，
    // 讓 3D 偵測與你 SVG 的柔和顯示色完全脫鉤 → 不會撞白底、也不怕三色太接近。
    function analyzeExplicit(svgEl, sents, tol, done) {
        const roleIdx = {}; sents.forEach((s, i) => roleIdx[s.role] = i);
        const MARK = ['#ff0000', '#00ff00', '#0000ff'];      // 依 sents 順序＝sauce/top0/top1
        const markRgb = MARK.map(hexToRgb);

        // 複製一份當遮罩：角色色塊→純標記色；其餘元素（含背景 rect）→不畫（fill/stroke none）
        const vb = svgEl.viewBox.baseVal;
        const clone = svgEl.cloneNode(true);
        clone.querySelectorAll('path, circle, ellipse, polygon, rect, line, polyline').forEach(el => {
            const role = isBgRect(el, vb) ? null : fillRoleOf(el.getAttribute('fill'), sents, tol);
            if (role) {
                el.setAttribute('fill', MARK[roleIdx[role]]);
                el.setAttribute('fill-opacity', '1');
                el.setAttribute('opacity', '1');
                el.setAttribute('stroke', 'none');
            } else {
                el.setAttribute('fill', 'none');
                el.setAttribute('stroke', 'none');
            }
        });
        const maskTxt = new XMLSerializer().serializeToString(clone);

        const img = new Image();
        img.onload = () => {
            const S = 384, NZ = 48;
            const c = document.createElement('canvas'); c.width = c.height = S;
            const g = c.getContext('2d');
            g.fillStyle = '#ffffff'; g.fillRect(0, 0, S, S);   // 白底＝非角色區
            g.drawImage(img, 0, 0, S, S);
            const d = g.getImageData(0, 0, S, S).data;
            const zoneCnt = Array.from({ length: NZ }, () => new Array(sents.length).fill(0));
            for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
                const i = (y * S + x) * 4;
                let si = -1, best = 80;   // 標記色彼此差 255，容差 80 吃抗鋸齒、丟邊緣混色
                for (let k = 0; k < markRgb.length; k++) {
                    const m = markRgb[k];
                    const dd = Math.hypot(d[i] - m[0], d[i + 1] - m[1], d[i + 2] - m[2]);
                    if (dd < best) { best = dd; si = k; }
                }
                if (si < 0) continue;
                const f = Math.hypot(x - S / 2, y - S / 2) / (S / 2);
                if (f < 1) zoneCnt[Math.floor(f * NZ)][si]++;
            }
            // 同心環帶：每環取多數標記色的角色（無票＝null，之後補洞）
            zoneMap = zoneCnt.map(cnts => {
                let bi = -1, bn = 0;
                for (let k = 0; k < cnts.length; k++) if (cnts[k] > bn) { bn = cnts[k]; bi = k; }
                return bn > 0 ? sents[bi].role : null;
            });
            fillZoneHoles(zoneMap, NZ);
            recolor();
            URL.revokeObjectURL(img.src);
            if (onZones) onZones();
            if (done) done();
        };
        img.onerror = () => { zoneMap = []; recolor(); if (onZones) onZones(); if (done) done(); };
        img.src = URL.createObjectURL(new Blob([maskTxt], { type: 'image/svg+xml' }));
    }

    // 補洞（空環向左右找同角色鄰居）＋去單環孤島
    function fillZoneHoles(zm, NZ) {
        for (let i = 0; i < NZ; i++) {
            if (zm[i] !== null) continue;
            let l = i - 1; while (l >= 0 && zm[l] === null) l--;
            let r = i + 1; while (r < NZ && zm[r] === null) r++;
            if (l >= 0 && r < NZ && zm[l] === zm[r]) zm[i] = zm[l];
            else if (l >= 0 && r >= NZ) zm[i] = zm[l];      // 尾端外圈延伸
            else if (l < 0 && r < NZ) zm[i] = zm[r];        // 圓心內圈延伸
        }
        for (let i = 1; i < NZ - 1; i++) {
            if (zm[i - 1] === zm[i + 1] && zm[i] !== zm[i - 1]) zm[i] = zm[i - 1];
        }
    }

    function analyzeHeuristic(txt, key, svgEl, done) {
        const vb = svgEl.viewBox.baseVal;
        const minArea = vb.width * vb.height * 0.0025;
        const blocks = [];
        svgEl.querySelectorAll('path, circle, ellipse').forEach(p => {
            const fl = p.getAttribute('fill') || '';
            if (!/^#[0-9A-Fa-f]{6}$/.test(fl)) return;
            const n = parseInt(fl.slice(1), 16);
            const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
            const { s, v } = hsvOf(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
            if (s <= 0.10 || v <= 0.2) return;               // 白/灰底、黑線不是色塊
            const bb = p.getBBox();
            if (bb.width * bb.height < minArea) return;      // 小色塊＝針目線
            blocks.push({ p, rgb, area: bb.width * bb.height });
        });
        blocks.sort((a, b) => b.area - a.area);
        const rgbDist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        const families = [];
        blocks.forEach(b => {
            let fam = families.find(f => f.colors.some(cc => rgbDist(cc, b.rgb) < 60));
            if (!fam) { fam = { colors: [], area: 0, paths: [] }; families.push(fam); }
            if (!fam.colors.some(cc => rgbDist(cc, b.rgb) < 8)) fam.colors.push(b.rgb);
            fam.area += b.area;
            fam.paths.push(b.p);
        });
        families.sort((a, b) => b.area - a.area);
        const roleOrder = ['sauce', 'top0', 'top1'];
        groups = { sauce: [], top0: [], top1: [] };
        const famRoles = [];
        families.slice(0, 3).forEach((f, i) => {
            famRoles.push({ role: roleOrder[i], colors: f.colors });
            groups[roleOrder[i]] = f.paths;
        });

        // 像素 → 家族投票 → 48 環 zoneMap
        const img = new Image();
        img.onload = () => {
            const S = 384, NZ = 48;
            const c = document.createElement('canvas'); c.width = c.height = S;
            const g = c.getContext('2d');
            g.drawImage(img, 0, 0, S, S);
            const d = g.getImageData(0, 0, S, S).data;
            const zoneCnt = Array.from({ length: NZ }, () => new Array(famRoles.length).fill(0));
            for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
                const i = (y * S + x) * 4;
                const px = [d[i], d[i + 1], d[i + 2]];
                let fi = -1;
                for (let k = 0; k < famRoles.length; k++) {
                    if (famRoles[k].colors.some(cc => rgbDist(cc, px) < 70)) { fi = k; break; }
                }
                if (fi < 0) continue;
                const f = Math.hypot(x - S / 2, y - S / 2) / (S / 2);
                if (f < 1) zoneCnt[Math.floor(f * NZ)][fi]++;
            }
            // 派料夠顯著就贏（醬料底塊通常鋪滿全盤）；補洞＋去孤島
            zoneMap = zoneCnt.map(cnts => {
                const total = cnts.reduce((a, b) => a + b, 0);
                if (!total) return null;
                let ti = -1, tn = 0;
                for (let k = 1; k < cnts.length; k++) { if (cnts[k] > tn) { tn = cnts[k]; ti = k; } }
                if (ti > 0 && tn >= Math.max(5, total * 0.06)) return famRoles[ti].role;
                return cnts[0] >= 4 ? famRoles[0].role : null;
            });
            for (let i = 0; i < NZ; i++) {
                if (zoneMap[i] !== null) continue;
                let l = i - 1; while (l >= 0 && zoneMap[l] === null) l--;
                let r = i + 1; while (r < NZ && zoneMap[r] === null) r++;
                if (l >= 0 && r < NZ && zoneMap[l] === zoneMap[r]) zoneMap[i] = zoneMap[l];
            }
            for (let i = 1; i < NZ - 1; i++) {
                if (zoneMap[i - 1] === zoneMap[i + 1] && zoneMap[i] !== zoneMap[i - 1]) zoneMap[i] = zoneMap[i - 1];
            }
            recolor();
            URL.revokeObjectURL(img.src);
            if (onZones) onZones();
            if (done) done();
        };
        img.onerror = () => { zoneMap = []; recolor(); if (onZones) onZones(); if (done) done(); };
        img.src = URL.createObjectURL(new Blob([txt], { type: 'image/svg+xml' }));
    }

    /** 載入並顯示織圖；zoneMap 建好後呼叫 done（快取後仍會重跑上色與回呼） */
    function load(key, order, done) {
        if (order) curOrder = order;
        currentKey = key;
        if (!box) box = document.getElementById('chartBox');
        const inject = txt => {
            if (currentKey !== key) return;      // 已被更晚的選擇蓋掉
            box.innerHTML = txt;
            const svg = box.querySelector('svg');
            svg.removeAttribute('width'); svg.removeAttribute('height');
            // 只刷白「滿版背景 rect」；角色區塊若畫成 rect（如 032 旋轉方形醬料）不能動
            const vb = svg.viewBox.baseVal;
            // 滿版背景 rect 設透明（不刷白）→ 織圖直接融入卡片／收藏卡底色，不再有白方塊
            svg.querySelectorAll('rect').forEach(r => { if (isBgRect(r, vb)) r.setAttribute('fill', 'none'); });
            analyze(txt, key, svg, done);
        };
        if (cache[key]) return inject(cache[key]);
        fetch('crochet_library/' + PC.config.PATTERNS[key].file)
            .then(r => r.text())
            .then(txt => { cache[key] = txt; inject(txt); })
            .catch(() => {
                box.innerHTML = '<em style="font-size:12px;color:#a08b78;padding:8px;display:block">織圖載入失敗（需 http 服務）</em>';
                zoneMap = [];
                if (onZones) onZones();
                if (done) done();
            });
    }

    return {
        load, recolor, roleColor, lighten,
        zoneMap: () => zoneMap,
        set onZones(fn) { onZones = fn; },
        get order() { return curOrder; }
    };
})();
