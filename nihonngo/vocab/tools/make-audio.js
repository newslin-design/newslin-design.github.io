#!/usr/bin/env node
/* ============================================================
   make-audio.js ─ 用 Gemini 預先生成發音音檔，寫進 audio/
   ------------------------------------------------------------
   用法（在 nihonngo/ 底下）：

     node vocab/tools/make-audio.js                只生成還沒有的音檔（女聲、男聲各一套）
     node vocab/tools/make-audio.js --dry-run      只列出要生成哪些，不呼叫 API
     node vocab/tools/make-audio.js --redo hizuke/d14,hizuke/d24
                                                   念得不對的，重新生成
     node vocab/tools/make-audio.js --set m        只做男聲（f = 女聲、m = 男聲）
     node vocab/tools/make-audio.js --limit 1      最多做幾個（先試一個看看）
     node vocab/tools/make-audio.js --batch 50     整批：一次請求念 50 個詞，再依停頓切開（省額度）
     node vocab/tools/make-audio.js --try-voices Kore,Aoede,Charon,Puck
                                                   同一句用幾種聲音各念一次，放在 audio/_voices/
     node vocab/tools/make-audio.js --app travel --batch 50
                                                   旅遊模擬器（travel/）的台詞：店員、你的回應各一套

   其他參數：--only <主題id>  --model <模型>  --delay <毫秒>
            --out <資料夾>  試做用：音檔寫到別的資料夾，不動 audio/ 和對照表

   聲音（Lin 指定）：單字卡女聲 Kore、男聲 Charon；旅遊模擬器店員 Kore、你的回應 Charon。改 APPS 就能換。
   單字卡（--app vocab，預設）：要念哪些詞，寫在各主題資料檔的 clips（data/themes/<id>.js），每個詞兩套都做。
   音檔放在 audio/<主題>/<f|m>/<id>.wav：API 給的 24kHz 單聲道 WAV，頭尾靜音會剪掉，一個詞大約 45KB。
   旅遊模擬器（--app travel）：台詞直接從場景資料整理出來（loadTravel），不用寫 clips，一句只做一套。
   音檔放在 travel/audio/<場景|words>/<clerk|you>/<拼音>.wav。
   最後會重寫 audio/index.js（文字 → 音檔的對照表，網頁靠它找音檔）。
   已經有的音檔不會重做，所以重跑不會重複花錢。

   API 金鑰：放在環境變數 GEMINI_API_KEY，或寫進 vocab/tools/gemini-key.txt
   （這個檔在 .gitignore 裡，不會進 git）。金鑰在 Google AI Studio 申請。
   免費額度（2026-10 實測）：gemini-3.8-flash-tts 一天只有 10 次（美西午夜重置）。
   所以平常用 --batch 50：一次請求念 50 個詞再切開，一個主題一種聲音只要 1 次。
   額度用完會停下來，已生成的會留著，下次再跑會從沒做完的地方接著做。
   2026-10-26 用 lite 模型實測：41 個詞一次念完，切成剛好 41 段，每段長度都合理。
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const KEY_FILE = path.join(__dirname, "gemini-key.txt");
const API = "https://generativelanguage.googleapis.com/v1beta/interactions";

/* 兩個網頁共用這支工具，--app 選哪一個。
   voices：音檔分幾套、各用哪個聲音　names：寫進對照表說明用
   style：念法的指示。模型會把 text 當逐字稿念，所以指示要放在 style，不能混進 text。
          整批用的 batchStyle 要每句都像單獨念一樣，中間停久一點才切得開。
          可以是一句（每套都用），也可以照套分開寫 */
