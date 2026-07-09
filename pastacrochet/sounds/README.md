# 音效檔清單（待補）

把對應檔名的 mp3 丟進本資料夾即可，**不用改程式**（`js/config.js` 的 `SOUNDS` 表已接好；缺檔會靜默略過，console 有一次性彙報）。

格式建議：mp3、44.1kHz；BGM 需可無縫循環；短音效 < 1 秒為佳。

| 檔名 | 用途 | 循環 | 備註 |
|------|------|:----:|------|
| `bgm_menu.mp3` | 選單／準備畫面 BGM | ✅ | 溫暖、慢板 |
| `bgm_cooking.mp3` | 烹飪中 BGM | ✅ | 輕快、有節奏感（玩家會跟著節奏點） |
| `sfx_ui_click.mp3` | 介面按鈕點擊 | | |
| `sfx_order_open.mp3` | 訂單／翻卡出現 | | 紙張或翻牌聲 |
| `sfx_countdown.mp3` | 倒數 3-2-1（每聲） | | 短「嗶」或木魚 |
| `sfx_go.mp3` | 開始！ | | 比倒數亮一階 |
| `sfx_hit_perfect.mp3` | 完美點擊 | | 清脆「啵」，最常聽到的聲音，要好聽 |
| `sfx_hit_ok.mp3` | 不完美點擊 | | 普通悶一點 |
| `sfx_hit_bad.mp3` | 超級不完美 | | 悶、低 |
| `sfx_hit_wrong.mp3` | 按錯鍵（鍵盤盤） | | 短促「噗」 |
| `sfx_combo.mp3` | 三連完美歡呼 | | 人群歡呼或鈴鐺琶音 |
| `sfx_serve.mp3` | 起鍋／上菜 | | 盤子放桌＋鈴 |
| `sfx_topping_drop.mp3` | 配料落盤（咚） | | 會隨機變調重複播 |
| `sfx_burnt.mp3` | 燒焦警報 | | 短警示音 |
| `sfx_result.mp3` | 結算亮分 | | |
| `sfx_win.mp3` | 優勝（雙店競賽） | | 小號 fanfare |
| `sfx_score_tick.mp3` | 分數滾動（選配） | | 目前未接，保留 |

音量比例已在 `config.js` 各檔 `vol` 欄位預設好，可再調。
