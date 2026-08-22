#!/usr/bin/env node
/* ============================================================
   fetch-kanjivg.js ─ 從 KanjiVG 抓筆順資料，寫進 data/strokes.js
   ------------------------------------------------------------
   用法（在 nihonngo/ 底下）：

     node tools/fetch-kanjivg.js 三 四 五

   會把這幾個字的筆順「合併」進 data/strokes.js，已經有的字會覆蓋更新，
   其他字不動。需要網路，只有加新字時才要跑，平常網頁不會連外。

   資料來源 KanjiVG（CC BY-SA 3.0）— 授權說明見 data/strokes.js 檔頭。
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "data", "strokes.js");
const BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";

const HEADER = `/* ============================================================
   strokes.js ─ 筆順資料（由 tools/fetch-kanjivg.js 產生，請勿手改）
   ------------------------------------------------------------
   Stroke order data derived from KanjiVG
     Copyright (C) 2009-2011 Ulrich Apel
     https://kanjivg.tagaini.net/
     Licensed under Creative Commons Attribution-Share Alike 3.0
     https://creativecommons.org/licenses/by-sa/3.0/

   本檔案為 KanjiVG 的改作（只留下筆畫路徑與筆序標號座標），
   依 CC BY-SA 3.0 以相同授權釋出。

   格式：char -> { size: 邊長, paths: [SVG path d, ...], nums: [[x, y], ...] }
   paths 的順序就是筆順。
   ============================================================ */
`;

function code(ch) {
  return ch.codePointAt(0).toString(16).padStart(5, "0");
}

async function fetchKanji(ch) {
  const url = BASE + code(ch) + ".svg";
  const res = await fetch(url);
  if (!res.ok) throw new Error(ch + " 抓不到（HTTP " + res.status + "）：" + url);
  const svg = await res.text();

  const paths = [];
  const re = /<path[^>]*\sd="([^"]+)"/g;
  let m;
  while ((m = re.exec(svg)) !== null) paths.push(m[1].trim());

  const nums = [];
  const reNum = /<text transform="matrix\(1 0 0 1 ([\d.-]+) ([\d.-]+)\)">/g;
  while ((m = reNum.exec(svg)) !== null) {
    nums.push([+(+m[1]).toFixed(2), +(+m[2]).toFixed(2)]);
  }

  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  if (!paths.length) throw new Error(ch + " 的 SVG 裡沒有筆畫");

  return { size: vb ? +vb[1] : 109, paths: paths, nums: nums };
}

/* 讀出現有的 data/strokes.js（在 sandbox 裡跑一次拿到物件） */
function readExisting() {
  if (!fs.existsSync(OUT)) return {};
  const src = fs.readFileSync(OUT, "utf8");
  const sandbox = { window: {} };
  try {
    new Function("window", src)(sandbox.window);
  } catch (e) {
    console.warn("讀不懂現有的 strokes.js，將整個重寫：" + e.message);
    return {};
  }
  return sandbox.window.STROKES || {};
}

function write(db) {
  const keys = Object.keys(db).sort();
  const body = keys.map(function (ch) {
    const d = db[ch];
    return (
      "  " + JSON.stringify(ch) + ": {\n" +
      "    size: " + d.size + ",\n" +
      "    paths: [\n" +
      d.paths.map(function (p) { return "      " + JSON.stringify(p); }).join(",\n") + "\n" +
      "    ],\n" +
      "    nums: " + JSON.stringify(d.nums) + "\n" +
      "  }"
    );
  }).join(",\n");

  fs.writeFileSync(OUT, HEADER + "window.STROKES = {\n" + body + "\n};\n", "utf8");
}

(async function main() {
  const chars = process.argv.slice(2).join("").split("").filter(function (c) {
    return c.trim() !== "";
  });

  if (!chars.length) {
    console.error("用法：node tools/fetch-kanjivg.js 三 四 五");
    process.exit(1);
  }

  const db = readExisting();
  for (const ch of chars) {
    try {
      const data = await fetchKanji(ch);
      db[ch] = data;
      console.log("✓ " + ch + "  " + data.paths.length + " 畫");
    } catch (e) {
      console.error("✗ " + e.message);
    }
  }

  write(db);
  console.log("→ 寫入 " + path.relative(process.cwd(), OUT) +
              "（共 " + Object.keys(db).length + " 字）");
})();
