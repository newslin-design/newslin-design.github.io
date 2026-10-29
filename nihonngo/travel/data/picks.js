/* 社群推薦必買（資訊層：會隨時間變，所以跟場景台詞分開放）。
   第一版先寫死；之後由 LLM 收集資訊的流程定期更新這個檔：
   搜尋整理成草稿 → 人確認 → 發布。玩的時候不呼叫 AI（維持 A 型・Level 1）。
   文章和社群貼文不整段搬，只寫摘要；查到的出處記在 src，給確認的人看。
     chain：哪一家　item：店內買得到的商品（場景 items 的 id），有寫的話熱點和單字卡上會標「社群推薦」
     card_zh：單字卡上那一行（沒寫就用 why_zh）　ask：要跟店員點的，附一句怎麼說
     status：draft = 草稿，reviewed = 確認過 */
window.PICKS = window.PICKS || {};

window.PICKS["konbini"] = {
  title_ja: "SNSで{話題|わだい}",
  title_zh: "社群推薦必買",
  updated: "2026-10",
  note_zh: "整理自網路上的推薦文章、口碑排行和新聞。商品、口味、價格會變，以店裡實際為準。",
  list: [
    { id: "karaage-kun", chain: "Lawson",
      ja: "からあげクン", romaji: "karaage kun", zh: "炸雞塊",
      why_zh: "Lawson 的招牌炸雞塊，1986 年開賣，2026 年剛好 40 週年，還被金氏世界紀錄認定為賣得最多的現炸炸雞塊品牌。放在櫃檯旁的保溫櫃，要跟店員點。",
      ask: { ja: "からあげクン、ひとつください", romaji: "karaage kun, hitotsu kudasai", zh: "請給我一份からあげクン" },
      src: ["https://www.watch.impress.co.jp/docs/news/2099372.html",
            "https://news.mynavi.jp/article/20260407-4307658/"],
      status: "draft" },

    { id: "tsunamayo", chain: "各家都有", item: "onigiri",
      ja: "ツナマヨおにぎり", romaji: "tsunamayo onigiri", zh: "鮪魚美乃滋飯糰",
      why_zh: "日本飯糰協會（おにぎり協会）統計 2025 年的飯糰人氣，7-11、全家、Lawson、MINISTOP 四家的第一名全都是它。",
      card_zh: "飯糰最受歡迎的口味是「ツナマヨ」（鮪魚美乃滋）：2025 年日本四大超商的人氣第一名都是它。",
      src: ["https://www.appbank.net/2026/01/27/casual-food/2917402.php",
            "https://nlab.itmedia.co.jp/cont/articles/3711046/"],
      status: "draft" },

    { id: "tamago-sando", chain: "各家都有", item: "sandwich",
      ja: "たまごサンド", romaji: "tamago sando", zh: "雞蛋沙拉三明治",
      why_zh: "外國旅客最常推薦的超商美食之一。7-11、全家、Lawson 都有，口味各有特色，可以買來比比看。",
      card_zh: "三明治最常被推薦的是「たまごサンド」（雞蛋沙拉三明治），外國旅客很愛，三家都有。",
      src: ["https://japan.recipetineats.com/japanese-7-eleven-egg-sandwich-tamago-sando/",
            "https://www.businessinsider.jp/article/2606-best-egg-sandwich-japan-conbini-7-eleven-lawson-family-mart/"],
      status: "draft" },

    { id: "famichiki", chain: "全家",
      ja: "ファミチキ", romaji: "famichiki", zh: "全家炸雞",
      why_zh: "全家的招牌無骨炸雞，2026 年 8 月美食口碑網站的熱食排行排第二。一樣在櫃檯，要跟店員點。",
      ask: { ja: "ファミチキ、ひとつください", romaji: "famichiki, hitotsu kudasai", zh: "請給我一個ファミチキ" },
      src: ["https://mognavi.jp/konbini-hotsnack/ranking/2"],
      status: "draft" },

    { id: "butaman", chain: "7-11",
      ja: "{豚|ぶた}まん", romaji: "butaman", zh: "肉包",
      why_zh: "7-11 的肉包，同一個熱食排行排第三。主要在秋冬賣，放在櫃檯的蒸籠裡，也要跟店員點。東京也常叫「肉まん（にくまん）」。",
      ask: { ja: "{豚|ぶた}まん、ひとつください", romaji: "butaman, hitotsu kudasai", zh: "請給我一個肉包" },
      src: ["https://mognavi.jp/konbini-hotsnack/ranking/2"],
      status: "draft" }
  ]
};
