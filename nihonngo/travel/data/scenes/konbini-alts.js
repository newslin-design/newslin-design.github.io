/* 其他店內圖：可以偷偷換（2026-10-26）。怎麼換見 js/alts.js。
   正式那張寫在 konbini.js；這裡是其他候選。商品、動作照 konbini.js 的熱點，只換座標。
   座標是先粗略量的，真的要改用哪一張時，再用 ?edit 微調、搬回 konbini.js。
     spots：熱點 id → [x, y, w, h]（圖的百分比）　labels：同 konbini.js（bg 是底板） */
window.SCENES.konbini.alts = {
  main_zh: "俯視・線稿（正式）",   // konbini.js 那張的名字，切換時顯示用
  list: [
    {
      name_zh: "俯視・線稿（第一版）",
      image: "img/konbini-inside-alt1.jpg",
      spots: {
        tea:       [9, 29, 41, 13],
        beer:      [52.5, 23.5, 11, 15],
        poster:    [66.5, 22.5, 10, 10.5],
        coffee:    [84, 33.5, 16, 15],
        onigiri:   [5, 47.5, 21, 9],
        sandwich:  [6, 56.5, 21, 5],
        bento:     [6, 61.5, 24, 7],
        cupnoodle: [35, 42, 23, 18],
        register:  [53, 43, 30, 24]
      },
      labels: [
        { x: 21,   y: 27.5, w: 14, h: 2.6, text: "お{茶|ちゃ}", bg: "#ffffff" },
        { x: 52.5, y: 21.5, w: 11, h: 2.6, text: "ビール", bg: "#ffffff" },
        { x: 63.5, y: 25.8, w: 16, h: 2.4, text: "SNSで{話題|わだい}", bg: "#ffffff" },
        { x: 80.5, y: 25.6, w: 14, h: 2.6, text: "コーヒー", bg: "#ffffff" },
        { x: 69,   y: 41.6, w: 10, h: 2.6, text: "レジ", bg: "#ffffff" },
        { x: 4,    y: 45.6, w: 17, h: 2.4, text: "おにぎり", bg: "#ffffff" },
        { x: 3,    y: 55.5, w: 19, h: 2.2, text: "サンドイッチ", bg: "#ffffff" },
        { x: 3,    y: 60.6, w: 15, h: 2.2, text: "お{弁当|べんとう}", bg: "#ffffff" },
        { x: 37,   y: 41.2, w: 17, h: 2.4, text: "カップ{麺|めん}", bg: "#ffffff" }
      ],
      focus: { x: 72, y: 58, scale: 1.75 }
    },
    {
      /* 原圖上下有黑邊：拿掉之後，上下用同一張圖的模糊版補成 9:16 */
      name_zh: "第一人稱・厚塗",
      image: "img/konbini-inside-alt2.jpg",
      spots: {
        tea:       [0, 35, 27, 11],
        beer:      [28, 38, 10, 12],
        poster:    [68.5, 36.5, 11, 10],
        coffee:    [89, 41, 11, 22],
        onigiri:   [0, 63.5, 22, 6],
        sandwich:  [0, 55, 22, 8],
        bento:     [10, 75, 28, 8],
        cupnoodle: [30, 51, 25, 15],
        register:  [56, 47, 33, 16]
      },
      labels: [
        { x: 6,    y: 32.8, w: 14, h: 2.4, text: "お{茶|ちゃ}", bg: "#ffffff" },
        { x: 26.5, y: 35.6, w: 12, h: 2.4, text: "ビール", bg: "#ffffff" },
        { x: 66,   y: 38.6, w: 16, h: 2.4, text: "SNSで{話題|わだい}", bg: "#ffffff" },
        { x: 84.5, y: 38.8, w: 15, h: 2.4, text: "コーヒー", bg: "#ffffff" },
        { x: 60,   y: 48.6, w: 10, h: 2.6, text: "レジ", bg: "#ffffff" },
        { x: 1,    y: 52.6, w: 19, h: 2.2, text: "サンドイッチ", bg: "#ffffff" },
        { x: 1,    y: 61.8, w: 15, h: 2.2, text: "おにぎり", bg: "#ffffff" },
        { x: 12,   y: 73.2, w: 13, h: 2.2, text: "お{弁当|べんとう}", bg: "#ffffff" },
        { x: 33,   y: 49.2, w: 15, h: 2.2, text: "カップ{麺|めん}", bg: "#ffffff" }
      ],
      focus: { x: 74, y: 56, scale: 1.75 }
    },
    {
      name_zh: "第一人稱・線稿",
      image: "img/konbini-inside-alt3.jpg",
      spots: {
        tea:       [10, 37.5, 25, 10],
        beer:      [35.5, 37.5, 11, 15],
        poster:    [72, 36, 8.5, 9],
        coffee:    [84, 50, 16, 21],
        onigiri:   [0, 53.5, 21, 6],
        sandwich:  [0, 59.5, 21, 5],
        bento:     [0, 65, 27, 9],
        cupnoodle: [34.5, 52.5, 17, 14],
        register:  [52, 45, 31, 19]
      },
      labels: [
        { x: 76,   y: 20.6, w: 21, h: 5,   text: "レジ" },   // 吊在天花板的空白招牌，不用底板
        { x: 13,   y: 34.6, w: 14, h: 2.2, text: "お{茶|ちゃ}", bg: "#ffffff" },
        { x: 35,   y: 34.6, w: 12, h: 2.2, text: "ビール", bg: "#ffffff" },
        { x: 68.5, y: 37.4, w: 15.5, h: 2.4, text: "SNSで{話題|わだい}", bg: "#ffffff" },
        { x: 84.5, y: 47.4, w: 15, h: 2.4, text: "コーヒー", bg: "#ffffff" },
        { x: 1,    y: 51.6, w: 15, h: 2.2, text: "おにぎり", bg: "#ffffff" },
        { x: 1,    y: 59.2, w: 19, h: 2.2, text: "サンドイッチ", bg: "#ffffff" },
        { x: 1,    y: 64.6, w: 13, h: 2.2, text: "お{弁当|べんとう}", bg: "#ffffff" },
        { x: 36,   y: 51.4, w: 14, h: 2.2, text: "カップ{麺|めん}", bg: "#ffffff" }
      ],
      focus: { x: 68, y: 56, scale: 1.75 }
    }
  ]
};