const APPS = {
  vocab: {
    root: path.join(__dirname, ".."),
    global: "VOCAB_AUDIO",
    voices: { f: "Kore", m: "Charon" },
    names: { f: "女聲", m: "男聲" },
    load: loadThemes,
    style: "A Japanese teacher reading one vocabulary item aloud for a learner: standard Tokyo accent, clear and calm, natural speed. Read exactly the given text and nothing else.",
    batchStyle: "A Japanese teacher reading a list of vocabulary items aloud for a learner, one item per line: standard Tokyo accent, clear and calm, natural speed. Say each item as if it were said on its own, with the same falling intonation every time, and pause for about one second after each item. Read exactly the given lines in order and nothing else.",
    sample: "きょうは じゅうがつ ついたち です。"   // --try-voices 用的句子
  },
  travel: {
    root: path.join(__dirname, "..", "..", "travel"),
    global: "TRAVEL_AUDIO",
    voices: { clerk: "Kore", you: "Charon" },
    names: { clerk: "店員", you: "你的回應" },
    load: loadTravel,
    style: {
      clerk: "A Japanese convenience store clerk speaking to a customer at the register: standard Tokyo accent, polite and friendly, natural speed. Read exactly the given text and nothing else.",
      you: "A young adult customer at a Japanese convenience store answering the clerk in short, polite Japanese: standard Tokyo accent, clear, natural speed. Read exactly the given text and nothing else."
    },
    batchStyle: {
      clerk: "A Japanese convenience store clerk speaking to customers at the register, one line at a time: standard Tokyo accent, polite and friendly, natural speed and intonation (questions go up at the end). Say each line as if it were said on its own, and pause for about one second after each line. Read exactly the given lines in order and nothing else.",
      you: "A young adult customer at a Japanese convenience store answering the clerk in short, polite Japanese, one line at a time: standard Tokyo accent, clear, natural speed. Say each line as if it were said on its own, and pause for about one second after each line. Read exactly the given lines in order and nothing else."
    },
    sample: "ポイントカードはおもちですか？"
  }
};

/* --app 要先知道，後面的路徑、聲音都跟著它 */
const APP_NAME = (i => i >= 0 ? process.argv[i + 1] : "vocab")(process.argv.indexOf("--app"));
const APP = APPS[APP_NAME];
if (!APP) { console.error(`沒有這個 --app：${APP_NAME}（可以用 ${Object.keys(APPS).join("、")}）`); process.exit(1); }
const ROOT = APP.root;
const AUDIO_DIR = path.join(ROOT, "audio");
const INDEX = path.join(AUDIO_DIR, "index.js");
const VOICES = APP.voices;
const styleFor = (set, batch) => { const s = batch ? APP.batchStyle : APP.style; return typeof s === "string" ? s : s[set]; };

const DEFAULTS = {
  model: "gemini-3.8-flash-tts",
  rate: 24000,     // API 回傳的取樣率（要求 16kHz 會被忽略）；只在回應沒有 WAV 檔頭時用來補檔頭
  delay: 2000,     // 每次呼叫之間停多久（毫秒）。免費額度一天只有 10 次，平常用 --batch
  sample: APP.sample
};

/* ---------- 參數 ---------- */
function parseArgs(argv) {
  const opt = Object.assign({}, DEFAULTS, { dryRun: false, redo: [], only: null, sets: Object.keys(VOICES), limit: Infinity, batch: 0, out: null, tryVoices: null });
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], next = () => argv[++i];
    if (a === "--app") next();   // 最上面已經讀過了
    else if (a === "--dry-run") opt.dryRun = true;
    else if (a === "--redo") opt.redo = next().split(",").map(s => s.trim()).filter(Boolean);
    else if (a === "--only") opt.only = next();
    else if (a === "--set") opt.sets = next().split(",").map(s => s.trim()).filter(s => VOICES[s]);
    else if (a === "--limit") opt.limit = Number(next());
    else if (a === "--batch") opt.batch = Number(next());
    else if (a === "--out") opt.out = path.resolve(next());
    else if (a === "--model") opt.model = next();
    else if (a === "--delay") opt.delay = Number(next());
    else if (a === "--try-voices") opt.tryVoices = next().split(",").map(s => s.trim()).filter(Boolean);
    else { console.error(`看不懂的參數：${a}`); process.exit(1); }
  }
  return opt;
}

