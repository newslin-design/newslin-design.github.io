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
// Session 2: Sunrise Animation
// Scroll-controlled sunrise effect with text
// 
// =====================================================
const initSunriseAnimation = () => {
    const sunriseSection = document.querySelector('.sunrise-section');
    const sunWrapper = document.querySelector('.sun-wrapper');
    const sunriseText = document.querySelector('.sunrise-text');

    if (!sunriseSection || !sunWrapper || !sunriseText) return;

    const handleSunrise = () => {
        const sectionTop = sunriseSection.offsetTop;
        const sectionHeight = sunriseSection.offsetHeight;
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        // Calculate scroll progress through the section (0 to 1)
        const scrollStart = sectionTop - windowHeight;
        const scrollEnd = sectionTop + sectionHeight - windowHeight;
        const scrollRange = scrollEnd - scrollStart;
        const scrollProgress = Math.max(0, Math.min(1, (scrollPosition - scrollStart) / scrollRange));

        // Animation timeline:
        // 0.0 - 0.6: Sun rises from bottom
        // 0.0 - 0.8: Text fades in and moves up
        // 0.85 - 1.0: Text fades out (delayed)

        // Sun animation (0.0 - 0.6)
        if (scrollProgress < 0.6) {
            // Phase 1: Sun rising
            const sunProgress = scrollProgress / 0.3;
            const sunY = -80 + (sunProgress * 25); // From -80% to -55%
            sunWrapper.style.bottom = `${sunY}%`;
            sunWrapper.style.opacity = sunProgress;
        } else if (scrollProgress < 0.5) {
            // Phase 2: Sun fully risen
            sunWrapper.style.bottom = '-50%';
            sunWrapper.style.opacity = '0.6';
        } else {
            // Phase 3: Sun fading out
            const fadeProgress = (scrollProgress - 0.7) / 0.1;
            sunWrapper.style.bottom = '0%';
            sunWrapper.style.opacity = 1 - fadeProgress;
        }

        // Text animation
        if (scrollProgress < 0) {
            // Before text appears
            sunriseText.style.opacity = '0';
            sunriseText.style.transform = 'translate(-50%, -40%)';
        } else if (scrollProgress < 0.85) {
            // Phase 1: Text fading in and moving up (0.0 - 0.85)
            const textProgress = (scrollProgress - 0.4) / 0.35;
            const textY = -450 + (textProgress * 120);
            sunriseText.style.opacity = Math.min(1, textProgress);
            sunriseText.style.transform = `translate(-50%, ${textY}%)`;
        } else {
            // Phase 2: Text fading out (0.85 - 1.0) - delayed fadeout
            const fadeProgress = (scrollProgress - 0.85) / 0.1;
            const textProgress = (scrollProgress - 0.4) / 0.2;
            const textY = -230 - (textProgress * 25);
            sunriseText.style.opacity = 1 - fadeProgress; // Fade out
            sunriseText.style.transform = `translate(-50%, ${textY}%)`;
        }
    };

    // Use requestAnimationFrame for smooth animation
    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleSunrise();
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll);

    // Initial call
    handleSunrise();
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
        url: "#detail-uc3022",
        eShopUrl: "#eshop-uc3022",
        icons: "./images/productIcon.png",
        imageUrl: "./images/product01.png",
        currency: "NT$",
        price: 4500,
        features: [
            "Mix and capture two non-HDCP HDMI videos",
            "Intuitive Android / iOS App control",
            "Supports real-time video editing"
        ],
        table: [
            {
                row: "Connectors",
                content: "2 x HDMI Type-A Female<br>1 x USB Type-C Female"
            },
            {
                row: "Max Resolution",
                content: "1080p @ 60Hz"
            },
            {
                row: "Housing",
                content: "Plastic"
            },
            {
                row: "Weight",
                content: "150g"
            },
            {
                row: "Dimensions (L×W×H)",
                content: "6.1 x 5.65 x 1.52 cm"
            },
            {
                row: "Compatible OS",
                content: "Windows | macOS | Linux"
            }
        ]
    },
    {
        id: "UC3020",
        category: "Video Capture",
        name: "CAMLIVE™ HDMI to USB-C UVC Video Capture",
        url: "#detail-uc3020",
        eShopUrl: "#eshop-uc3020",
        icons: "./images/productIcon.png",
        imageUrl: "./images/product02.png",
        currency: "NT$",
        price: 3200,
        features: [
            "4K HDMI input support",
            "Zero latency pass-through",
            "Compatible with major streaming software"
        ],
        table: [
            {
                row: "Connectors",
                content: "1 x HDMI Type-A Female<br>1 x USB Type-C Female"
            },
            {
                row: "Max Resolution",
                content: "4K @ 30Hz"
            },
            {
                row: "Housing",
                content: "Aluminum"
            },
            {
                row: "Weight",
                content: "95g"
            },
            {
                row: "Dimensions (L×W×H)",
                content: "5.2 x 4.8 x 1.3 cm"
            },
            {
                row: "Compatible OS",
                content: "Windows | macOS | Linux"
            }
        ]
    },
    {
        id: "UC3025",
        category: "Video Capture",
        name: "StreamLIVE™ HD Multi-Format Video Capture",
        url: "#detail-uc3025",
        eShopUrl: "#eshop-uc3025",
        icons: "./images/productIcon.png",
        imageUrl: "./images/product03.png",
        currency: "NT$",
        price: 5800,
        features: [
            "Multi-format input support (HDMI, SDI, Component)",
            "Hardware encoding for smooth performance",
            "Professional audio mixing capabilities"
        ],
        table: [
            {
                row: "Connectors",
                content: "1 x HDMI<br>1 x SDI<br>1 x Component<br>1 x USB 3.0"
            },
            {
                row: "Max Resolution",
                content: "1080p @ 60Hz"
            },
            {
                row: "Housing",
                content: "Metal"
            },
            {
                row: "Weight",
                content: "420g"
            },
            {
                row: "Dimensions (L×W×H)",
                content: "14.5 x 10.2 x 3.8 cm"
            },
            {
                row: "Compatible OS",
                content: "Windows | macOS"
            }
        ]
    },
    // KVM Switches Category
    {
        id: "CS1922",
        category: "KVM Switches",
        name: "2-Port USB 3.0 4K DisplayPort KVMP™ Switch",
        url: "#detail-cs1922",
        eShopUrl: "#eshop-cs1922",
        icons: "./images/productIcon.png",
        imageUrl: "./images/product04.png",
        currency: "NT$",
        price: 6500,
        features: [
            "4K @ 60Hz DisplayPort support",
            "USB 3.0 SuperSpeed hub",
            "Audio mixing and switching"
        ],
        table: [
            {
                row: "Computer Connections",
                content: "2"
            },
            {
                row: "Port Selection",
                content: "Pushbutton | Hotkey"
            },
            {
                row: "Max Resolution",
                content: "4K @ 60Hz (4:4:4)"
            },
            {
                row: "USB Ports",
                content: "4 x USB 3.0"
            },
            {
                row: "Housing",
                content: "Metal"
            },
            {
                row: "Weight",
                content: "680g"
            },
            {
                row: "Dimensions (L×W×H)",
                content: "27.8 x 8.3 x 5.2 cm"
            },
            {
                row: "Compatible OS",
                content: "Windows | macOS | Linux"
            }
        ]
    },
    {
        id: "CS1942DP",
        category: "KVM Switches",
        name: "4-Port USB 3.0 Dual Display KVMP™ Switch",
        url: "#detail-cs1942dp",
        eShopUrl: "#eshop-cs1942dp",
        icons: "./images/productIcon.png",
        imageUrl: "./images/product05.png",
        currency: "NT$",
        price: 8900,
        features: [
            "Dual 4K display support",
            "4-port USB 3.0 hub",
            "Independent audio switching"
        ],
        table: [
            {
                row: "Computer Connections",
                content: "4"
            },
            {
                row: "Port Selection",
                content: "Pushbutton | Hotkey | RS-232"
            },
            {
                row: "Max Resolution",
                content: "Dual 4K @ 60Hz (4:4:4)"
            },
            {
                row: "USB Ports",
                content: "4 x USB 3.0"
            },
            {
                row: "Housing",
                content: "Metal"
            },
            {
                row: "Weight",
                content: "1.2kg"
            },
            {
                row: "Dimensions (L×W×H)",
                content: "43.5 x 16.2 x 5.5 cm"
            },
            {
                row: "Compatible OS",
                content: "Windows | macOS | Linux"
            }
        ]
    },
    {
        id: "CS782DP",
        category: "KVM Switches",
        name: "2-Port USB DisplayPort Cable KVM Switch",
        url: "#detail-cs782dp",
        eShopUrl: "#eshop-cs782dp",
        icons: "./images/productIcon.png",
        imageUrl: "./images/product06.png",
        currency: "NT$",
        price: 3800,
        features: [
            "DisplayPort 1.2 compliant",
            "Compact cable design",
            "Hotkey and pushbutton switching"
        ],
        table: [
            {
                row: "Computer Connections",
                content: "2"
            },
            {
                row: "Port Selection",
                content: "Pushbutton | Hotkey"
            },
            {
                row: "Max Resolution",
                content: "4K @ 60Hz (4:2:0)"
            },
            {
                row: "USB Ports",
                content: "2 x USB 2.0"
            },
            {
                row: "Housing",
                content: "Plastic"
            },
            {
                row: "Weight",
                content: "180g"
            },
            {
                row: "Dimensions (L×W×H)",
                content: "7.06 x 7.37 x 2.54 cm"
            },
            {
                row: "Compatible OS",
                content: "Windows | macOS | Linux"
            }
        ]
    },
    // Video Converters Category
    {
        id: "VC480",
        category: "Video Converters",
        name: "DisplayPort to HDMI 4K Converter",
        url: "#detail-vc480",
        eShopUrl: "#eshop-vc480",
        icons: "./images/productIcon.png",
        imageUrl: "./images/product07.png",
        currency: "NT$",
        price: 2100,
        features: [
            "4K @ 30Hz conversion",
            "HDCP compliant",
            "Compact and portable design"
        ],
        table: [
            {
                row: "Input",
                content: "1 x DisplayPort Female"
            },
            {
                row: "Output",
                content: "1 x HDMI Type-A Female"
            },
            {
                row: "Max Resolution",
                content: "4K @ 30Hz"
            },
            {
                row: "HDCP Support",
                content: "HDCP 1.4"
            },
            {
                row: "Housing",
                content: "Plastic"
            },
            {
                row: "Weight",
                content: "48g"
            },
            {
                row: "Dimensions (L×W×H)",
                content: "5.59 x 5.33 x 1.78 cm"
            }
        ]
    },
    {
        id: "VC986",
        category: "Video Converters",
        name: "4K HDMI to 3G-SDI Converter",
        url: "#detail-vc986",
        eShopUrl: "#eshop-vc986",
        icons: "./images/productIcon.png",
        imageUrl: "./images/product08.png",
        currency: "NT$",
        price: 4200,
        features: [
            "4K HDMI to 3G-SDI conversion",
            "Supports embedded audio",
            "Loop-through output"
        ],
        table: [
            {
                row: "Input",
                content: "1 x HDMI Type-A Female"
            },
            {
                row: "Output",
                content: "2 x SDI BNC Female (Loop-through)"
            },
            {
                row: "Max Resolution",
                content: "4K @ 30Hz"
            },
            {
                row: "HDCP Support",
                content: "HDCP 1.4"
            },
            {
                row: "Housing",
                content: "Metal"
            },
            {
                row: "Weight",
                content: "285g"
            },
            {
                row: "Dimensions (L×W×H)",
                content: "11.2 x 7.4 x 2.8 cm"
            }
        ]
    },
    {
        id: "VC882",
        category: "Video Converters",
        name: "HDMI to VGA Scaler with Audio",
        url: "#detail-vc882",
        eShopUrl: "#eshop-vc882",
        icons: "./images/productIcon.png",
        imageUrl: "./images/product09.png",
        currency: "NT$",
        price: 2800,
        features: [
            "HDMI to VGA conversion with scaling",
            "3.5mm audio output",
            "Multiple resolution support"
        ],
        table: [
            {
                row: "Input",
                content: "1 x HDMI Type-A Female"
            },
            {
                row: "Output",
                content: "1 x VGA Female<br>1 x 3.5mm Audio Jack"
            },
            {
                row: "Max Resolution",
                content: "1080p @ 60Hz"
            },
            {
                row: "HDCP Support",
                content: "HDCP 1.2"
            },
            {
                row: "Housing",
                content: "Plastic"
            },
            {
                row: "Weight",
                content: "135g"
            },
            {
                row: "Dimensions (L×W×H)",
                content: "8.9 x 5.6 x 2.2 cm"
            }
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
    initSunriseAnimation();     // Session 2: Sunrise animation
    initScrollAnimations();     // Session 3: Scroll animations
    initProductShowcase();      // Session 3: Product showcase
    initScenariosTabs();        // Session 7: Scenarios tabs
    initProductGallery();       // Session 8: Product gallery
    initSpecifications();       // Session 12: Specifications table

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
            </div>
        `;

        categoriesContainer.appendChild(categoryDiv);
    });

    // Add global navigation functionality (for desktop)
    const galleryContent = document.querySelector('.product-gallery-content');
    const prevBtn = galleryContent?.querySelector('.gallery-nav.prev');
    const nextBtn = galleryContent?.querySelector('.gallery-nav.next');

    if (prevBtn && nextBtn && categoriesContainer) {
        prevBtn.addEventListener('click', () => {
            categoriesContainer.scrollBy({ left: -600, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            categoriesContainer.scrollBy({ left: 600, behavior: 'smooth' });
        });
    }
};

// =====================================================
// 
// Session 12: Specifications
// Product comparison table functionality
// 
// =====================================================

const initSpecifications = () => {
    const categoriesContainer = document.querySelector('#specCategories');
    const tableContainer = document.querySelector('#specTable');

    if (!categoriesContainer || !tableContainer) return;

    // Get unique categories
    const categories = [...new Set(productData.map(p => p.category))];

    // Generate category buttons
    categories.forEach((category, index) => {
        const btn = document.createElement('button');
        btn.className = `spec-category-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = category;
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.spec-category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Generate table for this category
            generateComparisonTable(category);
        });
        categoriesContainer.appendChild(btn);
    });

    // Generate initial table (first category)
    if (categories.length > 0) {
        generateComparisonTable(categories[0]);
    }
};

