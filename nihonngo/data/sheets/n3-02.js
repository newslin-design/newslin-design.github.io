/* ============================================================
   練習單：JLPT N3 ② / 変・化・増・減
   ------------------------------------------------------------
   主題是「かわる・ふえる」，四個字互相組成 変化 和 増減。

   ※ 題目是草稿，讀音都查證過，用詞請老師過目後再發。
   ============================================================ */
window.SHEETS = window.SHEETS || {};
window.SHEETS["n3-02"] = {
  id: "n3-02",
  grade: "N3",
  label: "N3 ②",
  brand: "JLPT N3 漢字ドリル",
  kanji: ["変", "化", "増", "減"],
  scoreNote: "80点以上で合格。まちがえた漢字はもう一度書いてみましょう。",
  footer: "漢字れんしゅうシート ／ JLPT N3 ／ 変・化・増・減",

  sections: [
    {
      type: "trace",
      points: 20,
      heading: "なぞってから、じぶんで書きましょう。",
      cells: 5,
      guides: 2,
      rowHeight: 78
    },
    {
      type: "reading",
      points: 10,
      heading: "―の読み方をひらがなで書きましょう。",
      items: [
        { text: "気温が{変化}する。",     answer: "へんか" },
        { text: "人口が{増加}する。",     answer: "ぞうか" },
        { text: "体重が{減少}する。",     answer: "げんしょう" },
        { text: "日本の{文化}を学ぶ。",   answer: "ぶんか" },
        { text: "{大変}な仕事だ。",       answer: "たいへん" },
        { text: "売上が{半減}した。",     answer: "はんげん" }
      ]
    },
    {
      type: "fill",
      points: 10,
      heading: "□に漢字を書きましょう。",
      items: [
        { text: "気温が {}化する。", hint: "へん", answer: "変" },
        { text: "日本の 文{}。",     hint: "か",   answer: "化" },
        { text: "人口が {}加する。", hint: "ぞう", answer: "増" },
        { text: "体重が {}少する。", hint: "げん", answer: "減" }
      ]
    }
  ]
};