/* ---------- 讀主題資料（跟網頁讀同一份檔案） ---------- */
function loadThemes() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  const run = f => vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
  run(path.join(ROOT, "data", "themes.js"));
  const out = [];
  for (const meta of sandbox.window.VOCAB_THEME_LIST || []) {
    const f = path.join(ROOT, "data", "themes", meta.id + ".js");
    if (!fs.existsSync(f)) continue;
    run(f);
    const theme = (sandbox.window.VOCAB_THEMES || {})[meta.id];
    if (theme && Array.isArray(theme.clips)) out.push({ id: meta.id, clips: theme.clips });
  }
  return out;
}

/* ---------- 旅遊模擬器：台詞從場景資料整理出來（不用另外寫 clips） ----------
   照 index.html 的順序載入 data/ 的檔案，{漢字|かな} 借用網頁的 js/text.js 處理。
   clerk（店員）：步驟那句、各難度的說法、回應之後店員再說的那句、單字卡、社群推薦的商品名
   you（你的回應）：選項、社群推薦的「跟店員這樣說」
   text：網頁查音檔用的字，跟念的時候一樣是漢字原文（TravelText.plain）
   say：送去生成的字。用ルビ的讀音（全假名）避免漢字念錯（ご入用＝ごいりよう）；
        句中的「。」改成「、」，整批時才不會被切成兩段。資料有寫 tts 就用 tts
   檔名用拼音（ā → aa），同一套裡同一句只做一次 */
function loadTravel() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  const run = rel => vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), sandbox, { filename: rel });
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  for (const m of html.matchAll(/<script src="(data\/[^"]+)"/g)) run(m[1]);
  run("js/text.js");
  const W = sandbox.window, T = W.TravelText;

  const slug = s => String(s || "").normalize("NFD").replace(/([aeiou])̄/g, "$1$1").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  function group(id) {
    const clips = [], seen = new Set(), used = new Set();
    function add(set, o, label, name) {
      if (!o || !o.ja) return;
      const text = T.plain(o.ja);
      if (seen.has(set + text)) return;
      seen.add(set + text);
      const base = name || slug(o.romaji) || `${set}-${clips.length + 1}`;
      let cid = base;
      for (let n = 2; used.has(set + cid); n++) cid = `${base}-${n}`;
      used.add(set + cid);
      clips.push({ id: cid, set, label, text, say: (o.tts || T.reading(o.ja)).replace(/。(?=.)/g, "、") });
    }
    return { id, clips, add };
  }

  const words = group("words");
  Object.keys(W.WORDS || {}).forEach(id => words.add("clerk", W.WORDS[id], "單字", id));
  const out = [words];

  Object.keys(W.SCENES || {}).forEach(sid => {
    const sc = W.SCENES[sid], g = group(sid);
    const choice = (c, label) => {
      if (!c.nod) g.add("you", c, label + " 選項");
      if (c.then) g.add("clerk", c.then, label + " 之後");
    };
    /* 步驟就是有 type 的那些（enter、counter、checkout…） */
    Object.keys(sc).forEach(k => {
      if (!Array.isArray(sc[k])) return;
      sc[k].forEach(s => {
        if (!s || !s.type) return;
        g.add("clerk", s, s.id);
        (s.choices || []).forEach(c => choice(c, s.id));
        (s.variants || []).forEach(v => {
          g.add("clerk", v, `${s.id} lv${v.lv}`);
          (v.choices || []).forEach(c => choice(c, `${s.id} lv${v.lv}`));
        });
      });
    });
    ((W.PICKS || {})[sid] || { list: [] }).list.forEach(p => {
      g.add("clerk", p, "推薦");
      g.add("you", p.ask, "推薦 怎麼說");
    });
    out.push(g);
  });
  return out.map(g => ({ id: g.id, clips: g.clips }));
}

function apiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  if (fs.existsSync(KEY_FILE)) return fs.readFileSync(KEY_FILE, "utf8").trim();
  return "";
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- 呼叫 Gemini ---------- */
async function tts(text, voice, opt, key) {
  const body = {
    model: opt.model,
    input: [{
      type: "user_input",
      content: [{ type: "text", text: text, annotations: [{ type: "speech_metadata", style: opt.style }] }]
    }],
    response_format: { type: "audio", mime_type: "audio/wav" },
    generation_config: { speech_config: [{ voice: voice }] }
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const json = await res.json();
      const b64 = findAudio(json);
      if (!b64) throw new Error("回應裡找不到音訊：" + JSON.stringify(json).slice(0, 300));
      return Buffer.from(b64, "base64");
    }
    const msg = (await res.text()).split(key).join("***");   // 錯誤訊息裡萬一帶到金鑰，遮掉
    /* 每日額度用完（免費額度隔天美西午夜才恢復）：等也沒用，直接停 */
    if (res.status === 429 && /PerDay|per day|daily/i.test(msg)) {
      throw new Error(`QUOTA 今天的額度用完了：${msg.slice(0, 600)}`);
    }
    /* 太快（每分鐘上限）或伺服器忙（5xx）就等一下重試，最多 5 次。
       等多久：先看錯誤內容的 retryDelay（"13s"），沒有就看 retry-after（秒）；要等超過 5 分鐘就不等了 */
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      const delay = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(msg);
      const sec = delay ? Number(delay[1]) : Number(res.headers.get("retry-after")) || 0;
      if (sec > 300) throw new Error(`QUOTA 要等 ${Math.ceil(sec / 60)} 分鐘以上才能再呼叫：${msg.slice(0, 600)}`);
      const wait = Math.ceil(sec || 2 ** attempt * 5) * 1000 + 1000;
      console.log(`  ${res.status}，${Math.round(wait / 1000)} 秒後重試…（${msg.replace(/\s+/g, " ").slice(0, 160)}）`);
      await sleep(wait);
      continue;
    }
    throw new Error(`HTTP ${res.status}：${msg.slice(0, 600)}`);
  }
}

/** 文件寫的位置：steps[] 裡 type 為 model_output 的那步，content[] 裡 type 為 audio 的 data。
    回應格式日後可能微調，所以整個找一遍、取最後一段音訊 */
function findAudio(json) {
  let found = null;
  (function walk(x) {
    if (!x || typeof x !== "object") return;
    if (Array.isArray(x)) { x.forEach(walk); return; }
    if (x.type === "audio" && typeof x.data === "string") found = x.data;
    Object.keys(x).forEach(k => walk(x[k]));
  })(json);
  return found;
}

/* ---------- WAV：剪掉頭尾靜音 ---------- */
function makeWav(pcm, rate, ch) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * ch * 2, 28); h.writeUInt16LE(ch * 2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

/** 拆開 WAV，回傳 { pcm, rate, ch }；看不懂的格式回傳 null。
    沒有 RIFF 檔頭的話，當成 16-bit 單聲道 PCM（串流模式的預設格式） */
function parseWav(buf, fallbackRate) {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") return { pcm: buf, rate: fallbackRate, ch: 1 };
  let off = 12, fmt = null, pcm = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4), size = buf.readUInt32LE(off + 4), start = off + 8;
    if (id === "fmt ") fmt = { format: buf.readUInt16LE(start), ch: buf.readUInt16LE(start + 2), rate: buf.readUInt32LE(start + 4), bits: buf.readUInt16LE(start + 14) };
    if (id === "data") { pcm = buf.subarray(start, Math.min(buf.length, start + size)); break; }
    off = start + size + (size % 2);
  }
  if (!fmt || !pcm || fmt.format !== 1 || fmt.bits !== 16) return null;
  return { pcm: pcm, rate: fmt.rate, ch: fmt.ch };
}

