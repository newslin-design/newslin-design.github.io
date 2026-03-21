// ============================================
// Utility Functions
// ============================================
var $ = function (name) {
	return document.getElementById(name)
}
var $css = function (name) {
	return document.getElementsByClassName(name)
}
var $tag = function (name) {
	return document.getElementsByTagName(name)
}

// ============================================
// Language & Path Configuration
// ============================================
// 各頁面可透過 <script> 設定: lang = "zh" / "ja" / "en"
// basePath 用於修正子資料夾的相對路徑
var lang = (typeof lang !== 'undefined') ? lang : "en";
var basePath = (typeof basePath !== 'undefined') ? basePath : "";
// basePath 範例: zh/ ja/ 頁面設為 "../"，根層頁面設為 ""
var imgBasePath = basePath + "../image/";
var pageBasePath = basePath + "";


// ============================================
// 作品資料定義（含多語系）
// ============================================
// title / desc 可為字串或 { en, zh, ja } 物件
// 字串 = 所有語言共用；物件 = 依 lang 選取，fallback 到 en
// hasLocalPage: true 表示 zh/ ja/ 資料夾有對應頁面

// 根據語言解析欄位值
function i18n(value) {
	if (typeof value === 'object' && value !== null) {
		return value[lang] || value['en'] || '';
	}
	return value || '';
}

