# 《毛線麵餐廳》Midjourney 重繪 prompts

目標：把 `game.html` 使用的圖片統一成 `assets/new/menu_bg01.png` 的世界觀——深祖母綠、薄荷綠、奶油白、番茄橘紅；大量室內植物；溫暖午後光；厚塗平面筆觸；食材、毛球、鉤針自然共存。

## 先固定生成方式

1. 全套 prompt 已使用 `assets/new/menu_bg01.png` 的 Midjourney 圖片網址作為 Style Reference。
2. 固定參考網址：`https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png`。若未來更換風格基準圖，請統一替換此網址。
3. 整批使用目前最新的 `--v 8.2` 與你的 `--profile zsa6tcc`。V8.2 對美感、畫質與 Personalization 的理解更好；現有新圖則透過 `--sref` 延續畫風。
4. 場景圖用 `--chaos 6`；角色與物件用 `--chaos 3`，避免 V8.2 較大膽的美感表現讓同批素材漂移太大。
5. Midjourney 不會可靠產出真正透明背景。角色與物件先生成「純薄荷綠底」，選圖後再去背輸出 PNG。
6. 圖上不要讓 Midjourney 生成正式文字。Logo、招牌、菜單文字應後製加入，否則字形很容易錯。

### 場景共用尾碼

```text
--sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 250 --chaos 6 --ar 16:9 --profile zsa6tcc --stylize 180 --v 8.2 --no readable text, letters, watermark, logo
```

### 角色共用尾碼

```text
--sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 220 --chaos 3 --ar 4:5 --profile zsa6tcc --stylize 150 --v 8.2 --no text, letters, watermark, border, frame, scenery
```

### 正方形物件／圖示共用尾碼

```text
--sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery
```

---

## A. 場景圖（最高優先）

### `menu_bg.png` — 主選單背景

> UI 卡片會放在左側，所以左邊 40% 必須低細節、低對比；主廚放右側。

```text
一間把義大利麵料理與鉤針編織結合的溫室餐廳廚房，畫面右側三分之一站著一位可愛但不幼稚的無尾熊主廚，穿奶油白圍裙與廚師帽，正在用鉤針把金黃色毛線編成義大利麵，料理台上有番茄、羅勒、玻璃醬料罐、毛球與鉤針，背景長滿層次豐富的綠色植物，深祖母綠牆面，番茄橘紅小面積點綴，溫暖午後陽光由右側窗戶斜射，左側 40% 保留乾淨的深綠牆面與柔和植物陰影供遊戲選單覆蓋，視線焦點清楚，厚塗平面插畫，細微畫布與刮刀筆觸，沉靜、手作、帶一點魔法感 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 250 --chaos 6 --ar 16:9 --profile zsa6tcc --stylize 180 --v 8.2 --no readable text, letters, watermark, logo
```

### `story1.png` — 餐廳外觀與排隊客人

> 對話框在右下，右下角要保留低細節空間。

```text
綠意包圍、正在熱鬧營業的編織義大利麵小餐廳外觀，溫馨童話老屋立面、深綠遮陽棚與發出暖黃光的大片窗戶，窗邊與屋簷擺滿香草盆栽和垂墜藤蔓；門前有九位由毛線與布料做成的可愛動物娃娃客人形成熱鬧隊伍，包括兔子、熊、羊、烏龜、貓、狐狸、刺蝟與小象，每位角色姿勢與動作都不同，有的聊天、有的牽手、有的探頭看櫥窗、有的抱著毛線球、有的興奮舉起鉤針，店員在門口微笑招呼，櫥窗內清楚展示多盤色彩不同的毛線義大利麵、鉤針與醬料罐，植物之間掛著小型暖黃燈串，番茄紅花盆、奶油白牆面與綠色植物形成豐富層次，像受歡迎的社區餐廳開幕日，歡迎、溫暖、充滿人情味與小故事，畫面有許多生活細節但角色輪廓清楚、不擁擠混亂；右下角保留一大片較暗、低對比、低細節的石板路與柔和植物陰影供遊戲對話框覆蓋，厚塗平面敘事插畫，深祖母綠主色，溫暖金色午後陽光，細微畫布與刮刀筆觸 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 250 --chaos 8 --ar 16:9 --profile zsa6tcc --stylize 200 --v 8.2 --no readable text, letters, watermark, logo, empty street, lonely mood, photorealism
```

### `story2.png` — 店內客滿

> 對話框在中上，頂部中央必須簡潔。

