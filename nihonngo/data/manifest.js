/* 所有練習單的清單，index.html 與側欄的下拉選單都讀這裡。
   新增一課：在 data/sheets/ 放好檔案後，這裡補一行。
   排列順序 = 畫面上的順序，由易到難。
   grade 是數字＝日本小學年級，是字串＝JLPT 等級。 */
window.SHEET_MANIFEST = [
  { id: "g1-06", grade: 1,    label: "れんしゅう ⑥", kanji: ["一", "二"] },
  { id: "g1-07", grade: 1,    label: "れんしゅう ⑦", kanji: ["三", "四"] },

  { id: "n5-01", grade: "N5", label: "N5 ①", kanji: ["日", "月", "火", "水"] },
  { id: "n5-02", grade: "N5", label: "N5 ②", kanji: ["人", "男", "女", "子"] },

  { id: "n4-01", grade: "N4", label: "N4 ①", kanji: ["質", "問", "答", "題"] },
  { id: "n4-02", grade: "N4", label: "N4 ②", kanji: ["医", "者", "病", "院"] },

  { id: "n3-01", grade: "N3", label: "N3 ①", kanji: ["経", "験", "報", "告"] },
  { id: "n3-02", grade: "N3", label: "N3 ②", kanji: ["変", "化", "増", "減"] }
];
