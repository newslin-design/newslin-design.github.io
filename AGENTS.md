# AGENTS.md

靜態網站（GitHub Pages），純 HTML/CSS/JS、無建置步驟。包含兩個部分：

- **Blog** — 網站根目錄（`index.html`，`workName = "blog"`）。這是網域的「真正首頁」。
- **作品集 Portfolio** — `works/`（`works/index.html`，`workName = "home"`）。各作品為獨立 HTML 頁。

## 多語系架構（最重要，最容易改錯）

採「預設語言放根、翻譯放子資料夾」的標準 i18n 慣例：

| 語言 | 檔案位置 | `basePath` | CSS / JS 前綴 | builder 圖片前綴 |
|------|----------|-----------|---------------|------------------|
| **英文（預設）** | `works/a_xxx.html` | `""`（不設） | `style/` `js/` | `../image/builder/` |
| 中文 | `works/zh/a_xxx.html` | `"../"` | `../style/` `../js/` | `../../image/builder/` |
| 日文 | `works/ja/a_xxx.html` | `"../"` | `../style/` `../js/` | `../../image/builder/` |

每頁 head 用一行設定：`<script>workName = "a_xxx"; lang = "en";</script>`（英文不寫 `basePath`）。

**常見錯誤**：新增英文頁時直接複製 `zh/` 版的 head，連帶把 `basePath="../"`、`../style/`、`../../image/builder/` 一起搬過來 → 在 `works/` 根目錄全部多一層，導致 sidebar Home 跑到 blog、CSS 失效、圖片在 `file://` 失效。新增英文頁請以 `works/a_foodAnimal.html` 為樣板，不要複製 `zh/` 版。

> **不要**把英文頁搬進 `works/en/` 來「統一」。全站英文頁都在 `works/` 根，且 `app.js` 的語言切換寫死英文無前綴（`${workName}.html`）、中文 `zh/...`、日文 `ja/...`；搬資料夾等於要改寫共用邏輯與所有連結。

## app.js（`works/js/app.js`）

單一檔案，依 `workName` / `lang` / `basePath` 動態生成 header、sidebar（含 Home / 上一頁 / 下一頁 / Top）、footer，以及首頁卡片。

- `portfolioData` 物件是所有作品的**單一資料來源**（標題、描述、tags、卡片排版、`hasLocalPage`），含 `{en, zh, ja}` 多語系。新增/調整作品改這裡。
- `pageBasePath = basePath`、`imgBasePath = basePath + "../image/"`。
- **Sidebar Home** 連到 `${pageBasePath}index.html` = 各語言的**作品集首頁**（非 blog）。

## 圖片慣例

- 作品內文圖片放根目錄 `image/`，命名 `{workName}{流水號}.png`（如 `c_an0.png`）。`app.js` 會自動依序套 `imgBasePath + workName + num`。
- 圖片若**已寫明 `src`** 或標 `alt="no"`，則**不參與自動編號**（如 builder 系列用 `image/builder/` 的實拍圖）。
- Solution Builder 專案的截圖放 `image/builder/`（在 `image/` 底下自成一個子資料夾）。

## program/

一堆獨立小專案 / 實驗（各種測試頁、原型、工具，多為 ATEN 相關）。彼此不相干、也不屬於作品集主架構，各自有自己的資源與路徑慣例。**不適用上述 i18n / app.js / 圖片慣例**；要動到時針對該子專案個別處理即可，無須細究全貌。

## 本機預覽

`.Codex/launch.json` 已設好 `portfolio-site`（http-server，port 8230）。用 preview 工具啟動後開 `http://localhost:8230/works/<page>.html`。
改完 `app.js` 或 head 設定後，瀏覽器務必硬重新整理（Ctrl+F5），否則會看到舊快取的 header/sidebar。

## 作品集語氣

面試導向：不行銷誇飾、不冗長、歸屬誠實（他人負責的部分要標明）、沒有可公開來源的數字就不寫（NDA 數據不揭露）。