```text
編織義大利麵餐廳客滿時最溫馨熱鬧的用餐區，三張木桌坐滿十至十二位不同材質與體型的動物娃娃客人，包括兔子、熊、羊、貓、浣熊、獾、老鼠、刺蝟與貓頭鷹，每位客人都有清楚且不同的互動：分享一盤像鉤針蕾絲圓盤的毛線義大利麵、用餐叉捲起毛線麵、舉杯聊天、小朋友踮腳看鄰桌餐點、店員端著兩盤熱騰騰料理穿過桌間；桌上有不同顏色的義大利麵、番茄醬、羅勒、餐具、小花瓶與少量毛球，椅背披著手織小毯子，牆面掛著由蔬菜與毛線構成的手作裝飾，兩側充滿高低錯落的室內植物與香草盆栽，深祖母綠拱形牆、番茄橘紅座椅與奶油白桌巾，窗外午後光穿過植物形成溫暖光斑，空間忙碌、有人情味、充滿談笑與食物香氣，但視覺層級清楚、不雜亂；畫面上方中央保留寬闊、純淨、低對比的深綠拱牆供遊戲對話框覆蓋，所有人物集中在中下半部，厚塗平面敘事插畫，細微畫布與刮刀筆觸 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 250 --chaos 8 --ar 16:9 --profile zsa6tcc --stylize 200 --v 8.2 --no readable text, letters, watermark, logo, empty tables, lonely mood, photorealism
```

### `story3.png` — CORA 接受考驗

> 對話框仍在中上，角色放中下或右側。

```text
編織義大利麵餐廳最忙碌又溫暖的開放式廚房與主廚試煉現場，無尾熊 CORA 站在畫面中下方偏右的視覺焦點，穿奶油白廚師帽與圍裙，一手快速使用鉤針、一手托著剛完成的金黃色毛線義大利麵圓盤，神情緊張但堅定；周圍有四至五位動物夥伴各自忙著工作，一位貓助手抱著不同顏色毛球跑過、一位兔子切番茄、一位刺蝟攪拌醬汁、一位小熊在料理台擺盤、一位貓頭鷹裁判拿著空白評分板專心觀察，廚房窗口外還可看到幾位娃娃客人期待地探頭觀看；前後料理台擺滿但排列有秩序的番茄、羅勒、蘑菇、玻璃醬料罐、蒸氣鍋具、鉤針與彩色毛球，空中有少量蒸氣、飄動的毛線尾端與歡呼的小紙花，背景是長滿植物的深祖母綠溫室廚房，暖黃吊燈與午後陽光共同照亮主角，場面像社區料理比賽高潮，熱鬧、團隊感、歡樂、緊張而溫馨，但主角輪廓與敘事焦點非常清楚；畫面上方中央保留乾淨、低對比、低細節的深綠牆面供遊戲對話框覆蓋，所有角色集中在中下半部，厚塗平面敘事插畫，細微畫布與刮刀筆觸 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 250 --chaos 8 --ar 16:9 --profile zsa6tcc --stylize 200 --v 8.2 --no readable text, letters, numbers, watermark, logo, empty kitchen, lonely mood, photorealism
```

---

## B. 對話 UI 背景

### `dialogBg.png`

```text
鉤針義大利麵餐廳的俯視工作桌，中央是一張非常大的橫向奶油白手工紙菜單，紙張佔畫面寬度 88% 與高度 86%，接近滿版但四周仍露出深祖母綠木桌，紙面完全空白、平坦、低紋理、足夠承載大量遊戲 UI，紙張左右兩欄區域都保持乾淨，四周邊緣才擺放茂密綠色植物、番茄、羅勒、蘑菇、毛球、鉤針與玻璃醬料瓶，食材與編織工具只形成窄窄的自然邊框，不能遮住中央紙面，深祖母綠主色、番茄橘紅點綴、午後柔光、厚塗平面插畫、細微畫布與刮刀筆觸，正上方俯視，對稱但保有自然手作感，背景圖只提供空白菜單底，所有文字與選項由 HTML UI 後製疊加 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 250 --chaos 4 --ar 16:9 --profile zsa6tcc --stylize 160 --v 8.2 --no text, letters, numbers, symbols, menu items, printed icons, watermark, logo, character, hands
```

### `dialogSay.png`

```text
橫向遊戲對話框裝飾底圖，長而寬的奶油白手工紙面板，深祖母綠細邊，圓角，左端纏著少量毛線與一支鉤針，右端點綴一顆番茄與兩片羅勒，中間 80% 完全空白供中文排字，厚塗平面插畫，細微紙張與畫布質感，純薄荷綠背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 10:3 --profile zsa6tcc --stylize 100 --v 8.2 --no text, letters, watermark, logo, character
```

---

## C. 主廚立繪

### `chef_koala.png`

```text
全身角色立繪，一位擬人化無尾熊主廚 CORA，柔和灰綠色毛皮，大圓耳與深色橢圓鼻，穿奶油白廚師帽、薄荷綠上衣與奶油白圍裙，圍裙只有小小番茄紅滾邊，左手拿木柄鉤針，右手抱著金黃色毛線球形義大利麵，自信溫和的微笑，正面略微四分之三角度，完整耳朵、手腳與道具都在畫面內，角色佔畫面 80%，厚塗平面角色插畫，細微乾刷筆觸，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 220 --chaos 3 --ar 4:5 --profile zsa6tcc --stylize 150 --v 8.2 --no text, letters, watermark, border, frame, scenery
```

### `chef_cat.png`

