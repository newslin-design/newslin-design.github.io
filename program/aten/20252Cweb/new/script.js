// =====================================================
// 
// ATEN Essentials Website JavaScript
// 
// =====================================================


// Product Data
const productData = [
    {
        id: "VS4812",
        category: "HDMI Splitter",
        name: "2-Port True 4K HDMI Splitter",
        url: "https://www.aten.com/global/en/products/consumer-electronics/splitters--switches/vs4812/",
        eShopUrl: "11",
        icons: "https://assets.aten.com/webpage/shared/aten_essential/landing/VS4812_Icons.png",
        imageUrl: "https://assets.aten.com/webpage/shared/aten_essential/landing/VS4812.jpg",
        currency: "",
        price: null,
        features: [
            "EDID Sync™ – avoids boot-up display issues & optimizes resolutions",
            "One HDMI source shares two True 4K displays",
            "LPCM 7.1, Dolby® & DTS-HD Master Audio™",
            "HDMI out 2 on/off via pushbutton"
        ],
        description: "Your go-to HDMI splitter for home entertainment, workstation, and professional AV.",
        table: [
            {
                row: "Max. Resolution",
                content: "3840 x 2160 @ 60Hz (4:4:4)"
            },
            {
                row: "Max. Data Rate",
                content: "18 Gbps (6 Gbps per lane)"
            },
            {
                row: "Compliance",
                content: "HDMI (3D, Deep Color, 4K); HDCP 2.2"
            },
            {
                row: "Video Input",
                content: "1 x HDMI Type-A Female (Black)"
            },
            {
                row: "Video Output",
                content: "2 x HDMI Type-A Female (Black)"
            },
            {
                row: "Audio I/O (HDMI)",
                content: "1 Input / 2 Output"
            },
            {
                row: "LED Indicators",
                content: "2 x Port Selector (Orange)"
            },
            {
                row: "Power Connector",
                content: "1 x USB-C (5V/1A)"
            },
            {
                row: "Atmosphere Light",
                content: "2 (Orange, Bottom Side)"
            },
            {
                row: "Max. Distance",
                content: "3 m at 4K@60Hz (4:4:4)"
            },
            {
                row: "USB Cable Length",
                content: "1 x USB-C to Type-A (1 m)"
            }
        ]
    },
    {
        id: "VS4814",
        category: "HDMI Splitter",
        name: "4-Port True 4K HDMI Splitter",
        url: "https://www.aten.com/global/en/products/consumer-electronics/splitters--switches/vs4814/",
        eShopUrl: "",
        icons: "https://assets.aten.com/webpage/shared/aten_essential/landing/VS4814_Icons.png",
        imageUrl: "https://assets.aten.com/webpage/shared/aten_essential/landing/VS4814.jpg",
        currency: "NT$",
        price: null,
        features: [
            "EDID Sync™ – avoids boot-up display issues & optimizes resolutions",
            "One HDMI source shares four True 4K displays",
            "LPCM 7.1, Dolby® & DTS-HD Master Audio™",
            "Compact and aesthetic design with slick accent light"
        ],
        description: "Your go-to HDMI splitter for home entertainment, commercial, and professional AV.",
        table: [
            {
                row: "Max. Resolution",
                content: "3840 x 2160 @ 60Hz (4:4:4)"
            },
            {
                row: "Max. Data Rate",
                content: "18 Gbps (6 Gbps per lane)"
            },
            {
                row: "Compliance",
                content: "HDMI (3D, Deep Color, 4K); HDCP 2.2"
            },
            {
                row: "Video Input",
                content: "1 x HDMI Type-A Female (Black)"
            },
            {
                row: "Video Output",
                content: "4 x HDMI Type-A Female (Black)"
            },
            {
                row: "Audio I/O (HDMI)",
                content: "1 Input / 4 Output"
            },
            {
                row: "LED Indicators",
                content: "4 x Port Selector (Orange)"
            },
            {
                row: "Power Connector",
                content: "1 x USB-C (5V/1A)"
            },
            {
                row: "Atmosphere Light",
                content: "2 (Orange, Bottom Side)"
            },
            {
                row: "Max. Distance",
                content: "3 m at 4K@60Hz (4:4:4)"
            },
            {
                row: "USB Cable Length",
                content: "1 x USB-C to Type-A (1 m)"
            }
        ]
    },
    {
        id: "VS5812",
        category: "HDMI Splitter",
        name: "2-Port 8K HDMI Splitter",
        url: "https://www.aten.com/global/en/products/consumer-electronics/splitters--switches/vs5812/",
        eShopUrl: "",
        icons: "https://assets.aten.com/webpage/shared/aten_essential/landing/VS5812_Icons.png",
        imageUrl: "https://assets.aten.com/webpage/shared/aten_essential/landing/VS5812.jpg",
        currency: "NT$",
        price: null,
        features: [
            "EDID Sync™ – avoids boot-up display issues & optimizes resolutions",
            "One HDMI source shares two 8K@60 Hz / 4K@120 Hz displays",
            "LPCM 7.1, Dolby® & DTS-HD Master Audio™",
            "Supports VRR & ALLM"
        ],
        description: "Your go-to HDMI splitter for home theater, gaming, and professional AV.",
        table: [
            {
                row: "Max. Resolution",
                content: "7680 x 4320 @ 60Hz (4:2:0)"
            },
            {
                row: "Max. Data Rate",
                content: "48 Gbps"
            },
            {
                row: "Compliance",
                content: "HDMI (3D, Deep Color, 8K); HDCP 2.3"
            },
            {
                row: "Video Input",
                content: "1 x HDMI Type-A Female (Black)"
            },
            {
                row: "Video Output",
                content: "2 x HDMI Type-A Female (Black)"
            },
            {
                row: "Audio I/O (HDMI)",
                content: "1 Input / 2 Output"
            },
            {
                row: "LED Indicators",
                content: "2 x Port Selector (Orange)"
            },
            {
                row: "Power Connector",
                content: "1 x USB-C (5V/1A)"
            },
            {
                row: "Atmosphere Light",
                content: "2 (Orange, Bottom Side)"
            },
            {
                row: "Max. Distance",
                content: "1.5 m at 8K@60Hz (4:2:0)"
            },
            {
                row: "USB Cable Length",
                content: "1 x USB-C to Type-A (1 m)"
            }
        ]
    },
    {
        id: "VS4841",
        category: "HDMI Switch",
        name: "4-Port True 4K HDMI Switch",
        url: "https://www.aten.com/global/en/products/consumer-electronics/splitters--switches/vs4841/",
        eShopUrl: "",
        icons: "https://assets.aten.com/webpage/shared/aten_essential/landing/VS4841_Icons.png",
        imageUrl: "https://assets.aten.com/webpage/shared/aten_essential/landing/VS4841.jpg",
        currency: "NT$",
        price: null,
        features: [
            "RapidSync™ – high-speed AV switching",
            "Switches among four HDMI sources on a single True 4K display",
            "Dolby® & DTS-HD Master Audio™",
            "Video switching via pushbutton or IR remote"
        ],
        description: "Your go-to HDMI switch for home entertainment, professional AV, and efficient source management.",
        table: [
            {
                row: "Max. Resolution",
                content: "3840 x 2160 @ 60Hz (4:4:4)"
            },
            {
                row: "Max. Data Rate",
                content: "18 Gbps (6 Gbps per lane)"
            },
            {
                row: "Compliance",
                content: "HDMI (3D, Deep Color, 4K); HDCP 2.2"
            },
            {
                row: "Video Input",
                content: "4 x HDMI Type-A Female"
            },
            {
                row: "Video Output",
                content: "1 x HDMI Type-A Female"
            },
            {
                row: "Audio I/O (HDMI)",
                content: "4 Input / 1 Output"
            },
            {
                row: "Control",
                content: "1 x IR Receiver"
            },
            {
                row: "LED Indicators",
                content: "4 x Port Selector (Orange)"
            },
            {
                row: "Power Connector",
                content: "1 x USB-C (5V/1A)"
            },
            {
                row: "Atmosphere Light",
                content: "2 (Orange, Bottom Side)"
            },
            {
                row: "Max. Distance",
                content: "3 m at 3840 x 2160 @ 60Hz (4:4:4)"
            },
            {
                row: "USB Cable Length",
                content: "1 x USB Type-C to Type-A (1 m)"
            }
        ]
    },
    {
        id: "VS5821",
        category: "HDMI Switch",
        name: "2-Port 8K HDMI Switch",
        url: "https://www.aten.com/global/en/products/consumer-electronics/splitters--switches/vs5821/",
        eShopUrl: "",
        icons: "https://assets.aten.com/webpage/shared/aten_essential/landing/VS5821_Icons.png",
        imageUrl: "https://assets.aten.com/webpage/shared/aten_essential/landing/VS5821.jpg",
        currency: "NT$",
        price: null,
        features: [
            "RapidSync™ – high-speed AV switching",
            "8K@60 Hz / 4K@120 Hz exquisite visual clarity",
            "LPCM 7.1, Dolby Digital & DTS-HD Master Audio",
            "Supports VRR & ALLM"
        ],
        description: "Your go-to HDMI switch for modern gaming, personal entertainment, and professional AV.",
        table: [
            {
                row: "Max. Resolution",
                content: "7680 x 4320 @ 60Hz (4:2:0)"
            },
            {
                row: "Max. Data Rate",
                content: "48 Gbps"
            },
            {
                row: "Compliance",
                content: "HDMI (3D, Deep Color, 8K); HDCP 2.3"
            },
            {
                row: "Video Input",
                content: "2 x HDMI Type-A Female"
            },
            {
                row: "Video Output",
                content: "1 x HDMI Type-A Female"
            },
            {
                row: "Audio I/O (HDMI)",
                content: "2 Input / 1 Output"
            },
            {
                row: "Control",
                content: "Port Selection Pushbutton"
            },
            {
                row: "LED Indicators",
                content: "2 x Port Selector (Orange)"
            },
            {
                row: "Power Connector",
                content: "1 x USB-C (5V/1A)"
            },
            {
                row: "Atmosphere Light",
                content: "2 (Orange, Bottom Side)"
            },
            {
                row: "Max. Distance",
                content: "1.5 m at 7680 x 4320 @ 60Hz (4:2:0)"
            },
            {
                row: "USB Cable Length",
                content: "1 x USB Type-C to Type-A (1 m)"
            }
        ]
    }
];


