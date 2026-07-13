/* ============================================================
   3D 場景：SceneManager（燈光/桌面/相機/迴圈）＋ PlateRig（一盤一實例）
   幾何與材質移植自 POC v5.9（針目拱形、真實毛線貼圖、鉤織配料）
   新增：雙盤佈局、上醬飽和度染色、配料分批掉落、鍵盤數字標記
   ============================================================ */
window.PC = window.PC || {};

(function () {
    const YARN_R = 0.26;
    const TUBE_SEGS = 5200;          // 每拱 ~10 管段
    const PATH_STEPS = 5600;
    const YARN_TEX_REPEAT = 90;      // 真實毛線貼圖沿線 repeat
    const YARN_TILE_ASPECT = 408 / 112;
    const TOP_R = .095;              // 配料統一線徑
    const SAUCE_MIN_TINT = 0.35;     // 上醬前的淡色比例（織到一半＝還沒吸醬）

    // ---------- 程序化貼圖（fallback）＋真實毛線貼圖中心 ----------
    function yarnTexture() {
        const c = document.createElement('canvas'); c.width = 128; c.height = 128;
        const g = c.getContext('2d');
        g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
        g.lineCap = 'round';
        for (const [y0, dir] of [[0, 1], [64, -1]]) {
            for (let i = -2; i < 8; i++) {
                g.strokeStyle = 'rgba(80,52,34,.38)'; g.lineWidth = 13;
                g.beginPath(); g.moveTo(i * 22 - 12 * dir, y0 + 70); g.lineTo(i * 22 + 26 + 12 * dir, y0 - 6); g.stroke();
                g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 6;
                g.beginPath(); g.moveTo(i * 22 - 4 * dir, y0 + 70); g.lineTo(i * 22 + 34 + 4 * dir, y0 - 6); g.stroke();
            }
            for (let f = 0; f < 46; f++) {
                const x0 = Math.random() * 150 - 10, y1 = y0 + Math.random() * 64;
                const len = 8 + Math.random() * 18;
                g.strokeStyle = Math.random() < .5 ? 'rgba(90,60,40,.18)' : 'rgba(255,255,255,.25)';
                g.lineWidth = .8;
                g.beginPath(); g.moveTo(x0, y1 + len * .55);
                g.lineTo(x0 + len * .5 * dir, y1 - len * .55); g.stroke();
            }
        }
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        return t;
    }

    // 真實毛線貼圖載入後，統一替換所有已註冊材質（麵條 repeat 90、配料按線徑換算）
    const TexHub = {
        twist: yarnTexture(),
        real: { color: null, bump: null },
        noodleMats: new Set(),           // mat（repeat 90）
        topMats: new Set(),              // { mat, rep }
        regNoodle(mat) { this.noodleMats.add(mat); this._applyNoodle(mat); },
        regTop(entry) { this.topMats.add(entry); this._applyTop(entry); return entry; },
        unregTops(entries) { entries.forEach(e => this.topMats.delete(e)); },
        _applyNoodle(mat) {
            if (this.real.color) {
                const t = this.real.color.clone(); t.needsUpdate = true; t.repeat.set(YARN_TEX_REPEAT, 1);
                mat.map = t;
            }
            if (this.real.bump) {
                const t = this.real.bump.clone(); t.needsUpdate = true; t.repeat.set(YARN_TEX_REPEAT, 1);
                mat.bumpMap = t; mat.bumpScale = .35;
            }
            mat.needsUpdate = true;
        },
        _applyTop(e) {
            const rep = Math.max(2, Math.round(e.rep / YARN_TILE_ASPECT));
            if (this.real.color) {
                const t = this.real.color.clone(); t.needsUpdate = true; t.repeat.set(rep, 1);
                e.mat.map = t;
            }
            if (this.real.bump) {
                const t = this.real.bump.clone(); t.needsUpdate = true; t.repeat.set(rep, 1);
                e.mat.bumpMap = t; e.mat.bumpScale = .35;
            }
            e.mat.needsUpdate = true;
        },
        load() {
            const ld = new THREE.TextureLoader();
            ld.load('assets/yarn_color.png', tex => {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.colorSpace = THREE.SRGBColorSpace;
                this.real.color = tex;
                this.noodleMats.forEach(m => this._applyNoodle(m));
                this.topMats.forEach(e => this._applyTop(e));
            });
            ld.load('assets/yarn_bump.png', tex => {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                this.real.bump = tex;
                this.noodleMats.forEach(m => this._applyNoodle(m));
                this.topMats.forEach(e => this._applyTop(e));
            });
        }
    };

    // ---------- 麵形路徑（針目拱形 v5.8）----------
    function buildPath(sh) {
        const pts = [];
        for (let i = 0; i <= PATH_STEPS; i++) {
            const t = i / PATH_STEPS;
            const theta = t * sh.rounds * Math.PI * 2;
            const to = sh.petalTo ?? 1;
            const band = t < sh.petalFrom ? 0 : (t > to ? Math.max(0, 1 - (t - to) / 0.12) : Math.pow((t - sh.petalFrom) / (to - sh.petalFrom), 1.2));
            const s = Math.cos(sh.sym * theta);
            // lobePow <1 瓣頭越圓潤；notch = 瓣尖中央小缺口深度（櫻花分叉），notchPow 控制缺口寬窄
            const lobe = s >= 0 ? Math.pow(s, sh.lobePow ?? 1.3) : -(sh.dipRatio ?? .5) * Math.pow(-s, 1.3);
            const notch = (sh.notch ?? 0) * Math.pow(Math.max(0, s), sh.notchPow ?? 22);
            const petal = (lobe - notch) * sh.petalAmp * band;
            // 輪廓倍率 m(θ)：只依角度，每圈同角度一致 → 不會圈交叉。從外圈漸入（中心維持圓）。
            let m = 1;
            const blend = Math.min(1, Math.max(0, (t - (sh.outlineFrom ?? 0.45)) / 0.35));
            if (sh.outline === 'square') {
                const p = 4, cs = Math.abs(Math.cos(theta)), sn = Math.abs(Math.sin(theta));
                const sq = Math.pow(Math.pow(cs, p) + Math.pow(sn, p), -1 / p);
                m = (1 + (sq - 1) * blend) * 0.92;
            } else if (sh.outline === 'diamond') {
                // 菱形＝旋轉 45° 的方形；角在軸向(上下左右)，邊在對角線
                const cs = Math.abs(Math.cos(theta)), sn = Math.abs(Math.sin(theta));
                const dia = 1 / (cs + sn);                     // 1(角) ~ 0.707(邊)
                m = 1 + (dia - 1) * blend;
            } else if (sh.outline === 'star') {
                // N 角星：三角波做尖角，inner＝內外半徑比（越小角越尖）
                const N = sh.points ?? 6, inner = sh.inner ?? 0.5;
                const seg = Math.PI * 2 / N;
                const phi = ((theta % seg) + seg) % seg;
                const tri = 1 - Math.abs(1 - phi / (seg / 2));  // 0(凹) ~ 1(尖)
                const star = inner + (1 - inner) * tri;         // inner ~ 1
                m = 1 + (star - 1) * blend;
            } else if (sh.outline === 'polygon') {
                // 正 N 邊形：頂點在 0,seg,2seg...（phase 可轉向）；直邊
                const N = sh.sides ?? 6, seg = Math.PI * 2 / N;
                const phi = (((theta - (sh.phase ?? 0)) % seg) + seg) % seg;
                const poly = Math.cos(Math.PI / N) / Math.cos(phi - seg / 2);  // cos(π/N)(邊) ~ 1(角)
                m = 1 + (poly - 1) * blend;
            }
            const ARCH_N = 30;
            const arch = Math.abs(Math.sin(ARCH_N / 2 * theta));
            const r = (1.4 + sh.rMax * t) * m + petal + 0.10 * Math.sin(ARCH_N * theta);
            const y = 0.80 + 0.55 * Math.pow(arch, 1.3);
            pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
        }
        return new THREE.CatmullRomCurve3(pts);
    }

    // ---------- 鉤織配料模型（POC v5.9）----------
    function topYarnMat(color, len, r, entries) {
        const map = TexHub.twist.clone(); map.needsUpdate = true;
        const rep = Math.max(3, Math.round(len / (Math.PI * 2 * r)));
        map.repeat.set(rep, 1);
        const mat = new THREE.MeshStandardMaterial({ color, map, bumpMap: map, bumpScale: .4, roughness: .82 });
        entries.push(TexHub.regTop({ mat, rep }));
        return mat;
    }
    function yarnTube(pts, r, color, entries, closed = false) {
        const cv = new THREE.CatmullRomCurve3(pts, closed);
        const len = cv.getLength();
        const m = new THREE.Mesh(
            new THREE.TubeGeometry(cv, Math.max(24, Math.round(len * 10)), r, 8, closed),
            topYarnMat(color, len, r, entries));
        m.castShadow = true;
        return m;
    }
    function spiralPts(R, rounds, t0, t1, ellip = 1) {
        const pts = [], n = Math.max(10, Math.round((t1 - t0) * rounds * 44));
        for (let i = 0; i <= n; i++) {
            const t = t0 + (t1 - t0) * i / n, th = t * rounds * Math.PI * 2;
            const rad = R * (.07 + .93 * t);
            pts.push(new THREE.Vector3(rad * Math.cos(th), .05 * Math.abs(Math.sin(th * 7)), rad * Math.sin(th) * ellip));
        }
        return pts;
    }
    function ballPts(R, turns, a0, a1, squash = 1) {
        const pts = [], n = Math.round(turns * 26);
        for (let i = 0; i <= n; i++) {
            const t = i / n, a = a0 + (a1 - a0) * t, th = t * turns * Math.PI * 2;
            pts.push(new THREE.Vector3(R * Math.sin(a) * Math.cos(th), R * Math.cos(a) * squash, R * Math.sin(a) * Math.sin(th)));
        }
        return pts;
    }
    function ringPts(R) { const p = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; p.push(new THREE.Vector3(R * Math.cos(a), 0, R * Math.sin(a))); } return p; }
    function coilPts(R, h, turns) {
        const p = [], n = Math.round(turns * 22);
        for (let i = 0; i <= n; i++) { const t = i / n, a = t * turns * Math.PI * 2; p.push(new THREE.Vector3(R * Math.cos(a), t * h, R * Math.sin(a))); }
        return p;
    }
    function squarePts(R, rounds) {
        const pts = [], n = Math.round(rounds * 60);
        for (let i = 0; i <= n; i++) {
            const t = i / n, th = t * rounds * Math.PI * 2;
            const sq = Math.pow(Math.pow(Math.abs(Math.cos(th)), 5) + Math.pow(Math.abs(Math.sin(th)), 5), -1 / 5);
            const rad = R * (.08 + .92 * t) * sq;
            pts.push(new THREE.Vector3(rad * Math.cos(th), .05 * Math.abs(Math.sin(th * 7)), rad * Math.sin(th)));
        }
        return pts;
    }
    const MUSH_CAP = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 10; MUSH_CAP.push([Math.cos(a) * 1.02, Math.sin(a) * .95 + .12]); }
    const MUSH_STEM = [[-1.02, .12], [-.58, .04], [-.4, -.3], [-.5, -.62], [0, -.76], [.5, -.62], [.4, -.3], [.58, .04], [1.02, .12]];
    const mushV = (p, s) => new THREE.Vector3(p[0] * s, 0, (p[1] - .14) * s);

    const topBuilders = {
        tomato(e) {
            const g = new THREE.Group(), R = 1.05, N = 5;
            g.add(yarnTube(spiralPts(R, N, 0, .4), TOP_R, '#f0956a', e),
                yarnTube(spiralPts(R, N, .4, .87), TOP_R, '#dd5138', e),
                yarnTube(spiralPts(R, N, .87, 1), TOP_R, '#a93524', e));
            return g;
        },
        cheese(e) {
            const g = new THREE.Group();
            g.add(yarnTube(squarePts(.82, 4), TOP_R, '#f2cf72', e));
            [-.32, .32].forEach(x => {
                const h = yarnTube(ringPts(.22), TOP_R, '#d3a441', e, true);
                h.position.set(x, .12, 0); g.add(h);
            });
            return g;
        },
        basil(e) {
            const g = new THREE.Group();
            const leaf = yarnTube(spiralPts(.85, 5, 0, 1, .68), TOP_R, '#55823c', e);
            leaf.rotation.z = .18;
            const stem = yarnTube([new THREE.Vector3(.8, 0, 0), new THREE.Vector3(1.1, .06, .1), new THREE.Vector3(1.3, .02, .22)], TOP_R, '#3f6a2e', e);
            g.add(leaf, stem);
            return g;
        },
        bacon(e) {
            const g = new THREE.Group(), colors = ['#9c4038', '#bd5347', '#f4e4cc', '#bd5347', '#9c4038'];
            colors.forEach((c, row) => {
                const pts = []; for (let i = 0; i <= 48; i++) {
                    const x = -2.3 + 4.6 * i / 48;
                    pts.push(new THREE.Vector3(x, .32 + .3 * Math.sin(x * 1.9), (row - 2) * .2));
                }
                g.add(yarnTube(pts, TOP_R, c, e));
            });
            return g;
        },
        mushroom(e) {
            const g = new THREE.Group();
            g.add(yarnTube(MUSH_CAP.map(p => mushV(p, 1)), TOP_R, '#c99e6f', e));
            g.add(yarnTube(MUSH_STEM.map(p => mushV(p, 1)), TOP_R, '#f3e6d0', e));
            const full = MUSH_CAP.concat(MUSH_STEM.slice(1, -1));
            [.85, .7, .55, .4, .25].forEach(s => g.add(yarnTube(full.map(p => mushV(p, s)), TOP_R, '#f3e6d0', e, true)));
            return g;
        },
        broccoli(e) {
            const inner = new THREE.Group();
            const BR = .07;
            inner.add(yarnTube(coilPts(.44, 1.0, 6), BR, '#a9bf76', e));
            [[0, 1.9, 0, 1.1, '#57843a'], [1.0, 1.4, .56, .9, '#4f7c35'], [-.92, 1.36, -.6, .84, '#619340']].forEach(([x, y, z, R, c]) => {
                const tn = Math.round(Math.PI * R / (BR * 2.1));
                const b = yarnTube(ballPts(R, tn, .25, 2.85), BR, c, e);
                b.position.set(x, y, z); inner.add(b);
            });
            inner.rotation.x = Math.PI / 2;
            const g = new THREE.Group(); g.add(inner);
            g.updateMatrixWorld(true);
            const bb = new THREE.Box3().setFromObject(inner);
            inner.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
            return g;
        },
        // ↓ 新配料：3D 顏色由 config 的 color 推導（改 config 即同步 3D）
        blueberry(e) {
            const base = PC.config.TOPPINGS.blueberry.color;
            const dark = shadeHex(base, -.4);
            const g = new THREE.Group();
            const ball = yarnTube(ballPts(.6, 7, .18, 2.98), TOP_R, base, e, true);
            ball.position.y = .58; g.add(ball);                       // 抬起讓底部貼盤
            const crown = yarnTube(ringPts(.16), TOP_R, dark, e, true);
            crown.position.y = 1.12; g.add(crown);                    // 頂端花萼小星冠
            return g;
        },
        squid(e) {
            const base = PC.config.TOPPINGS.squid.color;
            const g = new THREE.Group();
            // 魷魚圈＝兩圈同心毛線環（本體就是「圈」）
            g.add(yarnTube(ringPts(1.0), TOP_R, base, e, true));
            g.add(yarnTube(ringPts(.72), TOP_R, shadeHex(base, -.12), e, true));
            return g;
        },
        caviar(e) {
            const base = PC.config.TOPPINGS.caviar.color;
            const shades = [base, shadeHex(base, .25), shadeHex(base, -.3)];
            const g = new THREE.Group();
            // 一小堆黑色魚卵（多顆小球）
            const spots = [[0, 0, .3], [.36, .12, .26], [-.32, .18, .24], [.14, -.34, .22], [-.18, -.06, .2], [.06, .22, .19]];
            spots.forEach((s, i) => {
                const b = yarnTube(ballPts(s[2], 5, .2, 2.94), TOP_R * .78, shades[i % 3], e, true);
                b.position.set(s[0], s[2], s[1]); g.add(b);
            });
            return g;
        }
    };
    // 由基色調亮(k>0)/調暗(k<0)
    function shadeHex(hex, k) {
        return '#' + new THREE.Color(hex).lerp(new THREE.Color(k >= 0 ? '#ffffff' : '#000000'), Math.abs(k)).getHexString();
    }
    function randTopSize(key) {
        return key === 'basil' ? .55 + Math.random() * 1.0 : .85 + Math.random() * .3;
    }

    // ---------- 勾針（人體工學紡錘：木紋工作桿＋薄荷綠握把）----------
    let hookTex = null;
    function makeHook() {
        if (!hookTex) {
            hookTex = new THREE.TextureLoader().load('assets/hook_wrap.png', t => {
                t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
                t.flipY = false;
                t.wrapS = THREE.RepeatWrapping; t.needsUpdate = true;
            });
        }
        const hook = new THREE.Group();
        const hookProfile = [
            [.05, 0], [.10, .35], [.13, .8], [.16, 1.4], [.19, 2.0], [.23, 2.7], [.28, 3.4], [.36, 4.1],
            [.46, 4.9], [.54, 5.7], [.57, 6.3], [.54, 7.0], [.45, 7.7], [.33, 8.3], [.20, 8.8], [.08, 9.2], [.02, 9.4]
        ].map(p => new THREE.Vector2(p[0], p[1]));
        hook.add(new THREE.Mesh(
            new THREE.LatheGeometry(hookProfile, 28),
            new THREE.MeshStandardMaterial({ map: hookTex, roughness: .5 })));
        const woodMat = new THREE.MeshStandardMaterial({ color: '#c69f6d', roughness: .5 });
        const hookPath = new THREE.CatmullRomCurve3([
            [0, .55, 0], [0, .1, 0], [0, -.16, 0], [.055, -.34, 0], [.185, -.32, 0], [.245, -.15, 0], [.185, -.005, 0], [.12, .045, 0]
        ].map(a => new THREE.Vector3(...a)));
        const barb = new THREE.Mesh(new THREE.TubeGeometry(hookPath, 56, .072, 14), woodMat);
        const tEnd = hookPath.getTangentAt(1), pEnd = hookPath.getPointAt(1);
        const beak = new THREE.Mesh(new THREE.ConeGeometry(.072, .17, 12), woodMat);
        beak.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tEnd);
        beak.position.copy(pEnd).addScaledVector(tEnd, .075);
        hook.add(barb, beak);
        hook.traverse(o => o.castShadow = true);
        hook.rotation.z = -0.45;
        hook.scale.setScalar(1.18);
        return hook;
    }

    // ---------- 毛線蛋糕（收納捲）----------
    const cakeCoreMat = new THREE.MeshStandardMaterial({ color: '#efe9dd', roughness: .92 });
    const cakeLd = new THREE.TextureLoader();
    const cakeCol = cakeLd.load('assets/yarn_color.png', t => { t.colorSpace = THREE.SRGBColorSpace; });
    const cakeBmp = cakeLd.load('assets/yarn_bump.png');
    [cakeCol, cakeBmp].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1100, 1); });
    const CAKE_R = 2.5, CAKE_H = 7.2;
    let cakeRepSet = false;
    function makeYarnCake(refCurveLen) {
        const grp = new THREE.Group();
        grp.add(new THREE.Mesh(new THREE.CylinderGeometry(CAKE_R * 0.9, CAKE_R * 0.9, CAKE_H, 40), cakeCoreMat));
        const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .85, map: cakeCol, bumpMap: cakeBmp, bumpScale: .5 });
        const Hh = CAKE_H / 2 - YARN_R;
        const mkHelix = dir => {
            const pts = [], wraps = 19, N = 1600;
            for (let i = 0; i <= N; i++) {
                const t = i / N, a = dir * t * wraps * Math.PI * 2, y = -Hh + 2 * Hh * t;
                pts.push(new THREE.Vector3(CAKE_R * Math.cos(a), y, CAKE_R * Math.sin(a)));
            }
            return new THREE.CatmullRomCurve3(pts);
        };
        const h1 = mkHelix(1), h2 = mkHelix(-1);
        if (!cakeRepSet && refCurveLen) {
            const rep = Math.max(1, Math.round(YARN_TEX_REPEAT * h1.getLength() / refCurveLen));
            cakeCol.repeat.set(rep, 1); cakeBmp.repeat.set(rep, 1);
            cakeRepSet = true;
        }
        grp.add(new THREE.Mesh(new THREE.TubeGeometry(h1, 1600, YARN_R, 7, false), mat));
        grp.add(new THREE.Mesh(new THREE.TubeGeometry(h2, 1600, YARN_R, 7, false), mat));
        grp.userData.mat = mat;
        grp.traverse(o => o.castShadow = true);
        return grp;
    }

    // ---------- 鍵盤數字徽章貼圖（1~5 快取）----------
    const badgeTexCache = {};
    function badgeTex(num) {
        if (badgeTexCache[num]) return badgeTexCache[num];
        const c = document.createElement('canvas'); c.width = c.height = 96;
        const g = c.getContext('2d');
        g.beginPath(); g.arc(48, 48, 42, 0, Math.PI * 2);
        g.fillStyle = '#4a3b32'; g.fill();
        g.lineWidth = 6; g.strokeStyle = '#fffaf2'; g.stroke();
        g.fillStyle = '#fffaf2'; g.font = '700 52px "Segoe UI", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(String(num), 48, 51);
        const t = new THREE.CanvasTexture(c);
        badgeTexCache[num] = t;
        return t;
    }

    function disposeTree(root) {
        root.traverse(o => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) [].concat(o.material).forEach(m => {
                if (m.map && m.map !== TexHub.twist) m.map.dispose();
                if (m.bumpMap && m.bumpMap !== TexHub.twist && m.bumpMap !== m.map) m.bumpMap.dispose();
                m.dispose();
            });
        });
    }

    // ============================================================
    // PlateRig：一個盤位（盤、麵、勾針、配料、毛線蛋糕、針目標記）
    // ============================================================
    class PlateRig {
        constructor(mgr, x) {
            this.mgr = mgr;
            this.root = new THREE.Group();
            this.root.position.x = x;
            mgr.scene.add(this.root);

            // 盤
            const plateProfile = [
                new THREE.Vector2(0, 0.15), new THREE.Vector2(9.5, 0.35),
                new THREE.Vector2(12.2, 0.9), new THREE.Vector2(13.6, 1.5), new THREE.Vector2(13.9, 1.45)
            ];
            const plate = new THREE.Mesh(
                new THREE.LatheGeometry(plateProfile, 64),
                new THREE.MeshStandardMaterial({ color: '#fffaf0', roughness: .45, side: THREE.DoubleSide }));
            plate.receiveShadow = true;
            this.root.add(plate);
            // 接觸陰影
            const sc = document.createElement('canvas'); sc.width = sc.height = 128;
            const sg = sc.getContext('2d');
            const rg = sg.createRadialGradient(64, 64, 8, 64, 64, 62);
            rg.addColorStop(0, 'rgba(60,40,25,.5)'); rg.addColorStop(1, 'rgba(60,40,25,0)');
            sg.fillStyle = rg; sg.fillRect(0, 0, 128, 128);
            const blob = new THREE.Mesh(new THREE.PlaneGeometry(22, 22),
                new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, opacity: .5, depthWrite: false }));
            blob.rotation.x = -Math.PI / 2; blob.position.y = 0.42;
            this.root.add(blob);

            // 麵條材質（頂點色分區；material.color 留給燒焦乘暗）
            this.yarnMat = new THREE.MeshStandardMaterial({
                color: '#ffffff', roughness: .78,
                map: TexHub.twist, bumpMap: TexHub.twist, bumpScale: .5, vertexColors: true
            });
            this.tipMat = new THREE.MeshStandardMaterial({
                color: '#d96b47', roughness: .78,
                map: TexHub.twist, bumpMap: TexHub.twist, bumpScale: .5
            });
            TexHub.regNoodle(this.yarnMat);
            TexHub.regNoodle(this.tipMat);

            this.patternKey = null;
            this.curve = null; this.tubeGeo = null; this.totalIndex = 0; this.ringRadii = [];
            this.noodle = new THREE.Mesh(new THREE.BufferGeometry(), this.yarnMat);
            this.noodle.castShadow = true; this.noodle.visible = false;
            this.root.add(this.noodle);
            this.tip = new THREE.Mesh(new THREE.SphereGeometry(YARN_R, 12, 10), this.tipMat);
            this.tip.castShadow = true; this.tip.visible = false;
            this.root.add(this.tip);

            this.hook = makeHook();
            this.root.add(this.hook);

            // 針目標記（進度環＋白點＋隱形命中球＋鍵盤徽章）
            // 進度環＝canvas 即時繪製：外圈掃滿一圈＝該點時間窗、綠色扇區＝完美時間帶
            this.marker = new THREE.Group();
            this._ringCvs = document.createElement('canvas');
            this._ringCvs.width = this._ringCvs.height = 128;
            this._ringCtx = this._ringCvs.getContext('2d');
            this._ringTex = new THREE.CanvasTexture(this._ringCvs);
            // depthTest:false＋renderOrder → 標記永遠畫在麵體上層，不會被針目拱形擋住
            this.mkRing = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4),
                new THREE.MeshBasicMaterial({ map: this._ringTex, transparent: true, depthWrite: false, depthTest: false }));
            this.mkRing.rotation.x = -Math.PI / 2;
            this.mkRing.position.y = .12;
            this.mkRing.renderOrder = 10;
            this.mkDot = new THREE.Mesh(new THREE.SphereGeometry(.26, 10, 10),
                new THREE.MeshBasicMaterial({ color: '#b5502f', depthTest: false }));
            this.mkDot.renderOrder = 11;
            this.mkHit = new THREE.Mesh(new THREE.SphereGeometry(1.7, 8, 8),
                new THREE.MeshBasicMaterial({ visible: false }));
            this.badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex(1), depthTest: false }));
            this.badge.renderOrder = 12;
            this.badge.scale.setScalar(2.3);
            this.badge.position.y = 2.4;
            this.badge.visible = false;
            this.marker.add(this.mkRing, this.mkDot, this.mkHit, this.badge);
            this.marker.visible = false;
            this.root.add(this.marker);

            // 毛線蛋糕 ×3（醬料、配料1、配料2 的線色）
            this.yarnBalls = [];
            const spots = [[14, 3.6, 15], [19.5, 3.6, 11], [11.5, 3.6, 19.5]];

            // 配料實例（依訂單建立）
            this.topGroup = new THREE.Group();
            this.root.add(this.topGroup);
            this.topInstances = [[], []];
            this.topEntries = [];
            this._ballSpots = spots;

            // 狀態
            this.order = null;
            this.progress = 0.02; this.targetProgress = 0.02;
            this.sauceLevel = 0;
            this.cooking = false;
            this.growSpeed = 0.6;
        }

        // 蛋糕需要 curve 長度校準貼圖密度，所以在第一次 setPattern 後建
        _ensureCakes() {
            if (this.yarnBalls.length) return;
            for (let i = 0; i < 3; i++) {
                const m = makeYarnCake(this.curve ? this.curve.getLength() : 520);
                m.position.set(...this._ballSpots[i]);
                m.rotation.y = Math.random() * Math.PI * 2;
                this.root.add(m); this.yarnBalls.push(m);
            }
        }

        setPattern(key) {
            if (this.patternKey === key && this.tubeGeo) return;
            this.patternKey = key;
            this.curve = buildPath(PC.config.PATTERNS[key].shape);
            const g = new THREE.TubeGeometry(this.curve, TUBE_SEGS, YARN_R, 10, false);
            if (this.tubeGeo) this.tubeGeo.dispose();
            this.tubeGeo = g;
            this.noodle.geometry = g;
            this.totalIndex = g.index.count;
            this._buildRingRadii();
            this._ensureCakes();
            this.rebuildColors();
            this.applyProgress(this.progress);
        }

        setOrder(order) {
            this.order = order;
            this.yarnMat.roughness = PC.config.SAUCES[order.sauce].rough;
            this.tipMat.roughness = PC.config.SAUCES[order.sauce].rough;
            this._rebuildToppings();
            this._updateYarnBalls();
            this.rebuildColors();
        }

        _rebuildToppings() {
            // 清掉舊配料
            TexHub.unregTops(this.topEntries);
            this.topEntries = [];
            disposeTree(this.topGroup);
            this.topGroup.clear();
            this.topInstances = [[], []];
            if (!this.order) return;
            this.order.tops.forEach((key, slot) => {
                const def = PC.config.TOPPINGS[key];
                for (let i = 0; i < def.n; i++) {
                    const m = topBuilders[key](this.topEntries);
                    m.scale.setScalar(0.001);
                    m.traverse(o => o.castShadow = true);
                    const a = Math.random() * Math.PI * 2, r = 1.2 + Math.random() * 6.4;
                    m.position.set(r * Math.cos(a), 9, r * Math.sin(a));
                    m.rotation.y = Math.random() * Math.PI * 2;
                    m.userData = { size: randTopSize(key), targetY: 1.7 + Math.random() * .25, t: -1, dropped: false };
                    this.topGroup.add(m);
                    this.topInstances[slot].push(m);
                }
            });
        }

        _updateYarnBalls() {
            if (!this.yarnBalls.length || !this.order) return;
            const C = PC.config;
            this.yarnBalls[0].userData.mat.color.set(C.SAUCES[this.order.sauce].color);
            this.yarnBalls[1].userData.mat.color.set(C.TOPPINGS[this.order.tops[0]].color);
            this.yarnBalls[2].userData.mat.color.set(C.TOPPINGS[this.order.tops[1]].color);
        }

        _buildRingRadii() {
            let mn = Infinity, mx = 0;
            const raw = [];
            for (let i = 0; i <= TUBE_SEGS; i++) {
                const p = this.curve.getPointAt(i / TUBE_SEGS);
                const r = Math.hypot(p.x, p.z);
                raw.push(r); mn = Math.min(mn, r); mx = Math.max(mx, r);
            }
            this.ringRadii = raw.map(r => (r - mn) / (mx - mn));
        }

        // 半徑 → 訂單角色顏色（zoneMap 來自 charts）
        colorAtFrac(f) {
            const zm = PC.charts.zoneMap();
            let role = null;
            if (zm.length) role = zm[Math.min(zm.length - 1, Math.floor(f * zm.length))];
            return new THREE.Color(PC.charts.roleColor(role || 'sauce', this.order));
        }
        // 上醬程度：0＝淡色線（沒吸醬）→ 1＝全色
        _tint(c) {
            const k = SAUCE_MIN_TINT + (1 - SAUCE_MIN_TINT) * this.sauceLevel;
            return new THREE.Color('#ffffff').lerp(c, k);
        }
        rebuildColors() {
            if (!this.ringRadii.length || !this.tubeGeo) return;
            const geo = this.tubeGeo;
            const count = geo.attributes.position.count;
            const rings = this.ringRadii.length;
            const perRing = count / rings;
            let colors = geo.attributes.color;
            if (!colors || colors.count !== count) {
                colors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
                geo.setAttribute('color', colors);
            }
            for (let i = 0; i < rings; i++) {
                const cc = this._tint(this.colorAtFrac(this.ringRadii[i]));
                for (let j = 0; j < perRing; j++) colors.setXYZ(i * perRing + j, cc.r, cc.g, cc.b);
            }
            colors.needsUpdate = true;
            this._tintTip();
        }
        _tintTip() {
            if (!this.ringRadii.length) return;
            const f = this.ringRadii[Math.min(this.ringRadii.length - 1, Math.floor(this.progress * (this.ringRadii.length - 1)))];
            const c = this._tint(this.colorAtFrac(f));
            if (this._burnK) c.lerp(new THREE.Color('#4a3226'), this._burnK * .85);
            this.tipMat.color.copy(c);
        }

        setSauceLevel(k) {
            this.sauceLevel = Math.min(1, Math.max(0, k));
            this.rebuildColors();
        }

        applyProgress(p) {
            if (!this.tubeGeo) return;
            this.progress = Math.min(1, Math.max(0.02, p));
            this.tubeGeo.setDrawRange(0, Math.floor(this.totalIndex * this.progress / 6) * 6);
            const pt = this.curve.getPointAt(this.progress);
            this.tip.position.copy(pt);
            this.hook.position.copy(pt); this.hook.position.y += .1;
            this._tintTip();
        }
        setProgressTarget(p) { this.targetProgress = Math.min(1, Math.max(0.02, p)); }

        beginCook() {
            this.cooking = true;
            this.noodle.visible = true; this.tip.visible = true;
            this.progress = 0.02; this.targetProgress = 0.02;
            this.sauceLevel = 0;
            this.setBurn(0);
            this.rebuildColors();
            this.applyProgress(0.02);
        }
        endCook() { this.cooking = false; this.showMarkerFor(null); }

        setBurn(k) {
            this._burnK = k;
            this.yarnMat.color.set('#ffffff').lerp(new THREE.Color('#4a3226'), k * .85);
            this._tintTip();
        }

        dropBatch(slot, from, count) {
            const list = this.topInstances[slot] || [];
            for (let i = from; i < Math.min(from + count, list.length); i++) {
                const m = list[i];
                if (m.userData.dropped) continue;
                m.userData.dropped = true;
                m.userData.t = -(i - from) * 0.14;   // 批次內小交錯
            }
            PC.audio.play('sfx_topping_drop', { rate: .9 + Math.random() * .25 });
        }

        markerPosForDot(dot) {
            const v = new THREE.Vector3();
            if (!this.curve) return v;
            if (dot.type === 'pattern') { v.copy(this.curve.getPointAt(dot.prog)); v.y += .55; }
            else if (dot.type === 'sauce') { v.copy(this.curve.getPointAt(dot.frac)); v.y += .8; }
            else {
                const list = this.topInstances[dot.slot] || [];
                const seg = list.slice(dot.from, dot.from + dot.count);
                if (seg.length) {
                    seg.forEach(m => { v.x += m.position.x; v.z += m.position.z; });
                    v.x /= seg.length; v.z /= seg.length; v.y = 2.4;
                } else v.set(0, 2.4, 0);
            }
            return v;
        }

        showMarkerFor(dot, keyNum) {
            if (!dot) { this.marker.visible = false; return; }
            this.marker.position.copy(this.markerPosForDot(dot));
            this.marker.visible = true;
            const C = PC.config;
            const dotColor = dot.type === 'pattern' ? '#c96a4b'
                : dot.type === 'sauce' ? C.SAUCES[this.order.sauce].color
                : C.TOPPINGS[this.order.tops[dot.slot]].color;
            // 中心色點加深一階（畫在白底盤上更跳）
            this.mkDot.material.color.set(dotColor).lerp(new THREE.Color('#000000'), .18);
            this.setMarkerProgress(-1);   // 先畫底環＋完美帶
            if (keyNum) {
                this.badge.material.map = badgeTex(keyNum);
                this.badge.visible = true;
            } else this.badge.visible = false;
        }

        // 進度環：frac＝(當下時刻−窗開始)/窗長；<0 未輪到、0~1 掃進度（中段 PERFECT_FRAC＝完美帶）、>1 過窗
        // 白框＋投影＋加深色（v1.1 使用者回饋：原本容易和麵體混在一起）
        setMarkerProgress(frac) {
            const g = this._ringCtx, cx = 64, cy = 64, r = 44;
            const A = f => (f * 2 - .5) * Math.PI;   // f=0 → 12 點鐘方向，順時針
            const pf = PC.config.PERFECT_FRAC, p0 = .5 - pf / 2, p1 = .5 + pf / 2;
            g.clearRect(0, 0, 128, 128);
            g.lineCap = 'round';
            // 白框環＋陰影（底層）＋中心白底盤（3D 色點的白框）
            g.save();
            g.shadowColor = 'rgba(60,40,25,.5)'; g.shadowBlur = 7; g.shadowOffsetY = 3;
            g.lineWidth = 23; g.strokeStyle = '#fffaf2';
            g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
            g.fillStyle = '#fffaf2';
            g.beginPath(); g.arc(cx, cy, 17, 0, Math.PI * 2); g.fill();
            g.restore();
            g.lineWidth = 12;
            g.strokeStyle = 'rgba(62,47,38,.6)';     // 底環（加深）
            g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
            // 完美時間帶：更深綠外框＋更粗更亮的綠芯，和麵體、底環拉開對比
            g.lineWidth = 22; g.strokeStyle = '#124808';
            g.beginPath(); g.arc(cx, cy, r, A(p0), A(p1)); g.stroke();
            g.lineWidth = 13; g.strokeStyle = '#4fd21a';
            g.beginPath(); g.arc(cx, cy, r, A(p0), A(p1)); g.stroke();
            // 中心點：紅綠燈——綠＝就是現在、黃＝快進區了、紅＝過區/過熟
            let tl = null;
            if (frac > 1) tl = '#e0492f';                                 // 過窗 紅
            else if (frac > 0) {
                if (frac >= p0 && frac <= p1) tl = '#3fc514';             // 完美 綠
                else if (frac >= p0 - pf && frac < p0) tl = '#f4c020';    // 接近 黃
                else if (frac > p1) tl = '#e0492f';                       // 錯過 紅
            }
            if (tl) { g.fillStyle = tl; g.beginPath(); g.arc(cx, cy, 15, 0, Math.PI * 2); g.fill(); }
            if (frac > 1) {                          // 過窗：整圈轉紅脈動
                g.lineWidth = 12;
                g.strokeStyle = `rgba(138,58,46,${.55 + .35 * Math.sin(performance.now() * .012)})`;
                g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
            } else if (frac > 0) {                   // 掃進度＋指針點
                const inBand = frac >= p0 && frac <= p1;
                g.lineWidth = 6.5;
                g.strokeStyle = 'rgba(255,250,242,.95)';
                g.beginPath(); g.arc(cx, cy, r, A(0), A(frac)); g.stroke();
                const a = A(frac);
                g.fillStyle = inBand ? '#175a0a' : '#2e211a';
                g.beginPath(); g.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), inBand ? 11 : 9, 0, Math.PI * 2); g.fill();
            }
            this._ringTex.needsUpdate = true;
        }

        hitTest(x, y, camera, ray, ndc) {
            if (!this.marker.visible) return false;
            ndc.x = (x / innerWidth) * 2 - 1;
            ndc.y = -(y / innerHeight) * 2 + 1;
            ray.setFromCamera(ndc, camera);
            return ray.intersectObject(this.mkHit, false).length > 0;
        }

        markerScreen(camera) {
            const v = new THREE.Vector3();
            this.marker.getWorldPosition(v);
            v.project(camera);
            return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, visible: this.marker.visible };
        }

        // 選單背景用：直接端出一盤完成品
        demoPlate(order) {
            this.setOrder(order);
            this.beginCook();
            this.cooking = false;
            this.setProgressTarget(1);
            this.applyProgress(1);
            this.setSauceLevel(1);
            [0, 1].forEach(slot => this.dropBatch(slot, 0, this.topInstances[slot].length));
        }

        reset() {
            this.cooking = false;
            this.progress = 0.02; this.targetProgress = 0.02;
            this.sauceLevel = 0;
            this.setBurn(0);
            this.noodle.visible = false; this.tip.visible = false;
            this.showMarkerFor(null);
            this.applyProgress(0.02);
            this.topInstances.flat().forEach(m => {
                const u = m.userData;
                u.dropped = false; u.t = -1;
                m.scale.setScalar(.001);
                const a = Math.random() * Math.PI * 2, r = 1.2 + Math.random() * 6.4;
                m.position.set(r * Math.cos(a), 9, r * Math.sin(a));
            });
        }

        update(dt, now) {
            // 麵條生長
            if (this.progress < this.targetProgress)
                this.applyProgress(Math.min(this.targetProgress, this.progress + dt * this.growSpeed));
            // 勾針擺動
            if (this.cooking && this.curve) {
                const b = this.curve.getPointAt(this.progress);
                this.hook.position.set(b.x, b.y + .1 + .5 * Math.sin(now * .009), b.z);
                this.hook.rotation.z = -0.45 + .09 * Math.sin(now * .009 + 1);
            } else {
                this.hook.rotation.z = -0.45;
            }
            // 配料掉落
            this.topInstances.flat().forEach(m => {
                const u = m.userData;
                if (!u.dropped || u.t >= 1) return;
                u.t = Math.min(1, u.t + dt * 2.2);
                if (u.t <= 0) return;
                const e = 1 - Math.pow(1 - u.t, 3);
                m.position.y = 9 + (u.targetY - 9) * e;
                m.scale.setScalar(Math.max(.001, e * u.size));
            });
            // 標記微動畫
            if (this.marker.visible) {
                this.mkDot.position.y = 0.12 * Math.sin(now * 0.004);
            }
        }
    }

    // ============================================================
    // SceneManager：渲染器、相機軌道、佈局（單/雙盤）、主迴圈
    // ============================================================
    class SceneManager {
        constructor(container) {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color('#f3e6d5');
            this.scene.fog = new THREE.Fog('#f3e6d5', 85, 150);

            this.camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 260);
            this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
            this.renderer.setSize(innerWidth, innerHeight);
            this.renderer.setPixelRatio(Math.min(2, devicePixelRatio));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.08;
            container.appendChild(this.renderer.domElement);

            this.scene.add(new THREE.HemisphereLight('#fff4e0', '#a8896b', 0.85));
            const sun = new THREE.DirectionalLight('#fff5e8', 2.2);
            sun.position.set(-14, 26, 12);
            sun.castShadow = true;
            sun.shadow.mapSize.set(1024, 1024);
            Object.assign(sun.shadow.camera, { left: -36, right: 36, top: 36, bottom: -36, near: 5, far: 80 });
            this.scene.add(sun);
            const fill = new THREE.DirectionalLight('#ffe9d0', 0.5);
            fill.position.set(14, 10, -12);
            this.scene.add(fill);

            // 木桌
            const c = document.createElement('canvas'); c.width = c.height = 256;
            const g = c.getContext('2d');
            g.fillStyle = '#c9ab89'; g.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 9; i++) {
                g.fillStyle = `rgba(${150 + Math.random() * 40 | 0},${110 + Math.random() * 30 | 0},${75 + Math.random() * 20 | 0},.35)`;
                g.fillRect(i * 30, 0, 26, 256);
            }
            g.strokeStyle = 'rgba(120,85,55,.25)'; g.lineWidth = 1.2;
            for (let i = 0; i < 14; i++) {
                g.beginPath(); g.moveTo(Math.random() * 256, 0);
                g.bezierCurveTo(Math.random() * 256, 90, Math.random() * 256, 170, Math.random() * 256, 256); g.stroke();
            }
            const wt = new THREE.CanvasTexture(c);
            wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(3, 3);
            const table = new THREE.Mesh(
                new THREE.CylinderGeometry(70, 70, 1, 48),
                new THREE.MeshStandardMaterial({ map: wt, roughness: .9 }));
            table.position.y = -0.9; table.receiveShadow = true;
            this.scene.add(table);

            TexHub.load();

            // 相機軌道
            this.camR = PC.config.SCENE.SOLO.camR;
            this.azim = PC.config.SCENE.SOLO.azim;
            this.elev = PC.config.SCENE.SOLO.elev;
            this.spinning = true;
            this.rotateLocked = false;      // 烹飪中鎖拖曳旋轉，維持起鍋卡對位
            this.dragging = false; this._moved = 0; this._px = 0; this._py = 0;
            this.onCanvasClick = null;      // (x, y) 由 flow 接針目點擊
            this.onTick = null;             // (dt, now)
            this.updateCamera();

            const cvs = this.renderer.domElement;
            cvs.addEventListener('pointerdown', e => { this.dragging = true; this._moved = 0; this._px = e.clientX; this._py = e.clientY; });
            addEventListener('pointermove', e => {
                if (!this.dragging) return;
                this._moved += Math.abs(e.clientX - this._px) + Math.abs(e.clientY - this._py);
                if (!this.rotateLocked) {
                    this.azim += (e.clientX - this._px) * 0.008;
                    this.elev = Math.min(1.35, Math.max(0.22, this.elev + (e.clientY - this._py) * 0.005));
                    this.updateCamera();
                }
                this._px = e.clientX; this._py = e.clientY;
            });
            addEventListener('pointerup', e => {
                const was = this.dragging;
                this.dragging = false;
                if (was && this._moved < 8 && this.onCanvasClick) this.onCanvasClick(e.clientX, e.clientY);
            });
            addEventListener('resize', () => {
                this.camera.aspect = innerWidth / innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(innerWidth, innerHeight);
                this.updateCamera();
            });

            this.rigs = [];
            this._ray = new THREE.Raycaster();
            this._ndc = new THREE.Vector2();

            let last = performance.now();
            const loop = now => {
                const dt = Math.min(.05, (now - last) / 1000); last = now;
                if (this.onTick) this.onTick(dt, now);
                this.rigs.forEach(r => r.update(dt, now));
                if (this.spinning && !this.dragging) { this.azim += dt * .22; this.updateCamera(); }
                this.renderer.render(this.scene, this.camera);
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        }

        updateCamera() {
            // 窄視窗補償：水平 FOV 隨長寬比縮小，雙盤佈局需要更遠的相機才裝得下
            const aspect = innerWidth / innerHeight;
            const need = this.layoutMode === 'duo' ? 1.5 : .8;
            const R = this.camR * Math.max(1, need / aspect);
            this.camera.position.set(R * Math.cos(this.elev) * Math.cos(this.azim), R * Math.sin(this.elev), R * Math.cos(this.elev) * Math.sin(this.azim));
            this.camera.lookAt(0, 1.6, 0);
            this.scene.fog.near = R + 27;
            this.scene.fog.far = R + 92;
        }

        /** 烹飪視角：關自動旋轉、鎖拖曳，鏡頭回本佈局標準機位（兩盤才對得上各自的起鍋卡） */
        lockView() {
            const cfg = this.layoutMode === 'duo' ? PC.config.SCENE.DUO : PC.config.SCENE.SOLO;
            this.spinning = false;
            this.rotateLocked = true;
            this.camR = cfg.camR;
            this.azim = cfg.azim; this.elev = cfg.elev;
            this.updateCamera();
        }
        /** 展示視角：恢復自動旋轉與拖曳（選單／點餐／結算用） */
        freeView() {
            this.spinning = true;
            this.rotateLocked = false;
        }

        /** 世界座標 → 螢幕像素（盤面歸屬標籤等 HUD 對位用） */
        toScreen(x, y, z) {
            const v = new THREE.Vector3(x, y, z).project(this.camera);
            return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
        }

        /** 佈局：'solo' 一盤置中、'duo' 兩盤並排（相機拉遠、霧外推） */
        layout(mode) {
            const cfg = mode === 'duo' ? PC.config.SCENE.DUO : PC.config.SCENE.SOLO;
            this.layoutMode = mode;
            while (this.rigs.length < cfg.rigX.length) this.rigs.push(new PlateRig(this, 0));
            this.rigs.forEach((r, i) => {
                const on = i < cfg.rigX.length;
                r.root.visible = on;
                if (on) r.root.position.x = cfg.rigX[i];
            });
            this.camR = cfg.camR;
            this.azim = cfg.azim; this.elev = cfg.elev;
            this.updateCamera();
            return this.rigs.slice(0, cfg.rigX.length);
        }
        activeRigs() {
            return this.rigs.filter(r => r.root.visible);
        }

        hitTestRig(rig, x, y) {
            return rig.hitTest(x, y, this.camera, this._ray, this._ndc);
        }

        screenshot() {
            // 出圖時暫時調亮曝光（稍亮更討喜），擷取後還原畫面曝光
            const r = this.renderer, prev = r.toneMappingExposure;
            r.toneMappingExposure = prev * (PC.config.PHOTO_EXPOSURE || 1.15);
            r.render(this.scene, this.camera);
            const url = r.domElement.toDataURL('image/png');
            r.toneMappingExposure = prev;
            r.render(this.scene, this.camera);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pastacrochet.png'; a.click();
        }
        renderOnce() { this.renderer.render(this.scene, this.camera); }
    }

    PC.SceneManager = SceneManager;
    PC.PlateRig = PlateRig;
})();