const portfolioData = {
	design: {
		title: "",
		titleClass: "",
		cards: [
			{
				id: "a_builder",
				hasLocalPage: true,
				title: {
					en: "Visual Solution Simulator <br> <span>Solution Builder</span>",
					zh: "視覺化解決方案模擬器 <br> <span>Solution Builder</span>",
					ja: "ビジュアルソリューションシミュレーター <br> <span>Solution Builder</span>"
				},
				desc: {
					en: "A digital tool driving ATEN's transformation from product-oriented to solution-oriented sales, featuring visual topology editing, automated proposals, and data-driven insights.",
					zh: "推動 ATEN 從產品導向轉型為解決方案導向的數位工具，具備視覺化拓撲編輯、自動化提案與數據驅動洞察。",
					ja: "ATENの製品志向からソリューション志向への変革を推進するデジタルツール。ビジュアルトポロジー編集、自動提案、データ駆動インサイトを搭載。"
				},
				tags: ["UX Engineering", "React Development", "Data Analytics", "B2B Tool"],
				cardConfig: { colClass: "col-8 col-md-6 col-xs-12 star-project" }
			},
			{
				id: "a_foodAnimal",
				hasLocalPage: true,
				title: {
					en: "Food Animal Personality Quiz",
					zh: "美食動物性格測驗",
					ja: "フードアニマル性格診断"
				},
				desc: {
					en: "An AI-collaborative side project transforming dining habits into animal personas, showcasing Prompt Engineering, Midjourney visual systems, and full-stack development.",
					zh: "一個 AI 協作的 Side Project，將飲食習慣轉化為動物人格，展示 Prompt Engineering、Midjourney 視覺系統與全端開發。",
					ja: "AI協働のサイドプロジェクト。食習慣を動物ペルソナに変換し、プロンプトエンジニアリング、Midjourneyビジュアルシステム、フルスタック開発を実証。"
				},
				tags: ["AI Collaboration", "Prompt Engineering", "Interactive Web App"],
				cardConfig: { colClass: "col-4 col-md-6 col-xs-12" }
			},
			{
				id: "d_uc",
				hasLocalPage: true,
				title: {
					en: "All-in-One Streaming Studio </br> Solution Application",
					zh: "一體化直播工作站 </br> 解決方案應用",
					ja: "オールインワン配信スタジオ </br> ソリューションアプリケーション"
				},
				desc: {
					en: "An award-winning live streaming product series that achieved the highest annual sales, simplifying professional broadcasting through integrated hardware-software solutions.",
					zh: "獲獎的直播產品系列，達成年度最高銷售量，透過軟硬體整合方案簡化專業直播流程。",
					ja: "年間最高販売台数を記録した受賞歴のあるライブ配信製品シリーズ。ハードウェア・ソフトウェアの統合でプロの配信を簡素化。"
				},
				tags: ["Scenario Definition", "Software PRD", "iPad UI Design", "Design Library"],
				cardConfig: { colClass: "col-6 col-md-6 col-xs-12" }
			},
			{
				id: "d_tts",
				hasLocalPage: true,
				title: {
					en: "Text-to-Speech </br> AI Solution",
					zh: "文字轉語音 </br> AI 解決方案",
					ja: "テキスト読み上げ </br> AIソリューション"
				},
				desc: {
					en: "An AI-powered Text-to-Speech service leveraging deep learning voice cloning technology, enabling lifelike voice synthesis with minimal data for business applications.",
					zh: "運用深度學習聲音克隆技術的 AI 語音合成服務，以極少數據實現擬真語音合成，應用於商業場景。",
					ja: "ディープラーニングの音声クローン技術を活用したAI音声合成サービス。最小限のデータでリアルな音声合成をビジネス用途に展開。"
				},
				tags: ["AI Interact Design", "Website", "B2B Solution"],
				cardConfig: { colClass: "col-6 col-md-6 col-xs-12" }
			},
			{
				id: "d_ftr",
				hasLocalPage: true,
				title: {
					en: "Future Training Room",
					zh: "未來培訓教室",
					ja: "未来型研修室"
				},
				desc: {
					en: "A next-generation training room solution combining multi-device control, 3D visualization, and seamless mode switching for digital-era educators.",
					zh: "結合多設備控制、3D 視覺化與無縫模式切換的次世代培訓教室解決方案，為數位時代的教育者而生。",
					ja: "マルチデバイス制御、3D可視化、シームレスなモード切替を組み合わせた次世代研修室ソリューション。"
				},
				tags: ["Scenario Definition", "IoT Control System Design"]
			},
			{
				id: "d_uvc",
				hasLocalPage: true,
				title: {
					en: "Virtual USB Video Streaming </br>Windows Tool",
					zh: "虛擬 USB 視訊串流 </br>Windows 工具",
					ja: "仮想USB映像ストリーミング </br>Windowsツール"
				},
				desc: {
					en: "A Windows desktop tool creating virtual USB channels for secure remote video streaming, designed for system integrators deploying remote meeting and education environments.",
					zh: "透過虛擬 USB 通道安全接收遠端視訊串流的 Windows 桌面工具，協助系統整合商部署遠距會議與教育環境。",
					ja: "仮想USBチャンネルで安全にリモート映像を受信するWindowsツール。リモート会議・教育環境の構築を支援。"
				},
				tags: ["Window AP Design", "Streaming", "UI Flow"],
			},
			{
				id: "d_ds",
				hasLocalPage: true,
				title: {
					en: "Design System",
					zh: "設計系統",
					ja: "デザインシステム"
				},
				desc: {
					en: "A company-wide design system unifying UI components, interaction patterns, and visual language across all product platforms.",
					zh: "統一所有產品平台 UI 元件、互動模式與視覺語言的公司級設計系統。",
					ja: "全製品プラットフォームのUIコンポーネント、インタラクションパターン、ビジュアル言語を統一する全社デザインシステム。"
				},
				tags: ["UI Library", "APP icon", "interaction flow library"],
			},
			{
				id: "d_so",
				hasLocalPage: true,
				title: {
					en: "SO!Eyewear Website",
					zh: "SO!Eyewear 網站",
					ja: "SO!Eyewear ウェブサイト"
				},
				desc: {
					en: "A full-cycle eyewear brand website redesign, from UX research and information architecture to front-end development and SEO optimization.",
					zh: "眼鏡品牌網站的全流程重新設計，從使用者研究、資訊架構到前端開發與 SEO 優化。",
					ja: "アイウェアブランドサイトのフルサイクルリデザイン。UXリサーチ、情報設計からフロントエンド開発、SEO最適化まで。"
				},
				tags: ["Website", "Frond-end", "SEO", "Google Analysis"]
			},
			{
				id: "d_ofweb",
				hasLocalPage: true,
				title: {
					en: "Official Website Optimization",
					zh: "企業官網優化",
					ja: "公式サイト最適化"
				},
				desc: {
					en: "B2B official website UX optimization through user interviews, search keyword analysis, and data-driven design proposals.",
					zh: "透過使用者訪談、搜尋關鍵字分析與數據驅動設計提案，優化 B2B 企業官網使用者體驗。",
					ja: "ユーザーインタビュー、検索キーワード分析、データ駆動のデザイン提案によるB2B企業サイトのUX最適化。"
				},
				tags: ["User Research", "Re-design", "User Journey Map"]
			},
			{
				id: "d_game",
				hasLocalPage: true,
				title: {
					en: "Gaming KVM Adapter Application",
					zh: "遊戲鍵鼠轉換器應用程式",
					ja: "ゲーミングKVMアダプターアプリ"
				},
				desc: {
					en: "UI design update for a gaming KVM adapter app, optimizing device connection flows and adding tutorial experiences for pro gamers.",
					zh: "遊戲鍵鼠轉換器應用程式的 UI 設計更新，優化裝置連接流程並為專業玩家新增教學體驗。",
					ja: "ゲーミングKVMアダプターアプリのUIデザイン更新。デバイス接続フローを最適化し、プロゲーマー向けチュートリアルを追加。"
				},
				tags: ["Gaming", "First Use", "Tutorial"]
			},
			{
				id: "d_wall",
				hasLocalPage: true,
				title: {
					en: "Road Construction </br>Noise Control System",
					zh: "道路施工 </br>噪音控制系統",
					ja: "道路工事 </br>騒音制御システム"
				},
				desc: {
					en: "An award-winning modular noise-reduction system for urban road construction, designed through field research and acoustic engineering analysis.",
					zh: "透過實地調查與聲學工程分析設計的獲獎模組化城市道路施工降噪系統。",
					ja: "フィールドリサーチと音響工学分析に基づく、受賞歴のある都市道路工事向けモジュラー防音システム。"
				},
				tags: ["Product design", "Field research"]
			},
			{
				id: "d_vrbot",
				hasLocalPage: true,
				title: {
					en: "Remote VR Interactive Robot",
					zh: "遠端 VR 互動機器人",
					ja: "リモートVRインタラクティブロボット"
				},
				desc: {
					en: "A VR-controlled telepresence robot concept for remote education and virtual tourism, featuring 360-degree head movement and live video streaming.",
					zh: "VR 遙控遠端臨場機器人概念設計，適用於遠距教育與虛擬觀光，具備 360 度頭部旋轉與即時視訊串流。",
					ja: "遠隔教育とバーチャル観光向けのVR制御テレプレゼンスロボットのコンセプト。360度ヘッド回転とライブ映像配信を搭載。"
				},
				tags: ["Product design", "VR"]
			},
			{
				id: "d_ar",
				hasLocalPage: true,
				title: {
					en: "Reality Plus",
					zh: "Reality Plus",
					ja: "Reality Plus"
				},
				desc: {
					en: "A concept AR mobile app overlaying digital information onto the real world for navigation, tourism, and gamified learning experiences.",
					zh: "概念 AR 行動應用程式，將數位資訊疊加於現實世界，提供導航、觀光與遊戲化學習體驗。",
					ja: "デジタル情報を現実世界に重ねるARモバイルアプリのコンセプト。ナビゲーション、観光、ゲーミフィケーション学習を実現。"
				},
				tags: ["AR", "Concept Design"],
				cardConfig: { whiteText: true }
			},
			{
				id: "v_vis",
				hasLocalPage: true,
				title: {
					en: "VIS / Visual Design",
					zh: "VIS / 視覺設計",
					ja: "VIS / ビジュアルデザイン"
				},
				desc: {
					en: "A mixed-media visual design collection featuring illustration, poster design, and motion graphics.",
					zh: "跨媒材視覺設計作品集，涵蓋插畫、海報設計與動態圖像。",
					ja: "イラスト、ポスターデザイン、モーショングラフィックスを含むビジュアルデザイン作品集。"
				},
				tags: ["Visual System", "Poster", "Illustration", "Animations"]
			},
			{
				id: "v_ino",
				hasLocalPage: true,
				title: {
					en: "Infographic Design",
					zh: "資訊圖表設計",
					ja: "インフォグラフィックデザイン"
				},
				desc: {
					en: "Infographic and scenario illustration designs that transform complex information into clear visual narratives.",
					zh: "將複雜資訊轉化為清晰視覺敘事的資訊圖表與情境插畫設計。",
					ja: "複雑な情報を明快なビジュアルナラティブに変換するインフォグラフィックとシナリオイラスト。"
				},
				tags: ["Infographic", "Flow", "Scenario Illustration"]
			},
			{
				id: "v_3d",
				hasLocalPage: true,
				title: {
					en: "3D Render",
					zh: "3D 渲染",
					ja: "3Dレンダリング"
				},
				desc: {
					en: "Industrial and product 3D rendering portfolio created with 3ds Max, V-ray, SolidWorks, and Blender.",
					zh: "使用 3ds Max、V-ray、SolidWorks 和 Blender 製作的工業與產品 3D 渲染作品集。",
					ja: "3ds Max、V-ray、SolidWorks、Blenderで制作した工業・製品3Dレンダリングポートフォリオ。"
				},
				tags: ["3D max", "V-ray", "Industral Design"]
			}]
	},
	development: {
		title: "Development",
		titleClass: "",
		cards: [
			{
				id: "c_auto_tag",
				hasLocalPage: true,
				title: {
					en: "Experimentation of Structuring  <br> Unstructured Data, and Visualization",
					zh: "非結構化數據的結構化 <br> 實驗與視覺化",
					ja: "非構造化データの構造化 <br> 実験と可視化"
				},
				desc: {
					en: "A Python tool using ChatGPT API to automatically tag and visualize unstructured data like customer feedback and survey responses.",
					zh: "使用 ChatGPT API 自動標記並視覺化非結構化數據（如客戶回饋與問卷回覆）的 Python 工具。",
					ja: "ChatGPT APIで顧客フィードバックやアンケート回答などの非構造化データを自動タグ付け・可視化するPythonツール。"
				},
				tags: ["python", "AI", "data"]
			},
			{
				id: "c_auto-matome",
				hasLocalPage: true,
				title: {
					en: "Automated Tool for Interview Transcript <br>and Summary Generation",
					zh: "訪談逐字稿與摘要 <br>自動生成工具",
					ja: "インタビュー文字起こしと <br>要約の自動生成ツール"
				},
				desc: {
					en: "A Python pipeline combining OpenAI Whisper and ChatGPT to automatically transcribe and summarize research interview recordings.",
					zh: "結合 OpenAI Whisper 與 ChatGPT 的 Python 流程，自動轉錄並摘要研究訪談錄音。",
					ja: "OpenAI WhisperとChatGPTを組み合わせ、研究インタビュー録音を自動で文字起こし・要約するPythonパイプライン。"
				},
				tags: ["python", "AI"]
			},
			{
				id: "c_demo",
				hasLocalPage: true,
				title: {
					en: "Overcoming Costly On-Site Demos: <br>Virtual Demo Room Solution for Pro AV Sales",
					zh: "突破高成本現場展示： <br>Pro AV 銷售虛擬展示間解決方案",
					ja: "高コストな現地デモを克服： <br>Pro AV営業向けバーチャルデモルーム"
				},
				desc: {
					en: "A JavaScript-built virtual demo room replacing costly physical showrooms, enabling online Pro AV product experience with reusable component architecture.",
					zh: "以 JavaScript 建構的虛擬展示間，取代高成本實體展廳，採用可重用元件架構實現線上 Pro AV 產品體驗。",
					ja: "JavaScriptで構築した仮想デモルーム。高コストな物理ショールームを代替し、再利用可能な設計でPro AV製品をオンライン体験。"
				},
				tags: ["JavaScript", "After Effects"],
				cardConfig: { whiteText: true }
			},
			{
				id: "c_party",
				hasLocalPage: true,
				title: {
					en: "Party Game",
					zh: "派對遊戲",
					ja: "パーティーゲーム"
				},
				desc: {
					en: "A browser-based party game featuring charades and Q&A rounds, with dynamic sound design powered by Web Audio API.",
					zh: "基於瀏覽器的派對遊戲，包含比手畫腳與問答環節，搭配 Web Audio API 驅動的動態音效設計。",
					ja: "ジェスチャーゲームとQ&Aラウンドを搭載したブラウザパーティーゲーム。Web Audio APIによるダイナミックなサウンドデザイン。"
				},
				tags: ["JavaScript", "Web Audio API"],
				cardConfig: { whiteText: true }
			},
			{
				id: "c_test",
				hasLocalPage: true,
				title: {
					en: "Prototypes and Tools",
					zh: "原型與工具",
					ja: "プロトタイプ＆ツール"
				},
				desc: {
					en: "A collection of JavaScript-built usability testing tools for real product research, including speech recognition, light pattern testing, and UI simulation.",
					zh: "為實際產品研究打造的 JavaScript 易用性測試工具集，涵蓋語音辨識、燈號模式測試與 UI 模擬。",
					ja: "音声認識、ライトパターンテスト、UIシミュレーションを含む、実際の製品リサーチ向けJavaScriptユーザビリティテストツール集。"
				},
				tags: ["JavaScript", "Usability test Tools"],
				cardConfig: { whiteText: true }
			},
			{
				id: "c_an",
				hasLocalPage: true,
				title: {
					en: "The interactive animation</br>for a marketing campaign",
					zh: "行銷活動</br>互動動態網頁",
					ja: "マーケティングキャンペーン向け</br>インタラクティブアニメーション"
				},
				desc: {
					en: "Interactive animated web experiences for marketing campaigns, combining JavaScript interactivity with After Effects motion design.",
					zh: "為行銷活動打造的互動動態網頁體驗，結合 JavaScript 互動性與 After Effects 動態設計。",
					ja: "マーケティング向けインタラクティブアニメーションWeb体験。JavaScriptとAfter Effectsのモーションデザインを融合。"
				},
				tags: ["JavaScript", "After Effects"]
			}
		]
	}

};