function trimWav(buf, fallbackRate) {
  const w = parseWav(buf, fallbackRate);
  if (!w) return buf;   // 看不懂的格式就原樣保留
  const pcm = w.pcm, rate = w.rate, ch = w.ch;
  const frames = Math.floor(pcm.length / 2 / ch);
  const loud = i => { let m = 0; for (let c = 0; c < ch; c++) m = Math.max(m, Math.abs(pcm.readInt16LE((i * ch + c) * 2))); return m; };
  const THRESHOLD = 600;              // 約 -35dB 以下當成靜音
  let a = 0, b = frames - 1;
  while (a < frames && loud(a) < THRESHOLD) a++;
  while (b > a && loud(b) < THRESHOLD) b--;
  if (a >= b) return makeWav(pcm.subarray(0, frames * 2 * ch), rate, ch);
  const pad = Math.round(rate * 0.08);   // 前後各留 0.08 秒，聽起來才不會切太硬
  a = Math.max(0, a - pad);
  b = Math.min(frames - 1, b + pad);
  return makeWav(pcm.subarray(a * 2 * ch, (b + 1) * 2 * ch), rate, ch);
}

/* ---------- 整批：一次念很多個詞，再依停頓切開 ----------
   免費額度算的是「次數」不是長度，所以一次念 50 個詞再切，一天 10 次就夠用。
   每 10 毫秒看一次音量，夠長的安靜處就是詞和詞的分界（「みっか」的っ只有零點一秒，不會被切開）。
   段數要剛好等於詞數、每段長度也要跟假名數合理，不然整批作廢，一個檔都不寫。 */
function splitBatch(buf, texts, fallbackRate) {
  const w = parseWav(buf, fallbackRate);
  if (!w) throw new Error("看不懂回傳的音訊格式");
  const pcm = w.pcm, rate = w.rate, ch = w.ch;
  const win = Math.round(rate / 100);
  const nWin = Math.floor(pcm.length / 2 / ch / win);
  const level = new Array(nWin);
  for (let k = 0; k < nWin; k++) {
    let m = 0;
    for (let i = k * win; i < (k + 1) * win; i++) {
      for (let c = 0; c < ch; c++) m = Math.max(m, Math.abs(pcm.readInt16LE((i * ch + c) * 2)));
    }
    level[k] = m;
  }

  /* 長度合理：每個假名 0.05〜0.45 秒（漏念、兩個詞黏在一起都會超出範圍）。
     只有一兩個假名的詞（目＝め、歯＝は）念慢一點就會超過 0.45，所以不到 0.8 秒的都算合理；
     兩個詞黏在一起一定超過 0.8 秒，照樣抓得到 */
  const plausible = segs => segs.every((s, i) => {
    const sec = (s[1] - s[0]) / 100, per = sec / texts[i].length;
    return per > 0.05 && (per < 0.45 || sec < 0.8);
  });
  const cut = segs => segs.map((s, i) => {
    const pad = 8;   // 前後各留 80 毫秒，但不超過跟隔壁那段的中點
    const lo = i ? Math.max(s[0] - pad, Math.ceil((segs[i - 1][1] + s[0]) / 2)) : Math.max(0, s[0] - pad);
    const hi = i < segs.length - 1 ? Math.min(s[1] + pad, Math.floor((s[1] + segs[i + 1][0]) / 2)) : Math.min(nWin, s[1] + pad);
    return makeWav(pcm.subarray(lo * win * 2 * ch, hi * win * 2 * ch), rate, ch);
  });

  let closest = null;
  for (const gap of [35, 25, 50, 20, 70]) {        // 安靜多久算分界（單位 10 毫秒）
    for (const thr of [600, 400, 900]) {           // 多小聲算安靜
      const segs = [];
      let start = -1, quiet = 0;
      for (let k = 0; k <= nWin; k++) {
        if (k < nWin && level[k] >= thr) {
          if (start < 0) start = k;
          quiet = 0;
        } else if (start >= 0) {
          quiet++;
          if (quiet >= gap || k === nWin) {
            const end = k - quiet + 1;
            if (end - start >= 8) segs.push([start, end]);   // 短於 80 毫秒的是雜音
            start = -1;
            quiet = 0;
          }
        }
      }
      if (segs.length === texts.length && plausible(segs)) return cut(segs);
      if (closest === null || Math.abs(segs.length - texts.length) < Math.abs(closest - texts.length)) closest = segs.length;
    }
  }
  throw new Error(`切不出剛好 ${texts.length} 段（最接近的是 ${closest} 段），這批不採用`);
}

