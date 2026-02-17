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
// 作品資料定義 - 使用物件陣列格式
// ============================================
const portfolioData = {
	design: {
		title: "",
		titleClass: "",
		cards: [
			{
				id: "a_builder",
				title: "Visual Solution Simulator <br> <span>Solution Builder</span>",
				desc: "A digital tool driving ATEN's transformation from product-oriented to solution-oriented sales, featuring visual topology editing, automated proposals, and data-driven insights.",
				tags: ["UX Engineering", "React Development", "Data Analytics", "B2B Tool"],
				cardConfig: { colClass: "col-8 col-md-6 col-xs-12 star-project" }
			},
			{
				id: "a_foodAnimal",
				title: "Dining Persona Profiler Website",
				desc: "An interactive personality test website themed around dietary habits to Uncover Your Dining Persona.",
				tags: ["AI Interact Design", "Website", "B2B Solution"],
				cardConfig: { colClass: "col-4 col-md-6 col-xs-12" }
			},
			{
				id: "d_uc",
				title: "All-in-One Streaming Studio </br> Solution Application",
				desc: "This project aimed to develop a new product series to expand ",
				tags: ["Scenario Definition", "Software PRD", "iPad UI Design", "Design Library"],
				cardConfig: { colClass: "col-6 col-md-6 col-xs-12" }
			},
			{
				id: "d_tts",
				title: "Text-to-Speech </br> AI Solution",
				desc: "This project aimed to develop a new product series to expand sale",
				tags: ["AI Interact Design", "Website", "B2B Solution"],
				cardConfig: { colClass: "col-6 col-md-6 col-xs-12" }
			},
			{
				id: "d_ftr",
				title: "Future Training Room",
				desc: "",
				tags: ["Scenario Definition", "IoT Control System Design"]
			},
			{
				id: "d_uvc",
				title: "Virtual USB Video Streaming </br>Windows Tool",
				desc: "",
				tags: ["Window AP Design", "Streaming", "UI Flow"],
			},
			{
				id: "d_ds",
				title: "Design system",
				desc: "",
				tags: ["UI Library", "APP icon", "interaction flow library"],
			},
			{
				id: "d_so",
				title: "SO!Eyewear Website",
				desc: "",
				tags: ["Website", "Frond-end", "SEO", "Google Analysis"]
			},
			{
				id: "d_ofweb",
				title: "Official Website Optimization",
				desc: "",
				tags: ["User Research", "Re-design", "User Journey Map"]
			},
			{
				id: "d_game",
				title: "Gaming KVM Adapter Application",
				desc: "",
				tags: ["Gaming", "First Use", "Tutorial"]
			},
			{
				id: "d_wall",
				title: "Road Construction </br>Noise Control System",
				desc: "",
				tags: ["Product design", "Field research"]
			},
			{
				id: "d_vrbot",
				title: "Remote VR Interactive Robot",
				desc: "",
				tags: ["Product design", "VR"]
			},
			{
				id: "d_ar",
				title: "Reality Plus",
				desc: "",
				tags: ["AR", "Concept Design"],
				cardConfig: { whiteText: true }
			},
			{
				id: "v_vis",
				title: "VIS / Visual Design",
				desc: "",
				tags: ["Visual System", "Poster", "Illustration", "Animations"]
			},
			{
				id: "v_ino",
				title: "Infographic Design",
				desc: "",
				tags: ["Infographic", "Flow", "Scenario Illustration"]
			},
			{
				id: "v_3d",
				title: "3D Render",
				desc: "",
				tags: ["3D max", "V-ray", "Industral Design"]
			}]
	},
	development: {
		title: "Development",
		titleClass: "",
		cards: [
			{
				id: "c_auto_tag",
				title: "Experimentation of Structuring  <br> Unstructured Data,	and Visualization",
				desc: "",
				tags: ["python", "AI", "data"]
			},
			{
				id: "c_auto-matome",
				title: "Automated Tool for Interview Transcript <br>and Summary Generation",
				desc: "",
				tags: ["python", "AI"]
			},
			{
				id: "c_demo",
				title: "Overcoming Costly On-Site Demos: <br>Virtual Demo Room Solution for Pro AV Sales",
				desc: "",
				tags: ["JavaScript", "After Effects"],
				cardConfig: { whiteText: true }
			},
			{
				id: "c_party",
				title: "Party Game",
				desc: "",
				tags: ["JavaScript", "Web Audio API"],
				cardConfig: { whiteText: true }
			},
			{
				id: "c_test",
				title: "Prototypes and Tools",
				desc: "",
				tags: ["JavaScript", "Usability test Tools"],
				cardConfig: { whiteText: true }
			},
			{
				id: "c_an",
				title: "The interactive animation</br>for a marketing campaign",
				desc: "",
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
						<img src="../image/icon_email.png">\
						<p class="mb-xxs">newslining@gmail.com</p>\
					</div>\
					<a class="row flex-align-c" href="https://www.linkedin.com/in/sin-siang-lin/" target="_blank">\
						<img src="../image/icon_linkedin-rect.png">\
						<p>linkedin sin-siang-lin</p>\
					</a>\
				</div>\
				<div class="col-4 col-xsm-12 text-xsm-center mt-sm-sm">\
					<a href="about_jp.html" class="btn">Resume <span class="icon"> arrow_forward</span>\
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
			const h3Class = config.whiteText ? 'class="f-white"' : '';

			const tagsHtml = work.tags.map(tag => `<p class="tag">${tag}</p>`).join('');

			cardsHtml += `
				<div class="${colClass}">
					<a class="workCard" href="${work.id}.html#img00" >
						<div class="work-image" style="background-image: url(../image/cover_${work.id}.png);">
							<div class="detail_box row flex-c">${tagsHtml}</div>
						</div>
						<div class="textBox">
							<h3 ${h3Class}>${work.title}</h3>
							<p>${work.desc || ''}</p>
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