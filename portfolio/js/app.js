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
// 作品類別配置
// ============================================
const categoryConfig = {
	design: {
		title: null // 設計類不需要標題
	},
	development: {
		title: "Development",
		titleClass: "hightlight ml-sm"
	}
	// 可以繼續新增其他類別...
};

// ============================================
// 作品資料定義 - 使用物件陣列格式
// ============================================
const portfolioData = [
	{
		id: "d_uc",
		title: "All-in-One Streaming Studio </br> Solution Application",
		tags: ["Scenario Definition", "Software PRD", "iPad UI Design", "Design Library"],
		category: "design",
		cardConfig: { colClass: "col-6 col-md-6 col-xs-12" }
	},
	{
		id: "d_tts",
		title: "Text-to-Speech </br> AI Solution",
		tags: ["AI Interact Design", "Website", "B2B Solution"],
		category: "design",
		cardConfig: { colClass: "col-6 col-md-6 col-xs-12" }
	},
	{
		id: "d_ftr",
		title: "Future Training Room",
		tags: ["Scenario Definition", "IoT Control System Design"],
		category: "design",
		cardConfig: { whiteText: true }
	},
	{
		id: "d_uvc",
		title: "Virtual USB Video Streaming </br>Windows Tool",
		tags: ["Window AP Design", "Streaming", "UI Flow"],
		category: "design"
	},
	{
		id: "d_ds",
		title: "Design system",
		tags: ["UI Library", "APP icon", "interaction flow library"],
		category: "design"
	},
	{
		id: "d_so",
		title: "SO!Eyewear Website",
		tags: ["Website", "Frond-end", "SEO", "Google Analysis"],
		category: "design",
		cardConfig: { whiteText: true }
	},
	{
		id: "d_ofweb",
		title: "Official Website Optimization",
		tags: ["User Research", "Re-design", "User Journey Map"],
		category: "design",
		cardConfig: { whiteText: true }
	},
	{
		id: "d_game",
		title: "Gaming KVM Adapter Application",
		tags: ["Gaming", "First Use", " Tutorial"],
		category: "design",
		cardConfig: { whiteText: true }
	},
	{
		id: "d_wall",
		title: "Road Construction </br>Noise Control System",
		tags: ["Product design", "Field research"],
		category: "design",
		cardConfig: {}
	},
	{
		id: "d_vrbot",
		title: "Remote VR Interactive Robot",
		tags: ["Product design", "VR"],
		category: "design",
		cardConfig: {}
	},
	{
		id: "d_ar",
		title: "Reality Plus",
		tags: ["AR", "Concept Design"],
		category: "design",
		cardConfig: { whiteText: true, }
	},
	{
		id: "v_vis",
		title: "VIS / Visual Design",
		tags: ["Visual System", "Poster", "Illustration", "Animations"],
		category: "design",
		cardConfig: {}
	},
	{
		id: "v_ino",
		title: "Infographic Design",
		tags: ["Infographic", "Flow", "Scenario Illustration"],
		category: "design",
		cardConfig: {}
	},
	{
		id: "v_3d",
		title: "3D Render",
		tags: ["3D max", "V-ray", "Industral Design"],
		category: "design",
		cardConfig: {}
	},
	{
		id: "c_auto_tag",
		title: "Experimentation of Structuring  <br> Unstructured Data,	and Visualization",
		tags: ["python", "AI", "data"],
		category: "development",
		cardConfig: {}
	},
	{
		id: "c_auto-matome",
		title: "Automated Tool for Interview Transcript <br>and Summary Generation",
		tags: ["python", "AI"],
		category: "development",
		cardConfig: {}
	},
	{
		id: "c_demo",
		title: "Overcoming Costly On-Site Demos: <br>Virtual Demo Room Solution for Pro AV Sales",
		tags: ["JavaScript", "After Effects"],
		category: "development",
		cardConfig: { whiteText: true, }
	},
	{
		id: "c_party",
		title: "Party Game",
		tags: ["JavaScript", "Web Audio API"],
		category: "development",
		cardConfig: { whiteText: true, }
	},
	{
		id: "c_test",
		title: "Prototypes and Tools",
		tags: ["JavaScript", "Usability test Tools"],
		category: "development",
		cardConfig: { whiteText: true, }
	},
	{
		id: "c_an",
		title: "The interactive animation</br>for a marketing campaign",
		tags: ["JavaScript", "After Effects"],
		category: "development",
		cardConfig: {}
	}
];