// ============================================
// 輔助函數 - 取得作品資訊
// ============================================

// 根據 ID 取得作品
function getWorkById(id) {
	// 在 design 和 development 中搜尋
	for (let category in portfolioData) {
		const work = portfolioData[category].cards.find(card => card.id === id);
		if (work) return work;
	}
	return null;
}

function getPreviousWork(currentId) {
	// 將所有作品攤平成一個陣列
	const allWorks = [
		...portfolioData.design.cards,
		...portfolioData.development.cards
	];
	const currentIndex = allWorks.findIndex(work => work.id === currentId);
	if (currentIndex > 0) {
		return allWorks[currentIndex - 1];
	}
	return null;
}

function getNextWork(currentId) {
	const allWorks = [
		...portfolioData.design.cards,
		...portfolioData.development.cards
	];
	const currentIndex = allWorks.findIndex(work => work.id === currentId);
	if (currentIndex >= 0 && currentIndex < allWorks.length - 1) {
		return allWorks[currentIndex + 1];
	}
	return null;
}

// ============================================
// Cover Me 互動效果
// ============================================
try {
	let coverMe = $("cover-me")
	if (coverMe) {
		let scrollX = document.documentElement.scrollTop / 60 - 80
		let scrollY = document.documentElement.scrollTop / 10 - 100
		let rotate = document.documentElement.scrollTop / 10
		let x = 0
		coverMe.style = "transform: translate(" + scrollX + "px," + scrollY + "px) "

		window.addEventListener("mousemove", function (e) {
			x = (e.x + e.y) / 15
			coverMe.style = "filter: hue-rotate(" + x + "deg);transform: translate(" + scrollX + "px," + scrollY + "px) rotate(" + rotate * 2 + "deg);"
		})

		window.addEventListener("scroll", function (e) {
			scrollX = document.documentElement.scrollTop / 60 - 80
			scrollY = document.documentElement.scrollTop / 10 - 100
			rotate = document.documentElement.scrollTop / 100
			coverMe.style = "filter: hue-rotate(" + x + "deg);transform: translate(" + scrollX + "px," + scrollY + "px) rotate(" + rotate + "deg);"
		})
	}
} catch {
	console.log("There is no coverme")
}