const generateComparisonTable = (category) => {
    const tableContainer = document.querySelector('#specTable');
    if (!tableContainer) return;

    // Filter products by category
    const products = productData.filter(p => p.category === category && p.table);

    if (products.length === 0) {
        tableContainer.innerHTML = '<tr><td colspan="100%" style="text-align: center; color: var(--text-secondary);">No specifications available for this category.</td></tr>';
        return;
    }

    // Get all unique row labels
    const allRows = new Set();
    products.forEach(product => {
        if (product.table) {
            product.table.forEach(item => allRows.add(item.row));
        }
    });
    const rowLabels = Array.from(allRows);

    // Generate table HTML
    let html = '<thead><tr>';

    // Header row with product images
    products.forEach(product => {
        html += `<th><img src="${product.imageUrl}" alt="${product.name}" class="spec-product-image"></th>`;
    });
    html += '</tr><tr>';

    // Product names row
    products.forEach(product => {
        html += `<th><div class="spec-product-name">${product.name}</div></th>`;
    });
    html += '</tr></thead><tbody>';

    // Specification rows
    rowLabels.forEach(rowLabel => {
        html += '<tr>';

        products.forEach(product => {
            const tableItem = product.table?.find(item => item.row === rowLabel);
            const content = tableItem ? tableItem.content : '—';
            html += `<td class="spec-cell">
                <div class="spec-row-label">${rowLabel}</div>
                <div class="spec-row-content">${content}</div>
            </td>`;
        });

        html += '</tr>';
    });

    html += '</tbody>';
    tableContainer.innerHTML = html;
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
    initSunriseAnimation,
    initScrollAnimations,
    initProductShowcase,
    initScenariosTabs,
    initSmoothScroll
};