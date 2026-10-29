/* 單字。一個字寫一次，場景用 id 引用。
   ja 裡的 {漢字|かな} 會顯示成ルビ；發音念的是漢字原文（念錯時另寫 tts）。
   note_zh 是小知識，trap_zh 是給中文母語者的提醒。
   status：draft = AI 草稿，reviewed = 母語者確認過。
   主題單字卡之後也可以用這個格式，兩邊共用同一份單字。 */
window.WORDS = window.WORDS || {};

window.WORDS["onigiri"] = {
  ja: "おにぎり",
  romaji: "onigiri",
  zh: "飯糰",
  note_zh: "包裝上有 1→2→3 的編號，照順序拉開，海苔就不會破。",
  audio: null,
  status: "draft"
};

window.WORDS["bento"] = {
  ja: "お{弁当|べんとう}",
  romaji: "obentō",
  zh: "便當",
  note_zh: "結帳時店員會問要不要加熱。",
  audio: null,
  status: "draft"
};

window.WORDS["sandwich"] = {
  ja: "サンドイッチ",
  romaji: "sandoitchi",
  zh: "三明治",
  note_zh: "片假名，來自英文 sandwich。",
  audio: null,
  status: "draft"
};

window.WORDS["cupnoodle"] = {
  ja: "カップ{麺|めん}",
  romaji: "kappumen",
  zh: "泡麵",
  note_zh: "也常說「カップラーメン」。",
  audio: null,
  status: "draft"
};

window.WORDS["tea"] = {
  ja: "お{茶|ちゃ}",
  romaji: "ocha",
  zh: "茶",
  trap_zh: "日本的瓶裝「お茶」幾乎都是無糖的。",
  audio: null,
  status: "draft"
};

window.WORDS["beer"] = {
  ja: "ビール",
  romaji: "bīru",
  zh: "啤酒",
  note_zh: "片假名外來語。結帳時要確認年齡。",
  audio: null,
  status: "draft"
};

window.WORDS["coffee"] = {
  ja: "コーヒー",
  romaji: "kōhī",
  zh: "咖啡",
  note_zh: "咖啡不在貨架上拿：走到櫃檯跟店員說「コーヒーをお願いします」，付完錢拿到杯子，再自己來機器倒。",
  audio: null,
  status: "draft"
};