// ============================================
// 作品頁面處理
// ============================================
try {
	if (typeof workName !== 'undefined' && workName !== 'home') {
		const currentWork = getWorkById(workName);

		if (currentWork) {
			// 設定頁面標題
			var workTitle = i18n(currentWork.title);
			$tag("title")[0].innerHTML = workTitle.replace(/<\/?br>/g, '').replace(/<\/?\/br>/g, '');
			$tag("h1")[0].innerHTML = workTitle;

			// 載入圖片
			let img = $tag("img")
			let j = 0
			for (let i = 0; i < img.length; i++) {
				let imgType = ".png"
				if (img[i].alt == "svg") {
					imgType = ".svg"
				} else if (img[i].alt == "gif") {
					imgType = ".gif"
				}
				if (img[i].alt != "no") {
					let num = i - j
					img[i].src = imgBasePath + workName + num + imgType
				} else {
					j++
				}
			}

			// 建立側邊欄
			const sidebar = $("sidebar");
			if (sidebar) {
				const prevWork = getPreviousWork(workName);
				const nextWork = getNextWork(workName);

				sidebar.classList.add("row", "flex-dir-col");

				// Home 連結：非英文時留在當前語言資料夾
			var homeHref = (lang !== 'en') ? 'index.html' : `${pageBasePath}index.html`;
			let sidebarHtml = `<div class="row flex-dir-col"><a class="mt-xl" href="${homeHref}">Home</a>`;

				if (nextWork) {
					// 側邊欄連結：有該語言頁面則留在當前資料夾，否則跳回英文
					var nextHasLocal = (lang !== 'en' && nextWork.hasLocalPage);
					var nextHref = nextHasLocal
						? `${nextWork.id}.html#img00`
						: `${pageBasePath}${nextWork.id}.html#img00`;
					sidebarHtml += `
						<a id="nextwork" class="icon" href="${nextHref}">
							chevron_right
							<div id="nextwork-describe">
								<img src="${imgBasePath}cover_${nextWork.id}.png">
								<span>${i18n(nextWork.title)}</span>
							</div>
						</a>
					`;
				}

				if (prevWork) {
					var prevHasLocal = (lang !== 'en' && prevWork.hasLocalPage);
					var prevHref = prevHasLocal
						? `${prevWork.id}.html#img00`
						: `${pageBasePath}${prevWork.id}.html#img00`;
					sidebarHtml += `
						<a id="lastwork" class="icon" href="${prevHref}">
							chevron_left
							<div id="lastwork-describe">
								<img src="${imgBasePath}cover_${prevWork.id}.png">
								<span>${i18n(prevWork.title)}</span>
							</div>
						</a>
					`;
				}

				sidebarHtml += '</div><a href="#">Top</a>';
				sidebar.innerHTML = sidebarHtml;
			}
		}
	}
} catch (error) {
	console.log("Work page initialization error:", error)
}

