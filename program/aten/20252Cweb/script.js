/**
 * Global Product Data
 * 供後續 Session 使用
 */
const productData = [
    {
        description: "High performance connectivity solution",
        id: "p001",
        imageUrl: "https://placehold.co/400x400/333/orange?text=Product", // 預留位置，請更換
        name: "ATEN Demo Product",
        url: "#",
        eShopUrl: "#",
        price: 1200,
        currency: "NT$"
    }
    // 未來可在此新增更多產品
];

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initFABInteraction();
});

/**
 * 1. Scroll Animations (Intersection Observer)
 * 處理進入視窗後的動畫效果
 */
function initScrollAnimations() {
    // 選擇所有需要動畫的元素
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null,        // viewport
        rootMargin: '0px',
        threshold: 0.15    // 當元素出現 15% 時觸發
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 加入 .is-visible class 觸發 CSS 動畫
                entry.target.classList.add('is-visible');

                // 動畫只觸發一次，停止觀察該元素
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}

/**
 * 2. Floating Action Button Interaction
 * 點擊右下角按鈕觸發
 */
function initFABInteraction() {
    const fabBtn = document.getElementById('fab-video-btn');

    if (fabBtn) {
        fabBtn.addEventListener('click', () => {
            console.log("FAB Clicked: Opening Video Modal...");
            alert("Video Modal Logic triggered (Console Log)");
            // TODO: 未來這裡可以實作 Lightbox 彈出影片視窗
        });
    }
}