```text
全身角色立繪，一位擬人化三花貓主廚，臉部有橘色、黑色與奶油白三塊清楚色塊，穿奶油白廚師帽、深祖母綠上衣與奶油白圍裙，圍裙只有小小番茄紅滾邊，左手拿木柄鉤針，右手抱著橘紅色毛線球，神情聰明俐落又友善，正面略微四分之三角度，完整耳朵、尾巴、手腳與道具都在畫面內，角色佔畫面 80%，厚塗平面角色插畫，細微乾刷筆觸，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 220 --chaos 3 --ar 4:5 --profile zsa6tcc --stylize 150 --v 8.2 --no text, letters, watermark, border, frame, scenery
```

---

## D. 六位劇情／客人角色

共用構圖：半身偏全身、正面四分之三角度、單一角色佔畫面 75%、輪廓完整、純薄荷綠單色底。不要替每位角色換插畫流派，只改物種、服裝、表情與一件代表性道具。

### `char_suzi.png` — 幻想獨角獸

```text
角色立繪，一位夢幻但成熟的擬人化獨角獸 SUZI，奶油白毛色，淡粉與淡藍交織的柔軟鬃毛，小小金色角，穿番茄紅圍巾與奶油白洋裝，雙手捧著一盤像蕾絲花朵的粉紅毛線義大利麵，眼神充滿想像力，身邊只有兩顆極小星光，不要甜點，不要漂浮食物，厚塗平面角色插畫，深綠與番茄紅點綴，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 220 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 150 --v 8.2 --no text, letters, watermark, border, frame, scenery
```

### `char_shulei.png` — 格局象

```text
角色立繪，一位擬人化亞洲象「蔬蕾」，灰綠色皮膚，大耳朵，神情講究而親切，穿剪裁俐落的深祖母綠工作背心與奶油白襯衫，胸前有一枚小番茄紅花別針，鼻子拿著一支鉤針，手上端著擺盤非常整齊的毛線義大利麵，職人味覺社交家的氣質，厚塗平面角色插畫，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 220 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 150 --v 8.2 --no text, letters, watermark, border, frame, scenery
```

### `char_manshu.png` — 慢熟貓

```text
角色立繪，一位擬人化橘白虎斑貓「慢熟媽媽」，圓潤柔和，穿寬鬆奶油白針織上衣與深綠圍裙，披著一條番茄紅小毯子，懷裡抱著一碗溫暖的毛線義大利麵，表情有一點害羞、很放鬆、像在家追劇，宅系療癒氣質，厚塗平面角色插畫，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 220 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 150 --v 8.2 --no text, letters, watermark, border, frame, scenery
```

### `char_wenhua.png` — 文化豹

```text
角色立繪，一位擬人化台灣女性花豹研究員「文化豹」，成年女性，金棕毛色與自然克制的深色斑點，明亮有神的眼睛、爽朗親切的笑容，姿態自信放鬆、願意傾聽也樂於分享；她是一位研究台灣飲食、工藝與地方生活的田野文化研究員，戴簡潔圓框眼鏡，穿現代剪裁的深祖母綠短版研究外套、奶油白襯衫、舒適卡其長褲與番茄紅布鞋，斜背一個帶有低調台灣藺草編織紋理的田野包，衣領只有一小段取自台灣花磚配色的幾何織帶，不穿古裝；左手拿著貼有幾張無文字色票與植物標本的田野筆記本，右手展示一小塊受台灣老花磚與窗花幾何啟發的鉤針織片，包裡露出鉛筆、小型放大鏡、錄音筆與一束稻穗，文化線索細緻自然、不堆砌符號；整體像一位會走訪市場、老街、部落與農村，尊重傳統也接受新觀點的當代台灣研究者，知性但不嚴肅，開朗、開明、好奇、有行動力，正面略微四分之三角度，半身偏全身，完整耳朵、尾巴、手腳與道具都在畫面內，角色佔畫面 78%，厚塗平面角色插畫，深祖母綠、奶油白、番茄橘紅與稻穗金配色，細微乾刷與畫布筆觸，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 220 --chaos 3 --ar 4:5 --profile zsa6tcc --stylize 150 --v 8.2 --no text, letters, watermark, border, frame, scenery, crown, luxury jewelry, ancient costume, ceremonial costume, stereotype, stern expression, laboratory coat, test tube
```

### `char_nuangua.png` — 靜味貓頭鷹

```text
角色立繪，一位擬人化圓臉貓頭鷹「暖瓜」，橄欖綠、奶油白與暖棕羽毛，穿簡潔的深綠圍巾，雙翅安穩捧著一小碗冒著淡淡熱氣的毛線義大利麵，眼神安靜、敏銳、值得信賴，只有一小片羅勒作點綴，厚塗平面角色插畫，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 220 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 150 --v 8.2 --no text, letters, watermark, border, frame, scenery
```

### `char_feili.png` — 工程河狸／掌門人