// ============================================
// 折疊圖片功能
// ============================================
try {
	var imgboxFold = $css("imgbox fold")
	var imgFold = $css("img-fold")
	var imgFoldSingal = [1, 1]
	for (let i = 0; i < imgboxFold.length; i++) {
		imgboxFold[i].addEventListener("click", function () {
			if (imgFoldSingal[i] == 1) {
				imgboxFold[i].style = "height:" + imgFold[i].clientHeight + "px"
				imgboxFold[i].classList.add("unfolded")
				imgboxFold[i].classList.remove("folded")
				imgFoldSingal[i] = 0
			} else {
				imgboxFold[i].style = "height: 480px"
				imgboxFold[i].classList.add("folded")
				imgboxFold[i].classList.remove("unfolded")
				imgFoldSingal[i] = 1
			}
		})
	}
} catch {
	console.log("no fold image")
}


// ============================================
// Project Nav Sticky Behavior
// ============================================
try {
	var projectNav = document.querySelector('.project-nav');

	if (projectNav) {
		var navOriginalOffsetTop = 0;
		var lastScrollY = 0;
		var scrollThreshold = 50;
		var isInitialized = false;

		// 延遲初始化，確保頁面完全載入
		function initializeNav() {
			// 重新計算 nav 的實際位置
			navOriginalOffsetTop = projectNav.getBoundingClientRect().top + window.scrollY;
			console.log("Nav original position:", navOriginalOffsetTop); // 除錯用
			isInitialized = true;
		}

		// 在多個時間點嘗試初始化，確保抓到正確位置
		window.addEventListener('load', initializeNav);
		setTimeout(initializeNav, 500);

		window.addEventListener('scroll', function () {
			// 如果還沒初始化或位置不合理，重新計算
			if (!isInitialized || navOriginalOffsetTop < 100) {
				initializeNav();
			}

			var currentScrollY = window.scrollY;

			// 判斷是否滾動超過 nav 原始位置
			if (currentScrollY >= navOriginalOffsetTop - 60) { // 減去 header 高度
				projectNav.classList.add('sticky');
				projectNav.classList.remove('moto');

				// 下上滾動邏輯跟 Header 一起

			} else {
				// 回到原始位置上方，移除 sticky
				projectNav.classList.remove('sticky', 'scrolling-down', 'scrolling-up');
				projectNav.classList.add('moto');
				lastScrollY = currentScrollY;
			}
		}, { passive: true });
	}
} catch (error) {
	console.log("Project nav initialization error:", error);
}