/* ---------- 對照表：{ f: {文字: 檔案}, m: {文字: 檔案} } ---------- */
function writeIndex(themes) {
  const map = {};
  let n = 0;
  for (const set of Object.keys(VOICES)) {
    map[set] = {};
    for (const th of themes) {
      for (const c of th.clips) {
        if (c.set && c.set !== set) continue;
        const rel = `audio/${th.id}/${set}/${c.id}.wav`;
        if (fs.existsSync(path.join(ROOT, rel)) && !(c.text in map[set])) { map[set][c.text] = rel; n++; }
      }
    }
  }
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  fs.writeFileSync(INDEX,
`/* ============================================================
   index.js ─ 文字 → 音檔對照表（由 tools/make-audio.js 產生，請勿手改）
   ------------------------------------------------------------
   ${Object.keys(VOICES).map(s => `${s} = ${APP.names[s]}（${VOICES[s]}）`).join("、")}。
   網頁念一個詞時先查這裡，有音檔就放音檔，沒有才用瀏覽器內建語音。
   ============================================================ */
window.${APP.global} = ${JSON.stringify(map, null, 2)};
`);
  return n;
}

function needKey() {
  const key = apiKey();
  if (!key) {
    console.error(`找不到 API 金鑰。請設定環境變數 GEMINI_API_KEY，或把金鑰存成 ${KEY_FILE}`);
    process.exit(1);
  }
  return key;
}

