/* 三種難度。台詞的說法分 1〜3 級（寫在場景資料的 variants 裡），選了難度會決定：
     pick：從哪幾級的說法裡隨機挑　rate：語速（只影響瀏覽器語音，音檔照錄好的速度放）
     mode：選難度時順便切的顯示方式（之後還是可以用上面的開關改）
     listen：先只聽聲音、答完才顯示字幕　events：突發狀況（event: true 的步驟）出現的機率 */
window.LEVELS = [
  { id: 1, name_zh: "入門",
    desc_zh: "完整、清楚的說法，講得比較慢。日文、拼音、中文都看得到。",
    pick: [1], rate: 0.85, mode: "all", listen: false, events: 0 },
  { id: 2, name_zh: "一般",
    desc_zh: "現場最常聽到的說法。偶爾會有突發狀況。",
    pick: [1, 2], rate: 1, mode: "ja", listen: false, events: 0.4 },
  { id: 3, name_zh: "老手",
    desc_zh: "真實速度，先只聽聲音、答完才看字幕。常常有突發狀況。",
    pick: [2, 3], rate: 1.15, mode: "ja", listen: true, events: 0.8 }
];