// ============================================
// Header
// ============================================
try {
	var header = $tag("header")
	// 語言切換連結
	var langLinks = '';
	if (typeof workName !== 'undefined' && workName === 'home') {
		// 首頁的語言切換
		langLinks = `
			<li class="lang-switcher">
				<a href="${basePath}index.html" ${lang === 'en' ? 'class="active"' : ''}>EN</a>
				<a href="${basePath}zh/index.html" ${lang === 'zh' ? 'class="active"' : ''}>中</a>
				<a href="${basePath}ja/index.html" ${lang === 'ja' ? 'class="active"' : ''}>JP</a>
			</li>`;
	} else if (typeof workName !== 'undefined') {
		// 作品頁的語言切換
		langLinks = `
			<li class="lang-switcher">
				<a href="${basePath}${workName}.html" ${lang === 'en' ? 'class="active"' : ''}>EN</a>
				<a href="${basePath}zh/${workName}.html" ${lang === 'zh' ? 'class="active"' : ''}>中</a>
				<a href="${basePath}ja/${workName}.html" ${lang === 'ja' ? 'class="active"' : ''}>JP</a>
			</li>`;
	}

	var headerHtml = `
                    <div class="container">
                        <a href="${pageBasePath}index.html">
                            <div class="logo">
                                <div></div>
                            </div>
                        </a>
                        <ul class="row flex-jus-end">
                            <li><a href="${pageBasePath}index.html">Design</a></li>
                            <li><a href="${pageBasePath}index.html">Project</a></li>
                            <li><a href="${pageBasePath}index.html">Development</a></li>
                            <li><a href="${pageBasePath}../blog/">Blog</a></li>
                            <li><a href="${pageBasePath}about.html">Resume</a></li>
                            ${langLinks}
                        </ul>
                    </div>`
	header[0].innerHTML = headerHtml;

	// Header smaller on scroll
	var LastScrollY = 0
	document.addEventListener('scroll', function (e) {
		let scrollY = window.scrollY
		if (scrollY == 0) {
			header[0].classList.remove("md");
			header[0].classList.remove("sm");
			header[0].classList.remove("md");
		} else if (scrollY > LastScrollY) {
			header[0].classList.remove("md");
			header[0].classList.add("sm");
			if (projectNav) {
				projectNav.classList.add('scrolling-down');
				projectNav.classList.remove('scrolling-up');
			}
		} else {
			header[0].classList.add("md");
			header[0].classList.remove("sm");
			if (projectNav) {
				projectNav.classList.add('scrolling-up');
				projectNav.classList.remove('scrolling-down');
			}
		}
		LastScrollY = scrollY
	}, { passive: true }) // 優化效能
} catch {
	console.log("no header")
}

