

/******************************
******************************
******************************
 

 
 
        tv start
 
 
 
        
******************************
******************************
*******************************/


let openedScreen = null;
let originalLeft = "";
let originalTop = "";
let isTvWallMobile = window.innerWidth < 500;
const elementsLink = "https://assets.aten.com/webpage/shared/campaign/global/Event/Computex/2025/tv-wall-website/"
// const elementsLink = "elements/"

const unClickableScreenIndexs = [0, 1, 4, 5]

document.getElementById("tv-wall-tables").src = `${elementsLink}table.png`
// document.getElementById("tv-wall-background-video-source").src = `${elementsLink}tv-wall-Background.mp4`


function createVideoWall() {
    isTvWallMobile = window.innerWidth < 500; // 每次建牆時重新判定
    const columns = isTvWallMobile ? 2 : 4;
    const rows = isTvWallMobile ? 4 : 3;
    const videoList = [
        "ControlRoom01", "ControlRoom02", "Control Center", "Digital Signage",
        "ControlRoom03", "ControlRoom04", "AI Voice", "VIP Conference Suite",
        "Personal Workstation", "Broadcast Center", "Web Conferencing", "Server Room"
    ];
    const videoListName = [
        "ControlRoom01", "ControlRoom02", "Control Room", "Digital Signage",
        "ControlRoom03", "ControlRoom04", "AI Voice", "Hybrid Boardroom",
        "Flex Work/Post-Production Essentials", "Broadcast Center", "Web Conferencing", "Server Room"
    ];

    const videoWall = document.getElementById("videoWall");
    videoWall.innerHTML = '';
    videoWall.style.aspectRatio = (16 * columns) / (9 * rows);
    videoWall.style.setProperty('--columns', columns);
    videoList.forEach((name, index) => {
        if (isTvWallMobile && unClickableScreenIndexs.includes(index)) {
            return;
        }

        const screen = document.createElement('div');
        screen.className = `tv-screen`;

        const count = videoWall.childElementCount;
        const col = count % columns;
        const row = Math.floor(count / columns);
        screen.style.width = `${100 / columns}%`;
        screen.style.left = `${(100 / columns) * col + 100 / columns / 2}%`;
        screen.style.top = `${(100 / rows) * row + 100 / rows / 2}%`;

        const link = document.createElement('a');
        link.href = "#001";
        link.className = `screen-link`;
        link.target = `_blank`;
        link.setAttribute('rel', 'noopener');
        link.setAttribute('data-toggle', 'modal');
        link.setAttribute('data-target', `#lightBox_webpage_solution-page-${index}`);

        const text = document.createElement('div');
        text.className = `screen-text`;
        text.innerText = videoListName[index];


        if (isTvWallMobile || unClickableScreenIndexs.includes(index)) {
            const img = document.createElement('img');
            img.src = name ? `${elementsLink + name}.png` : `${elementsLink}`;
            if (unClickableScreenIndexs.includes(index)) {
                screen.style.pointerEvents = "none";
            }
            screen.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsinline = true;
            const source = document.createElement('source');
            source.src = name ? `${elementsLink + name}.mp4` : `${elementsLink}`;
            source.type = "video/mp4";
            video.appendChild(source);
            screen.appendChild(video);
        }

        screen.appendChild(link);
        screen.appendChild(text);

        ['bottom', 'right', 'top', 'left'].forEach(pos => {
            const border = document.createElement('span');
            border.className = `border-line ${pos}`;
            screen.appendChild(border);
        });

        videoWall.appendChild(screen);
    });

    // setupClickEvent();
}

// function setupClickEvent() {
//     const videoWall = document.getElementById("videoWall");

//     // 先移除之前的 listener，避免重複綁定
//     videoWall.onclick = null;

//     if (isTvWallMobile) {
//         return; // 手機版直接不綁 click
//     }

//     videoWall.onclick = (e) => {
//         const target = e.target.closest('.tv-screen');
//         if (!target || openedScreen === target) return;

//         if (openedScreen) {
//             openedScreen.classList.remove('open');
//             openedScreen.style.left = originalLeft;
//             openedScreen.style.top = originalTop;

//             const closeBtn = document.querySelector('.close-btn');
//             if (closeBtn) closeBtn.remove();
//         }
//         videoWall.classList.remove('open');

//         openedScreen = target;
//         originalLeft = openedScreen.style.left;
//         originalTop = openedScreen.style.top;

//         openedScreen.classList.add('open');
//         openedScreen.style.left = '50%';
//         openedScreen.style.top = '50%';
//         videoWall.classList.add('open');

//         const btn = document.createElement('button');
//         btn.textContent = '✕';
//         btn.className = 'close-btn';
//         setTimeout(() => {
//             btn.classList.add('open');
//         }, 10);

//         btn.onclick = (e) => {
//             e.stopPropagation();
//             if (openedScreen) {
//                 openedScreen.classList.remove('open');
//                 openedScreen.style.left = originalLeft;
//                 openedScreen.style.top = originalTop;
//                 openedScreen = null;
//             }
//             videoWall.classList.remove('open');
//             btn.remove();
//         };
//         videoWall.appendChild(btn);
//     };
// }

// 初始化
createVideoWall();

// 螢幕大小改變時重建
window.addEventListener('resize', () => {
    createVideoWall();
});



// 為了確保在行動裝置上順利運行，加載所有影片
document.addEventListener('DOMContentLoaded', function () {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        // 設定預加載
        video.load();
        // 確保影片循環播放
        video.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        });
    });
});
document.addEventListener('touchstart', () => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (video.paused) {
            video.play().catch(e => {
                console.log('播放失敗:', e);
            });
        }
    });
}, { once: true });




let HovertvWallIndex = 0;
let intervaltvWallId = null;
let isTvWallPaused = false;
window.innerWidth < 500


function rotateHover() {
    if (isTvWallPaused) return;
    let screens = Array.from(document.querySelectorAll('.tv-screen'));
    // 僅在手機寬度下排除 unClickableScreenIndexs
    if (window.innerWidth > 500) {
        screens = screens.filter((_, i) => !unClickableScreenIndexs.includes(i));
    }
    if (screens.length === 0) return;
    screens.forEach((el, i) => {
        el.classList.toggle('hover', i === HovertvWallIndex);
    });
    HovertvWallIndex = (HovertvWallIndex + 1) % screens.length;
}



// 啟動輪播
intervaltvWallId = setInterval(rotateHover, 2000);

// 滑鼠移入移出控制暫停
document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.tv-screen')) {
        isTvWallPaused = true;
        // 清除所有 hover 樣式
        document.querySelectorAll('.tv-screen.hover').forEach(el => {
            el.classList.remove('hover');
        });
    }
});
document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.tv-screen')) {
        isTvWallPaused = false;
    }
});







/******************************
******************************
******************************




        tv END




******************************
******************************
*******************************/