// ===== Configuration =====
const CONFIG = {
    mediaPath: 'https://assets.aten.com/webpage/shared/aten_essential/landing/'  // Centralized media path management (images + videos)
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
        } else if (scrollProgress < 0.6) {
            // Phase 2: Sun fully risen
            sunWrapper.style.bottom = '-50%';
            sunWrapper.style.opacity = '0.6';
        } else {
            // Phase 3: Sun fading out
            const fadeProgress = (scrollProgress - 0.7) / 0.3;
            sunWrapper.style.bottom = '0%';
            sunWrapper.style.opacity = 1 - fadeProgress;
        }

        // Text animation
        if (scrollProgress < 0) {
            // Before text appears
            sunriseText.style.opacity = '0';
            sunriseText.style.transform = 'translate(-50%, -40%)';
        } else if (scrollProgress < 0.95) {
            // Phase 1: Text fading in and moving up (0.0 - 0.85)
            const textProgress = (scrollProgress - 0.4) / 0.2;
            const textY = -500 + (textProgress * 100);
            sunriseText.style.opacity = Math.min(1, textProgress);
            sunriseText.style.transform = `translate(-50%, ${textY}%)`;
            console.log(textY)
        } else {
            // Phase 2: Text fading out (0.85 - 1.0) - delayed fadeout
            const fadeProgress = (scrollProgress - 0.85) / 0.1;
            // const textProgress = (scrollProgress - 0.4) / 0.2;
            // const textY = -150 - (textProgress * 20);

            const textY = -300
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

    // Add click event to scenario dots for product navigation
    const scenarioDots = document.querySelectorAll('.scenario-dot');
    scenarioDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            const productUrl = dot.getAttribute('data-product-url');
            if (productUrl) {
                window.location.href = productUrl;
            }
        });

        // Add cursor pointer style
        dot.style.cursor = 'pointer';
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


const initProductShowcase = () => {
    const categoryButtons = document.getElementById('categoryButtons');
    const productThumbnails = document.getElementById('productThumbnails');
    const productPrice = document.getElementById('product-price');




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
                <div class="product-thumbnail-image-wrapper">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-thumbnail-image">
                </div>
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

        if (shopElement) {
            if (!product.eShopUrl) {
                shopElement.style.display = "none";
            } else {
                shopElement.style.display = "";
            }
            if (product.price) {
                productPrice.innerHTML = `<span style="font-size:16px">${product.currency}</span> <strong>${product.price}</strong>`
            } else {
                productPrice.innerHTML = "";
            }

            shopElement.href = product.eShopUrl;
        }
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
        html += `<th>
            <div class="spec-product-image-wrapper">
                <img src="${product.imageUrl}" alt="${product.name}" class="spec-product-image">
            </div>
        </th>`;
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