// ============================================
// Footer
// ============================================
try {
	var footer = $tag("footer")
	var footerHtml = '\
		<div class="container">\
		<div class="session-border pt-md pb-md">\
			<div class="row flex-jus-c">\
				<div class="col-3 col-md-4 col-xsm-12 text-xsm-center">\
					<h2 style="font-size:16px">林新翔 / LIN SIN-SIANG</h2>\
					<h5 style="font-size:15px">UI/UX Designer</h5>\
				</div>\
				<div class="col-5 col-md-4 col-xsm-12 row-xsm flex-xsm-jus-c">\
					<div class="row flex-align-c">\
						<img src="' + imgBasePath + 'icon_email.png">\
						<p class="mb-xxs">newslining@gmail.com</p>\
					</div>\
					<a class="row flex-align-c" href="https://www.linkedin.com/in/sin-siang-lin/" target="_blank">\
						<img src="' + imgBasePath + 'icon_linkedin-rect.png">\
						<p>linkedin sin-siang-lin</p>\
					</a>\
				</div>\
				<div class="col-4 col-xsm-12 text-xsm-center mt-sm-sm">\
					<a href="' + pageBasePath + 'about_jp.html" class="btn">Resume <span class="icon"> arrow_forward</span>\
					</a>\
				</div>\
			</div>\
		</div>\
		</div>\
		<div id="loadingMask" class="">\
		<svg viewBox="25 25 50 50">\
			<circle cx="50" cy="50" r="20"></circle>\
		</svg>\
	</div>'
	footer[0].innerHTML = footerHtml;
} catch {
	console.log("no footer")
}