```text
角色立繪，一位擬人化工程河狸「飛狸」，棕色毛皮、寬扁尾巴，穿深祖母綠工作圍裙，圍裙口袋放著鉤針、量尺與小線軸，戴圓形護目鏡但眼睛清楚可見，手上端著分成四種醬色區域的精密毛線義大利麵，神情自信、機靈、有掌門人氣場，不要機械手臂，不要科幻盔甲，厚塗平面角色插畫，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 220 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 150 --v 8.2 --no text, letters, watermark, border, frame, scenery
```

---

## E. 醬汁圖示（7 張）

統一格式：俯視 15 度的淺奶油色陶碗，碗完整置中、同尺寸、單一醬汁，不要義大利麵，不要湯匙，純薄荷綠底。

### `sauce_red.png` — 紅醬

```text
遊戲料理選單的單一醬汁圖示，一碗濃稠鮮紅的番茄紅醬，中央只有一片新鮮羅勒葉，醬汁表面可見少量番茄籽與細小香草碎，盛在淺奶油色手作陶碗中，俯視 15 度，碗完整置中並佔畫面 78%，輪廓清楚，厚塗平面靜物插畫，細微乾刷與陶土質感，深祖母綠陰影，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, spoon, pasta
```

### `sauce_white.png` — 白醬

```text
遊戲料理選單的單一醬汁圖示，一碗濃稠滑順的奶油白醬，表面只有細小黑胡椒與一片鼠尾草葉，帶柔和奶油光澤，盛在淺奶油色手作陶碗中，俯視 15 度，碗完整置中並佔畫面 78%，輪廓清楚，厚塗平面靜物插畫，細微乾刷與陶土質感，深祖母綠陰影，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, spoon, pasta
```

### `sauce_green.png` — 青醬

```text
遊戲料理選單的單一醬汁圖示，一碗濃稠的深綠羅勒青醬，醬汁帶自然深淺綠層次，可見細碎羅勒與少量松子顆粒，盛在淺奶油色手作陶碗中，俯視 15 度，碗完整置中並佔畫面 78%，輪廓清楚，厚塗平面靜物插畫，細微乾刷與陶土質感，番茄紅極小面積點綴，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, spoon, pasta
```

### `sauce_aglio.png` — 清炒

```text
遊戲料理選單的單一醬汁圖示，一碗清澈溫暖的金黃色橄欖油清炒醬，表面有三片薄蒜片、少量紅椒碎與細小綠色香草，液體帶克制的透明金色光澤，盛在淺奶油色手作陶碗中，俯視 15 度，碗完整置中並佔畫面 78%，輪廓清楚，厚塗平面靜物插畫，細微乾刷與陶土質感，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, spoon, pasta
```

### `sauce_pink.png` — 粉紅醬

```text
遊戲料理選單的單一醬汁圖示，一碗濃稠柔滑的奶油番茄粉紅醬，柔和珊瑚粉色，中央只有一圈簡潔的奶油旋紋，盛在淺奶油色手作陶碗中，俯視 15 度，碗完整置中並佔畫面 78%，輪廓清楚，厚塗平面靜物插畫，細微乾刷與陶土質感，深祖母綠陰影，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, spoon, pasta
```

### `sauce_soda.png` — 彈珠汽水

```text
遊戲料理選單的奇幻單一醬汁圖示，一碗清澈天空藍色的彈珠汽水風格醬汁，液體中有細小氣泡，中央只有一顆透明玻璃彈珠，整體仍像可以加入奇幻義大利麵的料理醬汁而不是飲料，盛在淺奶油色手作陶碗中，俯視 15 度，碗完整置中並佔畫面 78%，輪廓清楚，厚塗平面靜物插畫，細微乾刷與陶土質感，深祖母綠陰影，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, spoon, pasta, bottle, glass, straw
```

### `sauce_squid.png` — 墨魚醬

```text
遊戲料理選單的單一醬汁圖示，一碗濃稠的墨黑色墨魚醬，表面帶克制的深祖母綠高光，中央只有一個簡潔的奶油白魷魚圈，盛在淺奶油色手作陶碗中，俯視 15 度，碗完整置中並佔畫面 78%，輪廓清楚，厚塗平面靜物插畫，細微乾刷與陶土質感，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, spoon, pasta
```

---

## F. 配料圖示（9 張）

統一格式：單一配料成組置中、3/4 俯視、輪廓清楚、沒有盤子。生成時要寫「一組」而非「散落滿桌」，避免每張密度不同。

### `topping_tomato.png` — 番茄

```text
遊戲料理選單的單一配料圖示，一組三片厚切熟番茄圓片，清楚可見番茄籽、果肉與自然不規則邊緣，鮮明但克制的番茄橘紅色，只有番茄這一種食材，3/4 俯視，三片略微重疊並完整置中，整組佔畫面 72%，外輪廓清楚，厚塗平面靜物插畫，細微乾刷筆觸，深祖母綠陰影，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, plate, bowl, table
```

### `topping_Calamari.png` — 魷魚圈

```text
遊戲料理選單的單一配料圖示，一組三個奶油白色熟魷魚圈，厚度一致、柔軟微彎，帶少量深祖母綠陰影，只有魷魚圈這一種食材，3/4 俯視，三個圈略微交疊並完整置中，整組佔畫面 72%，外輪廓清楚，厚塗平面靜物插畫，細微乾刷筆觸，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, plate, bowl, table, tentacles, whole squid
```

