// =====================================================
// 
// ATEN Essentials Website JavaScript
// 
// =====================================================

// ===== Configuration =====
const CONFIG = {
    mediaPath: './images/'  // Centralized media path management (images + videos)
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
// Auto-play video control
// 
// =====================================================
const initHeroVideo = () => {
    const video = document.querySelector('.hero-video');

    if (!video) return;

    // Ensure video is muted and auto-plays (mobile device requirement)
    video.muted = true;
    video.play().catch(error => {
        console.log('Video autoplay failed:', error);
    });

    // Remove poster when video can play
    video.addEventListener('canplay', () => {
        video.style.opacity = '1';
    });

    // Video load error handling
    video.addEventListener('error', () => {
        console.error('Video loading failed');
    });
};

// =====================================================
// 
// Floating Play Button
// Floating play button functionality
// 
// =====================================================
const initFloatingPlayButton = () => {
    const playButton = document.getElementById('playButton');
    const video = document.querySelector('.hero-video');

    if (!playButton || !video) return;

    playButton.addEventListener('click', () => {
        // Scroll to hero section
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = heroSection.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // If video is paused, play it
            if (video.paused) {
                video.play().catch(error => {
                    console.log('Video playback failed:', error);
                });
            }
        }

        // Add click animation effect
        playButton.style.transform = 'scale(0.9)';
        setTimeout(() => {
            playButton.style.transform = '';
        }, 150);
    });

    // Adjust button display based on scroll position
    const handleScroll = () => {
        const heroSection = document.getElementById('hero');
        if (!heroSection) return;

        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        const scrollPosition = window.scrollY + window.innerHeight;

        // Slightly fade button if scrolled past hero section
        if (window.scrollY > heroBottom) {
            playButton.style.opacity = '0.7';
        } else {
            playButton.style.opacity = '1';
        }
    };

    window.addEventListener('scroll', debounce(handleScroll, 100));
};

// =====================================================
// 
// Session 2: Scroll Video Section
// Video playback controlled by scroll position
// 
// =====================================================
const initScrollVideo = () => {
    const scrollVideoSection = document.querySelector('.scroll-video-section');
    const video = document.querySelector('.scroll-video');

    if (!scrollVideoSection || !video) return;

    // Preload video metadata
    video.load();

    let isVideoReady = false;

    // Wait for video metadata to load
    video.addEventListener('loadedmetadata', () => {
        isVideoReady = true;
        console.log('Scroll video loaded, duration:', video.duration);
    });

    // Handle scroll-based video playback
    const handleScrollVideo = () => {
        if (!isVideoReady) return;

        const sectionTop = scrollVideoSection.offsetTop;
        const sectionHeight = scrollVideoSection.offsetHeight;
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        // Calculate how far user has scrolled through the section
        const scrollStart = sectionTop - windowHeight;
        const scrollEnd = sectionTop + sectionHeight - windowHeight;
        const scrollRange = scrollEnd - scrollStart;
        const scrollProgress = Math.max(0, Math.min(1, (scrollPosition - scrollStart) / scrollRange));

        // Update video currentTime based on scroll progress
        if (scrollProgress >= 0 && scrollProgress <= 1) {
            const targetTime = scrollProgress * video.duration;

            // Only update if difference is significant (prevents jittering)
            if (Math.abs(video.currentTime - targetTime) > 0.1) {
                video.currentTime = targetTime;
            }
        }
    };

    // Use requestAnimationFrame for smooth video scrubbing
    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScrollVideo();
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll);

    // Initial call
    handleScrollVideo();
};

// =====================================================
// 
// Session 7: Scenarios
// Tab switching functionality
// 
// =====================================================