// ============================================
// 輔助函數 - 取得作品資訊
// ============================================

// 根據 ID 取得作品
function getWorkById(id) {
	return portfolioData.find(work => work.id === id);
}

// 根據索引取得作品
function getWorkByIndex(index) {
	return portfolioData[index];
}

// 取得上一個作品
function getPreviousWork(currentId) {
	const currentIndex = portfolioData.findIndex(work => work.id === currentId);
	if (currentIndex > 0) {
		return portfolioData[currentIndex - 1];
	}
	return null;
}

// 取得下一個作品
function getNextWork(currentId) {
	const currentIndex = portfolioData.findIndex(work => work.id === currentId);
	if (currentIndex >= 0 && currentIndex < portfolioData.length - 1) {
		return portfolioData[currentIndex + 1];
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
		let rotate = document.documentElement.scrollTop / 100
		let x = 0
		coverMe.style = "transform: translate(" + scrollX + "px," + scrollY + "px) "

		window.addEventListener("mousemove", function (e) {
			x = (e.x + e.y) / 30
			coverMe.style = "filter: hue-rotate(" + x + "deg);transform: translate(" + scrollX + "px," + scrollY + "px) rotate(" + rotate + "deg);"
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
			$tag("title")[0].innerHTML = currentWork.title.replace(/<\/?br>/g, '').replace(/<\/?\/br>/g, '');
			$tag("h1")[0].innerHTML = currentWork.title;

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
					img[i].src = "../image/" + workName + num + imgType
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

				let sidebarHtml = '<div class="row flex-dir-col"><a class="mt-xl" href="index.html">Home</a>';

				if (nextWork) {
					sidebarHtml += `
						<a id="nextwork" class="icon" href="${nextWork.id}.html#img00">
							chevron_right
							<div id="nextwork-describe">
								<img src="../image/cover_${nextWork.id}.png">
								<span>${nextWork.title}</span>
							</div>
						</a>
					`;
				}

				if (prevWork) {
					sidebarHtml += `
						<a id="lastwork" class="icon" href="${prevWork.id}.html#img00">
							chevron_left
							<div id="lastwork-describe">
								<img src="../image/cover_${prevWork.id}.png">
								<span>${prevWork.title}</span>
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
// Header
// ============================================
try {
	var header = $tag("header")
	var headerHtml = `
		<div class="container">
			<a href="index.html">
				<div class="logo">
					<div></div>
				</div>
			</a>
			<ul class="row flex-jus-end">
				<li><a href="index.html">Design</a></li>
				<li><a href="index.html">Project</a></li>
				<li><a href="index.html">Development</a></li>
				<li><a href="about.html">Resume</a></li>
			</ul>
		</div>`
	header[0].innerHTML = headerHtml;

	// Header smaller on scroll
	var LastScrollY = 0
	document.addEventListener('scroll', function (e) {
		let scrollY = window.scrollY
		if (scrollY == 0) {
			header[0].classList.remove("sm");
			header[0].classList.remove("md");
		} else if (scrollY > LastScrollY) {
			header[0].classList.remove("md");
			header[0].classList.add("sm");
		} else {
			header[0].classList.remove("sm");
			header[0].classList.add("md");
		}
		LastScrollY = scrollY
	})
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
						<img src="../image/icon_email.png">\
						<p class="mb-xxs">newslining@gmail.com</p>\
					</div>\
					<a class="row flex-align-c" href="https://www.linkedin.com/in/sin-siang-lin/" target="_blank">\
						<img src="../image/icon_linkedin-rect.png">\
						<p>linkedin sin-siang-lin</p>\
					</a>\
				</div>\
				<div class="col-4 col-xsm-12 text-xsm-center mt-sm-sm">\
					<a href="about_jp.html" class="btn">Recume <span class="icon"> arrow_forward</span>\
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