// ============================================
// About 頁面：動態計算 ATEN 工作年資
// ============================================
try {
	var atenDuration = document.querySelector('.aten-duration');
	if (atenDuration) {
		var startYear = 2018, startMonth = 10; // 2018年10月
		var now = new Date();
		var years = now.getFullYear() - startYear;
		var months = now.getMonth() + 1 - startMonth;
		if (months < 0) { years--; months += 12; }
		if (lang === 'zh') {
			atenDuration.textContent = years + ' 年 ' + months + ' 個月';
		} else if (lang === 'ja') {
			atenDuration.textContent = years + ' 年 ' + months + ' ヶ月';
		} else {
			atenDuration.textContent = years + ' years ' + months + ' months';
		}
	}
} catch (error) {
	console.log("ATEN duration calculation error:", error);
}

// ============================================
// 首頁卡片渲染
// ============================================
function renderPortfolioCards() {
	const workCardsContainer = document.getElementById('workCardsContainer');
	if (!workCardsContainer) {
		console.log('workCards container not found');
		return;
	}

	let cardsHtml = '';

	Object.keys(portfolioData).forEach((category) => {
		const categoryData = portfolioData[category];

		// 加入類別標題
		if (categoryData.title) {
			cardsHtml += `
				<div class="session-border pt-xs pb-xs">
					<h2 class="${categoryData.titleClass || ''}">${categoryData.title}</h2>
				</div>
			`;
		}

		// 卡片區塊
		cardsHtml += '<div class="row workCards">';
		categoryData.cards.forEach((work) => {
			const config = work.cardConfig || {};
			const colClass = config.colClass || 'col-4 col-md-6 col-xs-12 m-0';
	
			const displayTitle = i18n(work.title);
			const displayDesc = i18n(work.desc);

			const tagsHtml = work.tags.map(tag => `<p class="tag">${tag}</p>`).join('');

			// 卡片連結：有該語言頁面的留在當前資料夾，否則跳回英文根目錄
			const hasLocalPage = (lang !== 'en' && work.hasLocalPage);
			const cardHref = hasLocalPage
				? `${work.id}.html#img00`
				: `${pageBasePath}${work.id}.html#img00`;

			cardsHtml += `
				<div class="${colClass}">
					<a class="workCard" href="${cardHref}" >
						<div class="work-image" style="background-image: url(${imgBasePath}cover_${work.id}.png);">
							<div class="detail_box row flex-c">${tagsHtml}</div>
						</div>
						<div class="textBox">
							<h3>${displayTitle}</h3>
							<p>${displayDesc}</p>
						</div>
					</a>
				</div>
			`;
		});

		cardsHtml += '</div>';
	});

	workCardsContainer.innerHTML = cardsHtml;
}

// ============================================
// Loading
// ============================================
try {
	$("loadingMask").classList.add("over")
} catch {
	console.log("no Loading Mask")
}

window.onload = function () {
	try {
		$("loadingMask").classList.add("over")
	} catch {
		console.log("no Loading Mask")
	}

	// 如果是首頁，渲染卡片
	if (typeof workName !== 'undefined' && workName === 'home') {
		renderPortfolioCards();
	}
}