const initScenariosTabs = () => {
    const tabs = document.querySelectorAll('.scenario-tab');
    const panels = document.querySelectorAll('.scenario-panel');

    if (!tabs.length || !panels.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active class to clicked tab and corresponding panel
            tab.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
};

// =====================================================
// 
// Session 3: Product Showcase
// Product display and selection functionality
// 
// =====================================================

// Scroll Animation Observer
const initScrollAnimations = () => {
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    if (!animateElements.length) return;

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(element => {
        observer.observe(element);
    });
};

// Product Data
const productData = [
    // Video Capture Category
    {
        id: "UC3022",
        category: "Video Capture",
        name: "CAMLIVE™ PRO Dual HDMI to USB-C UVC Video Capture",
        description: "Capture unencrypted HDMI video signal from your camcorder or DSLR up to 1080P @ 60Hz with two separate channels.",
        imageUrl: "./images/product01.png",
        url: "#detail-uc3022",
        eShopUrl: "#eshop-uc3022",
        price: 4500,
        currency: "NT$",
        icons: "./images/productIcon.png",
        features: [
            "Mix and capture two non-HDCP HDMI videos",
            "Intuitive Android / iOS App control",
            "Supports real-time video editing"
        ]
    },
    {
        id: "UC3020",
        category: "Video Capture",
        name: "CAMLIVE™ HDMI to USB-C UVC Video Capture",
        description: "Professional single-channel HDMI capture device with USB-C connectivity for seamless streaming and recording.",
        imageUrl: "./images/product02.png",
        url: "#detail-uc3020",
        eShopUrl: "#eshop-uc3020",
        price: 3200,
        currency: "NT$",
        icons: "./images/productIcon.png",
        features: [
            "4K HDMI input support",
            "Zero latency pass-through",
            "Compatible with major streaming software"
        ]
    },
    {
        id: "UC3025",
        category: "Video Capture",
        name: "StreamLIVE™ HD Multi-Format Video Capture",
        description: "Versatile capture solution supporting multiple video formats for professional content creation.",
        imageUrl: "./images/product03.png",
        url: "#detail-uc3025",
        eShopUrl: "#eshop-uc3025",
        price: 5800,
        currency: "NT$",
        icons: "./images/productIcon.png",
        features: [
            "Multi-format input support (HDMI, SDI, Component)",
            "Hardware encoding for smooth performance",
            "Professional audio mixing capabilities"
        ]
    },
    // KVM Switches Category
    {
        id: "CS1922",
        category: "KVM Switches",
        name: "2-Port USB 3.0 4K DisplayPort KVMP™ Switch",
        description: "High-performance KVM switch with 4K DisplayPort support and USB 3.0 for fast data transfer.",
        imageUrl: "./images/product04.png",
        url: "#detail-cs1922",
        eShopUrl: "#eshop-cs1922",
        price: 6500,
        currency: "NT$",
        icons: "./images/productIcon.png",
        features: [
            "4K @ 60Hz DisplayPort support",
            "USB 3.0 SuperSpeed hub",
            "Audio mixing and switching"
        ]
    },
    {
        id: "CS1942DP",
        category: "KVM Switches",
        name: "4-Port USB 3.0 Dual Display KVMP™ Switch",
        description: "Control four computers with dual 4K displays using a single keyboard, mouse, and monitor setup.",
        imageUrl: "./images/product05.png",
        url: "#detail-cs1942dp",
        eShopUrl: "#eshop-cs1942dp",
        price: 8900,
        currency: "NT$",
        icons: "./images/productIcon.png",
        features: [
            "Dual 4K display support",
            "4-port USB 3.0 hub",
            "Independent audio switching"
        ]
    },
    {
        id: "CS782DP",
        category: "KVM Switches",
        name: "2-Port USB DisplayPort Cable KVM Switch",
        description: "Compact cable KVM switch with DisplayPort connectivity for space-saving setups.",
        imageUrl: "./images/product06.png",
        url: "#detail-cs782dp",
        eShopUrl: "#eshop-cs782dp",
        price: 3800,
        currency: "NT$",
        icons: "./images/productIcon.png",
        features: [
            "DisplayPort 1.2 compliant",
            "Compact cable design",
            "Hotkey and pushbutton switching"
        ]
    },
    // Video Converters Category
    {
        id: "VC480",
        category: "Video Converters",
        name: "DisplayPort to HDMI 4K Converter",
        description: "Convert DisplayPort signals to HDMI with 4K resolution support for maximum compatibility.",
        imageUrl: "./images/product07.png",
        url: "#detail-vc480",
        eShopUrl: "#eshop-vc480",
        price: 2100,
        currency: "NT$",
        icons: "./images/productIcon.png",
        features: [
            "4K @ 30Hz conversion",
            "HDCP compliant",
            "Compact and portable design"
        ]
    },
    {
        id: "VC986",
        category: "Video Converters",
        name: "4K HDMI to 3G-SDI Converter",
        description: "Professional-grade converter from HDMI to SDI for broadcast and production environments.",
        imageUrl: "./images/product08.png",
        url: "#detail-vc986",
        eShopUrl: "#eshop-vc986",
        price: 4200,
        currency: "NT$",
        icons: "./images/productIcon.png",
        features: [
            "4K HDMI to 3G-SDI conversion",
            "Supports embedded audio",
            "Loop-through output"
        ]
    },
    {
        id: "VC882",
        category: "Video Converters",
        name: "HDMI to VGA Scaler with Audio",
        description: "Scale and convert HDMI signals to VGA with integrated audio support for legacy displays.",
        imageUrl: "./images/product09.png",
        url: "#detail-vc882",
        eShopUrl: "#eshop-vc882",
        price: 2800,
        currency: "NT$",
        icons: "./images/productIcon.png",
        features: [
            "HDMI to VGA conversion with scaling",
            "3.5mm audio output",
            "Multiple resolution support"
        ]
    }
];

const initProductShowcase = () => {
    const categoryButtons = document.getElementById('categoryButtons');
    const productThumbnails = document.getElementById('productThumbnails');

    if (!categoryButtons || !productThumbnails) return;

    // Get unique categories
    const categories = [...new Set(productData.map(product => product.category))];

    let currentCategory = categories[0];
    let currentProductIndex = 0;

    // Render category buttons
    const renderCategoryButtons = () => {
        categoryButtons.innerHTML = categories.map(category => `
            <button class="category-btn ${category === currentCategory ? 'active' : ''}" 
                    data-category="${category}">
                ${category}
            </button>
        `).join('');

        // Add event listeners to category buttons
        categoryButtons.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentCategory = btn.dataset.category;
                currentProductIndex = 0;
                renderCategoryButtons();
                renderProductThumbnails();
                updateProductDisplay();
            });
        });
    };

    // Render product thumbnails
    const renderProductThumbnails = () => {
        const filteredProducts = productData.filter(p => p.category === currentCategory);

        productThumbnails.innerHTML = filteredProducts.map((product, index) => `
            <div class="product-thumbnail ${index === currentProductIndex ? 'active' : ''}" 
                 data-index="${index}">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-thumbnail-image">
                <div class="product-thumbnail-id">${product.id}</div>
                <div class="product-thumbnail-name">${product.name}</div>
            </div>
        `).join('');

        // Add event listeners to product thumbnails
        productThumbnails.querySelectorAll('.product-thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                currentProductIndex = parseInt(thumb.dataset.index);
                renderProductThumbnails();
                updateProductDisplay();
            });
        });
    };

    // Update product display
    const updateProductDisplay = () => {
        const filteredProducts = productData.filter(p => p.category === currentCategory);
        const product = filteredProducts[currentProductIndex];

        if (!product) return;

        // Update product name
        const nameElement = document.getElementById('displayProductName');
        if (nameElement) nameElement.textContent = product.name;

        // Update features
        const featuresElement = document.getElementById('displayProductFeatures');
        if (featuresElement) {
            featuresElement.innerHTML = product.features.map(feature =>
                `<li>${feature}</li>`
            ).join('');
        }

        // Update product image
        const imageElement = document.getElementById('displayProductImage');
        if (imageElement) {
            imageElement.src = product.imageUrl;
            imageElement.alt = product.name;
        }

        // Update product icons
        const iconsElement = document.getElementById('displayProductIcons');
        if (iconsElement) {
            iconsElement.src = product.icons;
            iconsElement.alt = `${product.name} features`;
        }

        // Update links
        const linkElement = document.getElementById('displayProductLink');
        if (linkElement) linkElement.href = product.url;

        const shopElement = document.getElementById('displayProductShop');
        if (shopElement) shopElement.href = product.eShopUrl;
    };

    // Initialize
    renderCategoryButtons();
    renderProductThumbnails();
    updateProductDisplay();
};