/* ---------- 主程式 ---------- */
(async function main() {
  const opt = parseArgs(process.argv.slice(2));
  const all = APP.load();   // 對照表永遠寫全部主題，--only 只限定這次要生成哪些
  const themes = all.filter(th => !opt.only || th.id === opt.only);
  if (!themes.length) { console.error("找不到有 clips 的主題。"); process.exit(1); }

  /* 挑聲音：同一句用幾種聲音各念一次 */
  if (opt.tryVoices) {
    const key = needKey();
    const dir = path.join(AUDIO_DIR, "_voices");
    fs.mkdirSync(dir, { recursive: true });
    for (const v of opt.tryVoices) {
      process.stdout.write(`${v} … `);
      try {
        const wav = trimWav(await tts(opt.sample, v, Object.assign({}, opt, { style: styleFor(opt.sets[0], false) }), key), opt.rate);
        fs.writeFileSync(path.join(dir, v + ".wav"), wav);
        console.log(`${Math.round(wav.length / 1024)}KB`);
      } catch (e) { console.log("失敗"); console.error("  " + e.message); }
      await sleep(opt.delay);
    }
    console.log(`放在 ${dir}`);
    return;
  }

  const redo = new Set(opt.redo);
  const base = opt.out || AUDIO_DIR;   // --out 時寫到別的地方，「還缺哪些」仍以 audio/ 為準
  const jobs = [];
  for (const set of opt.sets) {
    for (const th of themes) {
      for (const c of th.clips) {
        if (c.set && c.set !== set) continue;   // 旅遊模擬器：一句只屬於一套
        const key = `${th.id}/${c.id}`;
        if (fs.existsSync(path.join(AUDIO_DIR, th.id, set, c.id + ".wav")) && !redo.has(key) && !redo.has(c.id)) continue;
        jobs.push({ key, set, c, abs: path.join(base, th.id, set, c.id + ".wav") });
      }
    }
  }
  if (jobs.length > opt.limit) jobs.length = opt.limit;

  const voices = opt.sets.map(s => `${s}=${VOICES[s]}`).join("、");
  const calls = opt.batch > 0
    ? opt.sets.reduce((n, s) => n + Math.ceil(jobs.filter(j => j.set === s).length / opt.batch), 0)
    : jobs.length;
  console.log(`要生成 ${jobs.length} 個，呼叫 ${calls} 次（模型 ${opt.model}，聲音 ${voices}）`);
  if (opt.dryRun) {
    jobs.forEach(j => console.log(`  ${j.set}/${j.key}\t${j.c.label}\t${j.c.text}` + (j.c.say && j.c.say !== j.c.text ? `　→ ${j.c.say}` : "")));
    return;
  }
  const finish = ok => console.log(`完成 ${ok} / ${jobs.length}。` + (opt.out ? `試做的音檔在 ${opt.out}` : `對照表：${writeIndex(all)} 筆`));
  if (!jobs.length) { finish(0); return; }

  const key = needKey();
  let ok = 0;

  if (opt.batch > 0) {
    let n = 0;
    outer:
    for (const set of opt.sets) {
      const mine = jobs.filter(j => j.set === set);
      for (let i = 0; i < mine.length; i += opt.batch) {
        const chunk = mine.slice(i, i + opt.batch);
        n++;
        process.stdout.write(`[第 ${n}/${calls} 批] ${set} ${chunk[0].c.label}〜${chunk[chunk.length - 1].c.label}（${chunk.length} 個）… `);
        try {
          /* 每行補一個「。」讓語尾下降；例句本來就有句號的不再補 */
          const says = chunk.map(j => j.c.say || j.c.text);   // 送去念的字（旅遊模擬器是假名，單字卡本來就是假名）
          const lines = says.map(s => /[。！？!?]$/.test(s) ? s : s + "。");
          const raw = await tts(lines.join("\n"), VOICES[set], Object.assign({}, opt, { style: styleFor(set, true) }), key);
          let parts;
          try {
            parts = splitBatch(raw, says, opt.rate);
          } catch (e) {
            const keep = path.join(base, "_batch", `${set}-${n}.wav`);   // 切不開的原始音檔留著，人工聽聽看哪裡出問題
            fs.mkdirSync(path.dirname(keep), { recursive: true });
            fs.writeFileSync(keep, raw);
            throw new Error(`${e.message}。原始音檔：${keep}`);
          }
          parts.forEach((wav, k) => {
            fs.mkdirSync(path.dirname(chunk[k].abs), { recursive: true });
            fs.writeFileSync(chunk[k].abs, wav);
          });
          ok += parts.length;
          console.log(`切成 ${parts.length} 段`);
        } catch (e) {
          console.log("失敗");
          console.error("  " + e.message);
          if (/HTTP 40[0134]|^QUOTA/.test(e.message)) break outer;
        }
        if (n < calls) await sleep(opt.delay);
      }
    }
    finish(ok);
    return;
  }

  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i];
    process.stdout.write(`[${i + 1}/${jobs.length}] ${j.set}/${j.key} ${j.c.label} ${j.c.text} … `);
    try {
      const wav = trimWav(await tts(j.c.say || j.c.text, VOICES[j.set], Object.assign({}, opt, { style: styleFor(j.set, false) }), key), opt.rate);
      fs.mkdirSync(path.dirname(j.abs), { recursive: true });
      fs.writeFileSync(j.abs, wav);
      ok++;
      console.log(`${Math.round(wav.length / 1024)}KB`);
    } catch (e) {
      console.log("失敗");
      console.error("  " + e.message);
      /* 金鑰錯、權限不足、請求格式錯、額度用完：後面也會一樣失敗，直接停（已生成的會留著） */
      if (/HTTP 40[0134]|^QUOTA/.test(e.message)) break;
    }
    if (i < jobs.length - 1) await sleep(opt.delay);
  }
  finish(ok);
})().catch(e => { console.error(e); process.exit(1); });
