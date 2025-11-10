

// =====================================================
// 
// ATEN Essentials Website DATA
// 
// =====================================================


const productData = [
    {
        modelName: "",
        name: "",
        image: {
            main: "",
            45: ""
        },
        price: 1200,
        currency: "NT$",
        link: "#",
        eShopLink: "#"
    }
]



// =====================================================
// 
// ATEN Essentials Website JavaScript
// 
// =====================================================

// ===== Configuration =====
const CONFIG = {
    mediaPath: './images/'  // 統一管理所有媒體路徑(圖片+影片)
};

// ===== Utility Functions =====
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// =====================================================
// 
// Session 1: Hero Section
// 影片自動播放控制
// 
// =====================================================
const initHeroVideo = () => {
    const video = document.querySelector('.hero-video');

    if (!video) return;

    // 確保影片靜音並自動播放(行動裝置需求)
    video.muted = true;
    video.play().catch(error => {
        console.log('影片自動播放失敗:', error);
    });

    // 當影片可以播放時移除海報
    video.addEventListener('canplay', () => {
        video.style.opacity = '1';
    });

    // 影片載入錯誤處理
    video.addEventListener('error', () => {
        console.error('影片載入失敗');
    });
};

// =====================================================
// 
// Session 2: Product Bar
// 產品列表滾動控制與互動
// 
// =====================================================
const initProductBar = () => {
    const productBar = document.querySelector('.product-bar');
    const productBarContainer = document.querySelector('.product-bar-container');
    const productItems = document.querySelectorAll('.product-item');
    const scrollLeftBtn = document.querySelector('.product-scroll-left');
    const scrollRightBtn = document.querySelector('.product-scroll-right');

    if (!productBar) return;

    // 檢查是否需要滾動
    const checkScrollable = () => {
        const isScrollable = productBar.scrollWidth > productBar.clientWidth;

        if (isScrollable) {
            productBarContainer.classList.add('scrollable');
            updateScrollButtons();
        } else {
            productBarContainer.classList.remove('scrollable');
        }
    };

    // 更新滾動按鈕狀態
    const updateScrollButtons = () => {
        const scrollLeft = productBar.scrollLeft;
        const maxScroll = productBar.scrollWidth - productBar.clientWidth;

        // 在起始位置
        if (scrollLeft <= 5) {
            productBarContainer.classList.add('at-start');
        } else {
            productBarContainer.classList.remove('at-start');
        }

        // 在結束位置
        if (scrollLeft >= maxScroll - 5) {
            productBarContainer.classList.add('at-end');
        } else {
            productBarContainer.classList.remove('at-end');
        }
    };

    // 滾動函數
    const scrollProducts = (direction) => {
        const scrollAmount = 300; // 每次滾動的距離
        const targetScroll = direction === 'left'
            ? productBar.scrollLeft - scrollAmount
            : productBar.scrollLeft + scrollAmount;

        productBar.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    };

    // 按鈕點擊事件
    if (scrollLeftBtn) {
        scrollLeftBtn.addEventListener('click', () => scrollProducts('left'));
    }

    if (scrollRightBtn) {
        scrollRightBtn.addEventListener('click', () => scrollProducts('right'));
    }

    // 監聽滾動事件
    productBar.addEventListener('scroll', debounce(updateScrollButtons, 50));

    // 監聽視窗大小變化
    window.addEventListener('resize', debounce(checkScrollable, 200));

    // 初始檢查
    checkScrollable();

    // 為產品項目添加鍵盤支援
    productItems.forEach(item => {
        item.addEventListener('click', function () {
            handleProductClick(this);
        });

        item.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleProductClick(this);
            }
        });
    });

    // 處理產品點擊
    const handleProductClick = (item) => {
        const productName = item.querySelector('.product-name').textContent;
        console.log('產品被點擊:', productName);

        // 移除所有產品的活動狀態
        productItems.forEach(p => p.classList.remove('active'));

        // 添加活動狀態
        item.classList.add('active');
    };

    // 滑鼠滾輪水平滾動支援
    productBar.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            productBar.scrollLeft += e.deltaY;
            updateScrollButtons();
        }
    }, { passive: false });
};

// =====================================================
// 
// Session 3: Feature Cards
// 特色卡片 hover 效果(純 CSS 處理,無需 JS)
// 
// =====================================================
// Session 3 目前只有 CSS hover 效果,不需要 JavaScript 互動

// =====================================================
// 
// Global: Smooth Scroll
// 平滑滾動錨點
// 
// =====================================================
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // 忽略空錨點
            if (href === '#' || href === '#video' || href === '#buy') {
                e.preventDefault();
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// =====================================================
// 
// Initialize All
// 初始化所有功能
// 
// =====================================================
const init = () => {
    console.log('ATEN Essentials Website Initialized');

    // 初始化各個 Session 的功能
    initHeroVideo();        // Session 1: Hero 影片
    initProductBar();       // Session 2: 產品列表
    // Session 3: 特色卡片(純 CSS hover,無需 JS)

    // 初始化全域功能
    initSmoothScroll();     // 平滑滾動
};

// ===== DOM Ready =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===== Export for potential module usage =====
window.ATENWebsite = {
    init,
    initHeroVideo,
    initProductBar,
    initSmoothScroll
};