// =====================================================
// 
// Global: Smooth Scroll
// Smooth scrolling for anchor links
// 
// =====================================================
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Ignore empty anchors
            if (href === '#' || href === '#video' || href === '#buy' || href === '#quote') {
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
// Initialize all features
// 
// =====================================================
const init = () => {
    console.log('ATEN Essentials Website Initialized');

    // Initialize each Session's functionality
    initHeroVideo();            // Session 1: Hero video
    initFloatingPlayButton();   // Floating play button
    initScrollVideo();          // Session 2: Scroll-controlled video
    initScrollAnimations();     // Session 3: Scroll animations
    initProductShowcase();      // Session 3: Product showcase
    initScenariosTabs();        // Session 7: Scenarios tabs
    initProductGallery();       // Session 8: Product gallery

    // Initialize global functionality
    initSmoothScroll();         // Smooth scrolling
};

// =====================================================
// 
// Session 8: Product Gallery
// Dynamic product gallery with categories and carousel
// 
// =====================================================

const initProductGallery = () => {
    const categoriesContainer = document.querySelector('.product-categories');
    if (!categoriesContainer) return;

    // Group products by category
    const productsByCategory = {};
    productData.forEach(product => {
        if (!productsByCategory[product.category]) {
            productsByCategory[product.category] = [];
        }
        productsByCategory[product.category].push(product);
    });

    // Generate HTML for each category
    Object.entries(productsByCategory).forEach(([category, products]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'product-category';

        categoryDiv.innerHTML = `
            <h3 class="category-name">${category}</h3>
            <div class="product-carousel-wrapper">
                <button class="carousel-nav prev" aria-label="Previous products">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <div class="product-carousel">
                    ${products.map(product => `
                        <a href="${product.url || '#'}" class="product-mini-card" target="_blank" rel="noopener noreferrer">
                            <div class="product-mini-image-wrapper">
                                <img src="${product.imageUrl}" alt="${product.name}" class="product-mini-image">
                            </div>
                            <div class="product-mini-id">${product.id}</div>
                            <div class="product-mini-name">${product.name}</div>
                        </a>
                    `).join('')}
                </div>
                <button class="carousel-nav next" aria-label="Next products">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        `;

        categoriesContainer.appendChild(categoryDiv);

        // Add carousel navigation functionality
        const carousel = categoryDiv.querySelector('.product-carousel');
        const prevBtn = categoryDiv.querySelector('.carousel-nav.prev');
        const nextBtn = categoryDiv.querySelector('.carousel-nav.next');

        if (prevBtn && nextBtn && carousel) {
            prevBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: -400, behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: 400, behavior: 'smooth' });
            });
        }
    });
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
    initFloatingPlayButton,
    initScrollVideo,
    initScrollAnimations,
    initProductShowcase,
    initScenariosTabs,
    initSmoothScroll
};