# 新美術素材對照

`game-new.html` 使用此資料夾；原始 Midjourney 輸出保留在 `assets/new/`，沒有改名或覆寫。

## 完整場景與 UI 底圖

| 新檔名 | 用途 | 處理 |
|---|---|---|
| `menu_bg.png` | 新頁首頁場景 | 複製、語意命名 |
| `setup_bg.png` | 模式／隊伍設定背景 | 複製、語意命名 |
| `story1.png` | 故事第一幕 | 複製、語意命名 |
| `story2.png` | 故事第二幕 | 複製、語意命名 |
| `story3.png` | 故事第三幕 | 複製、語意命名 |
| `dialogBg.png` | 點餐頁早期背景候選 | 複製、語意命名；目前新頁改用 `assets/new` 內較大的白紙版 |
| `dialogSay.png` | 點餐角色對話橫幅 | 複製、語意命名 |
| `home_logo.png` | 新頁首頁 Logo 圖 | 柔邊去背、置中、語意命名 |
| `order_menu_bg.png` | 點餐頁大白紙背景 | 複製、語意命名；菜單內容直接排在紙面上 |

## 角色與主廚（已去背）

| 新檔名 | 判斷角色 |
|---|---|
| `chef_koala.png` | CORA／無尾熊主廚 |
| `chef_cat.png` | 貓咪主廚 |
| `char_suzi.png` | SUZI |
| `char_shulei.png` | 蔬蕾／大象 |
| `char_manshu.png` | 慢熟媽媽／貓 |
| `char_wenhua.png` | 文化豹 |
| `char_nuangua.png` | 暖瓜／貓頭鷹 |
| `char_feili.png` | 飛狸／河狸 |

## 醬料母版切割（4 × 2）

依生成提示的固定順序切為：`sauce_red.png`、`sauce_white.png`、`sauce_green.png`、`sauce_aglio.png`、`sauce_pink.png`、`sauce_soda.png`、`sauce_squid.png`。全部已轉為透明 512 × 512 PNG。

## 配料母版切割（5 × 2）

使用輪廓較清楚的第二張母版，依序切為：`topping_tomato.png`、`topping_Calamari.png`、`topping_basil.png`、`topping_cheese.png`、`topping_mushroom.png`、`topping_blueberry.png`、`topping_bacon.png`、`topping_broccoli.png`、`topping_caviari.png`。全部已轉為透明 512 × 512 PNG。

## 織圖母版切割（5 × 2）

使用幾何辨識度較高的第二張母版，依序切為：`pattern_d012.png`、`pattern_d032.png`、`pattern_circle1.png`、`pattern_d004.png`、`pattern_star.png`、`pattern_circle2.png`、`pattern_hexagon.png`、`pattern_sakura.png`、`pattern_flower1.png`、`pattern_flower2.png`。全部已轉為透明 512 × 512 PNG。

## 小型 UI 母版切割

可明確判斷的前十格已切為：`serve.png`、`combo.png`、`versus.png`、`mascot_yarn.png`、`diff_fire1.png`、`lead_crown.png`、`grade_perfect.png`、`grade_ok.png`、`grade_bad.png`、`grade_miss.png`。

母版後六格生成內容偏離原規格，因此熟度、排行與結算圖示暫時複製原版素材作為穩定備援，沒有誤用生成失敗的圖。

## 重建方式

若 `assets/new/` 的原始圖片有更新，可執行：

```powershell
& 'C:\Users\s9348\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' '.\tools\process_new_assets.py'
```

腳本只寫入 `assets/v2/`，不修改原始 Midjourney 圖片。