### `topping_basil.png` — 羅勒

```text
遊戲料理選單的單一配料圖示，一組五片新鮮羅勒葉，深淺祖母綠層次、明確葉脈與自然微彎葉緣，只有羅勒這一種食材，3/4 俯視，五片葉子排列成集中而清楚的小扇形並完整置中，整組佔畫面 72%，外輪廓清楚，厚塗平面靜物插畫，細微乾刷筆觸，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, plate, bowl, table, flower, branch
```

### `topping_cheese.png` — 起司

```text
遊戲料理選單的單一配料圖示，一小撮淡金黃色刨絲起司，短而自然彎曲的起司絲蓬鬆堆疊，但整體輪廓集中清楚，只有起司這一種食材，3/4 俯視，完整置中並佔畫面 72%，厚塗平面靜物插畫，細微乾刷筆觸，深祖母綠陰影，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, plate, bowl, table, cheese wheel, cheese block, grater
```

### `topping_mushroom.png` — 蘑菇

```text
遊戲料理選單的單一配料圖示，一組三片淺棕色蘑菇縱切片，切面清楚可見菌褶、菌柄與柔和奶油色內部，只有蘑菇這一種食材，3/4 俯視，三片略微重疊並完整置中，整組佔畫面 72%，外輪廓清楚，厚塗平面靜物插畫，細微乾刷筆觸，深祖母綠陰影，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, plate, bowl, table, whole mushroom
```

### `topping_blueberry.png` — 藍莓

```text
遊戲料理選單的單一配料圖示，一組五顆成熟的深藍紫色藍莓，每顆大小相近，頂端有清楚的五角星形果冠，表皮帶灰綠色霧面高光，只有藍莓這一種食材，3/4 俯視，五顆集中成乾淨小組並完整置中，整組佔畫面 72%，外輪廓清楚，厚塗平面靜物插畫，細微乾刷筆觸，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, plate, bowl, table, leaves, branch
```

### `topping_bacon.png` — 培根

```text
遊戲料理選單的單一配料圖示，一組三段捲曲的熟培根，磚紅色瘦肉與奶油白色油花形成清楚條紋，邊緣微脆但沒有燒焦，只有培根這一種食材，3/4 俯視，三段交錯排列並完整置中，整組佔畫面 72%，外輪廓清楚，厚塗平面靜物插畫，細微乾刷筆觸，深祖母綠陰影，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, plate, bowl, table, egg, toast
```

### `topping_broccoli.png` — 花椰菜

```text
遊戲料理選單的單一配料圖示，一組三小朵熟綠花椰菜，深祖母綠花球、較淡的粗短莖，花球表面帶像手作毛線團般細緻集中的顆粒感，但仍明確看得出是花椰菜，只有花椰菜這一種食材，3/4 俯視，三朵集中排列並完整置中，整組佔畫面 72%，外輪廓清楚，厚塗平面靜物插畫，細微乾刷筆觸，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, plate, bowl, table, whole broccoli head
```

### `topping_caviari.png` — 魚子醬

```text
遊戲料理選單的單一配料圖示，一小匙份量的墨黑色魚子醬圓珠堆，每顆圓珠大小一致、帶克制的深綠高光，集中成一座乾淨緊實的小丘，只有魚子醬這一種食材，不出現湯匙，3/4 俯視，完整置中並佔畫面 68%，外輪廓清楚，厚塗平面靜物插畫，細微乾刷筆觸，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, watermark, border, frame, scenery, plate, bowl, table, spoon, jar, fish
```

---

## G. 小型 UI 圖示

這批圖在遊戲裡顯示很小，重點是「大形狀清楚」，不要複雜背景。每張生成後裁成正方形並去背。

共用 prompt：

```text
休閒料理遊戲的單一 UI 徽章，[主體描述]，置中，粗而柔和的外輪廓，最多三種主色，深祖母綠、奶油白、番茄橘紅配色，厚塗平面插畫與極少量畫布筆觸，小尺寸仍清楚，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 180 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 90 --v 8.2 --no text, letters, numbers, watermark, border, frame, scenery
```

| 檔名 | 主體描述 |
|---|---|
| `serve.png` | 奶油白餐盤，上面放一盤毛線義大利麵，旁邊一支小鉤針 |
| `combo.png` | 番茄紅與金黃色毛線交織成放射狀慶祝花朵，兩顆小星光 |
| `versus.png` | 兩支鉤針像劍一樣交叉，中間是一顆小毛線球 |
| `mascot_yarn.png` | 有眼睛與微笑的小毛線球吉祥物，拿一支迷你鉤針 |
| `diff_fire1.png` | 由番茄紅、橘色與奶油黃毛線織成的火焰 |
| `lead_crown.png` | 深綠與金黃色毛線編成的簡潔皇冠 |
| `grade_perfect.png` | 金黃色四角星與一個小小完美鉤針針目 |
| `grade_ok.png` | 深綠色圓形勾號，由一段毛線構成 |
| `grade_bad.png` | 番茄紅鬆脫針目與一小滴汗 |
| `grade_miss.png` | 一段斷掉的奶油白毛線與番茄紅叉號；目前程式會用到但檔案缺少，建議補上 |
| `done_raw.png` | 偏冷的淡綠毛線義大利麵，旁邊一片小雪花 |
| `done_almost.png` | 淡黃色毛線義大利麵，只有一小縷蒸氣 |
| `done_perfect.png` | 金黃色毛線義大利麵，柔和蒸氣與一顆小星光 |
| `done_over.png` | 橘棕色略乾的毛線義大利麵，一角微捲 |
| `rank_rookie.png` | 木柄鉤針、奶油白小廚師帽與一顆毛線球 |
| `rank_bronze.png` | 銅色毛線編織獎章與小廚師帽；目前程式會用到但檔案缺少，建議補上 |
| `rank_silver.png` | 銀白毛線編織獎章與小廚師帽 |
| `rank_gold.png` | 金黃色毛線編織獎章與小廚師帽 |
| `rank_legend.png` | 深綠與金色桂冠圍住發光鉤針，頂端小星光 |
| `rank_champion.png` | 金色冠軍獎盃，杯身由毛線針目構成，兩側各一支鉤針 |
| `result_tie.png` | 兩個不同顏色的毛線球握手，中間平衡對稱 |
| `result_win.png` | 戴金色桂冠的毛線義大利麵餐盤，背後一顆星光 |

---

## H. Logo 與招牌

Midjourney 只負責生成「圖形標誌底稿」，中文與英文要在 Figma／Photoshop／Illustrator 後製，才能保證字正確。

### `logo.png`

```text
圓形餐廳品牌徽章的純圖形，一顆金黃色毛線球同時像一團義大利麵，兩支木柄鉤針交叉穿過毛線球，旁邊有一片羅勒與一顆小番茄，深祖母綠、奶油白、番茄橘紅與金黃色配色，厚塗平面插畫，中央構圖，外圈留出乾淨區域供後製加入品牌文字，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 1:1 --profile zsa6tcc --stylize 120 --v 8.2 --no text, letters, numbers, watermark, mockup, scenery
```

### `logo_signboard.png`

```text
橫向手作餐廳招牌，深祖母綠漆木底，奶油白內框，左側是一顆像義大利麵的金黃色毛線球與交叉鉤針圖形，右側保留寬闊乾淨區域供後製加入中文店名，角落只有少量番茄紅小花與羅勒，厚塗平面插畫，正面視角，純薄荷綠單色背景方便去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --chaos 3 --ar 8:3 --profile zsa6tcc --stylize 100 --v 8.2 --no text, letters, numbers, watermark, mockup, scenery
```

---

## I. 3D 材質圖（不要用一般插畫 prompt）

`yarn_color.png`、`yarn_bump.png`、`hook_wrap.png` 是 Three.js 材質，不宜做成有光影的普通插畫。需要無方向光、可平鋪、正交視角。

### `yarn_color.png`

```text
seamless tileable albedo texture of tightly twisted cream colored cotton yarn fibers, uniform color, orthographic macro scan, diffuse flat lighting, no shadows, no highlights, no depth of field, evenly distributed fiber detail --tile --ar 4:1 --stylize 40 --v 8.2
```

### `yarn_bump.png`

```text
seamless tileable grayscale height texture of tightly twisted cotton yarn fibers, neutral gray base, fine raised strands, orthographic macro scan, flat technical lighting, no color, no shadows, no highlights, evenly distributed detail --tile --ar 4:1 --stylize 20 --v 8.2
```

### `hook_wrap.png`

```text
seamless tileable albedo texture for a handmade crochet hook handle wrapped with alternating deep forest green and tomato red cotton thread, narrow regular diagonal bands, orthographic flat scan, diffuse lighting, no shadows, no highlights, no object silhouette --tile --ar 6:5 --stylize 40 --v 8.2
```

---

## J. 批次 Icon 母版（推薦用這組維持一致性）

不要把 26 個圖示全部塞進同一張。推薦依類別生成 3 張母版，再沿著格線裁切；三張都使用相同的 Style Reference、`--seed 42817`、低 chaos、相同背景與筆觸。

### 織圖 Icon 母版 — 10 格，5×2

這張只做「選擇用的簡化圖形」，不畫真實毛線照片。排列順序固定為：

- 第一排：012 蕾絲圓盤、032 菱形、圓形 1、004 八瓣蕾絲圓盤、六角星。
- 第二排：圓形 2、六邊形、櫻花五瓣、八瓣花、六尖雪花。

```text
休閒料理遊戲的專業 icon sprite sheet，嚴格排列成 5 欄 × 2 排，共 10 個彼此獨立且大小完全一致的鉤針織圖圖示，每格保持相同內距與寬闊間隔，不可互相接觸；第一排由左到右依序是：三層同心蕾絲圓盤、雙層菱形、三層簡潔圓形、八瓣蕾絲花、六角星；第二排由左到右依序是：帶點狀外圈的四層圓形、雙層六邊形、五瓣櫻花、八瓣花、六向雪花；全部使用相同粗細的深祖母綠手繪線條，內部只有極淡奶油白平塗，簡單清楚、幾何化、正面平視、沒有透視、沒有陰影、不是照片、不是鉤織實物，純薄荷綠單色背景，方便逐格裁切與去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 180 --seed 42817 --chaos 0 --ar 5:2 --profile zsa6tcc --stylize 70 --v 8.2 --raw --hd --no text, letters, numbers, labels, watermark, border, frame, mockup, table, yarn photo, realistic crochet
```

### 醬料 Icon 母版 — 7 個，4×2

排列順序固定為：

- 第一排：紅醬、白醬、青醬、清炒。
- 第二排：粉紅醬、彈珠汽水、墨魚醬，最後一格留空。

```text
休閒料理遊戲的專業 food icon sprite sheet，嚴格排列成 4 欄 × 2 排，共 8 個等大格位，前 7 格各放一碗醬汁，右下最後一格完全留空；第一排由左到右依序是：中央一片羅勒的鮮紅番茄醬、帶黑胡椒與鼠尾草的奶油白醬、帶羅勒與松子顆粒的深綠青醬、帶蒜片與紅椒碎的金黃色橄欖油清炒醬；第二排由左到右依序是：帶奶油旋紋的珊瑚粉紅醬、帶細小氣泡與一顆透明彈珠的天空藍奇幻醬汁、帶一個白色魷魚圈的墨黑墨魚醬、空白；七個圖示都使用完全相同的淺奶油色手作陶碗、相同 15 度俯視角度、相同碗尺寸、相同光線、相同粗細輪廓與相同陰影方向，每格有寬闊間隔，不可互相接觸，厚塗平面靜物插畫，細微乾刷與陶土質感，純薄荷綠單色背景，方便逐格裁切與去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --seed 42817 --chaos 0 --ar 2:1 --profile zsa6tcc --stylize 90 --v 8.2 --raw --hd --no text, letters, numbers, labels, watermark, border, frame, scenery, table, spoon, pasta
```

### 配料 Icon 母版 — 9 個，5×2

排列順序固定為：

- 第一排：番茄、魷魚圈、羅勒、起司、蘑菇。
- 第二排：藍莓、培根、花椰菜、魚子醬，最後一格留空。

```text
休閒料理遊戲的專業 food topping icon sprite sheet，嚴格排列成 5 欄 × 2 排，共 10 個等大格位，前 9 格各放一組單一配料，右下最後一格完全留空；第一排由左到右依序是：三片厚切熟番茄圓片、三個奶油白熟魷魚圈、五片新鮮深綠羅勒葉、一小撮淡金黃色刨絲起司、三片淺棕蘑菇切片；第二排由左到右依序是：五顆深藍紫藍莓、三段磚紅色捲曲熟培根、三小朵深綠花椰菜、一小丘墨黑色魚子醬圓珠、空白；九組圖示都使用完全相同的 3/4 俯視角度、相同物件佔比、相同光線、相同粗細輪廓與相同陰影方向，每格只出現指定的一種配料，每格有寬闊間隔，不可互相接觸，不使用盤子或容器，厚塗平面靜物插畫，細微乾刷筆觸，純薄荷綠單色背景，方便逐格裁切與去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 200 --seed 42817 --chaos 0 --ar 5:2 --profile zsa6tcc --stylize 90 --v 8.2 --raw --hd --no text, letters, numbers, labels, watermark, border, frame, scenery, plate, bowl, table, spoon
```

### 小型 UI Icon 母版 A — 操作、判定與熟度，14 個，4×4

排列順序固定為：

- 第一排：起鍋、Combo、對戰、毛線吉祥物。
- 第二排：難度火焰、領先皇冠、完美判定、不錯判定。
- 第三排：超糟判定、漏針、沒熟、差點熟。
- 第四排：完美熟度、過熟、空白、空白。

```text
休閒料理與鉤針編織遊戲的專業 UI icon sprite sheet，嚴格排列成 4 欄 × 4 排，共 16 個大小完全一致的正方形格位，前 14 格各放一個彼此獨立的圖示，最後兩格完全留空；第一排由左到右依序是：裝著毛線義大利麵並配一支小鉤針的奶油白餐盤、番茄紅與金黃色毛線交織成的放射狀慶祝花朵與兩顆小星光、兩支像劍一樣交叉且中央有小毛線球的鉤針、有眼睛和微笑並拿迷你鉤針的小毛線球吉祥物；第二排由左到右依序是：由番茄紅橘色奶油黃毛線織成的火焰、深綠與金黃色毛線編成的簡潔皇冠、金黃色四角星與一個小小完美鉤針針目、由一段深綠毛線構成的圓形勾號；第三排由左到右依序是：番茄紅鬆脫針目與一小滴汗、一段斷掉的奶油白毛線與番茄紅叉號、偏冷淡綠色毛線義大利麵與一片小雪花、淡黃色毛線義大利麵與一小縷蒸氣；第四排由左到右依序是：金黃色毛線義大利麵與柔和蒸氣及一顆小星光、橘棕色略乾毛線義大利麵且一角微捲、空白、空白；所有圖示使用相同大小、相同置中比例、相同粗而柔和的深祖母綠外輪廓、相同正面略帶俯視角度、相同光線與陰影方向，最多使用深祖母綠、奶油白、番茄橘紅、金黃色四種主色，厚塗平面遊戲插畫，細微乾刷與畫布筆觸，小尺寸仍清楚，每格保留寬闊間隔，不可互相接觸，純薄荷綠單色背景，方便逐格裁切與去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 190 --seed 42817 --chaos 0 --ar 1:1 --profile zsa6tcc --stylize 75 --v 8.2 --raw --hd --no text, letters, numbers, labels, watermark, border, frame, mockup, scenery, table, character, hands
```

對應檔名順序：

| 排列 | 檔名 |
|---|---|
| 1-1 | `serve.png` |
| 1-2 | `combo.png` |
| 1-3 | `versus.png` |
| 1-4 | `mascot_yarn.png` |
| 2-1 | `diff_fire1.png` |
| 2-2 | `lead_crown.png` |
| 2-3 | `grade_perfect.png` |
| 2-4 | `grade_ok.png` |
| 3-1 | `grade_bad.png` |
| 3-2 | `grade_miss.png` |
| 3-3 | `done_raw.png` |
| 3-4 | `done_almost.png` |
| 4-1 | `done_perfect.png` |
| 4-2 | `done_over.png` |

### 小型 UI Icon 母版 B — 排行與結算，8 個，4×2

排列順序固定為：

- 第一排：見習、銅牌、銀牌、金牌。
- 第二排：傳說、冠軍、平手、獲勝。

```text
休閒料理與鉤針編織遊戲的專業 achievement UI icon sprite sheet，嚴格排列成 4 欄 × 2 排，共 8 個大小完全一致且彼此獨立的排行與結算徽章；第一排由左到右依序是：木柄鉤針加奶油白小廚師帽與一顆毛線球的見習徽章、銅色毛線編織獎章與小廚師帽、銀白色毛線編織獎章與小廚師帽、金黃色毛線編織獎章與小廚師帽；第二排由左到右依序是：深綠與金色桂冠圍住發光鉤針且頂端有小星光的傳說徽章、杯身由毛線針目構成且兩側各有一支鉤針的金色冠軍獎盃、兩個不同顏色毛線球握手且構圖平衡對稱的平手圖示、戴金色桂冠且背後有一顆星光的毛線義大利麵餐盤獲勝圖示；八個圖示使用相同大小、相同置中比例、相同粗而柔和的深祖母綠外輪廓、相同正面略帶俯視角度、相同光線與陰影方向，深祖母綠、奶油白、番茄橘紅、金銀銅金屬色的統一配色，級別越高裝飾可逐步增加但輪廓保持清楚，厚塗平面遊戲插畫，細微乾刷與畫布筆觸，小尺寸仍清楚，每格保留寬闊間隔，不可互相接觸，純薄荷綠單色背景，方便逐格裁切與去背 --sref https://cdn.midjourney.com/5ea64f8e-acff-48ee-a041-2c70ca32c0af/0_1.png --sw 190 --seed 42817 --chaos 0 --ar 2:1 --profile zsa6tcc --stylize 75 --v 8.2 --raw --hd --no text, letters, numbers, labels, watermark, border, frame, mockup, scenery, table, character, hands
```

對應檔名順序：

| 排列 | 檔名 |
|---|---|
| 1-1 | `rank_rookie.png` |
| 1-2 | `rank_bronze.png` |
| 1-3 | `rank_silver.png` |
| 1-4 | `rank_gold.png` |
| 2-1 | `rank_legend.png` |
| 2-2 | `rank_champion.png` |
| 2-3 | `result_tie.png` |
| 2-4 | `result_win.png` |

> Midjourney 即使寫了「嚴格排列」仍可能偶爾漏項或重複。先挑排列最準的一版，再用 Editor 修正單一格，比把 26 個 icon 一次生成穩定。

---

## 建議出圖順序

1. 先出 `menu_bg.png`，確認綠色深淺與筆觸。
2. 再出 `story1–3.png`，確認三張放在一起像同一段故事。
3. 出兩位主廚，先定義角色比例與服裝。
4. 出六位角色，保持同一裁切、背景色與角色佔比。
5. 使用三張 Icon 母版一次確立織圖、醬汁與配料的類別內風格，再逐格裁切。
6. 最後才出 UI 圖示、Logo 與材質，避免前期為小圖消耗太多時間。

保留原始生成圖；真正放入遊戲時，再統一裁切成現有檔案比例與尺寸。場景至少 1920×1080，角色至少 1024px 高，物件／圖示至少 512×512，再由後製縮小。
