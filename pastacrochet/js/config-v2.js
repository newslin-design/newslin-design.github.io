/* Alternate art pack for game-new.html. Loaded after config.js on purpose. */
(function () {
    const C = PC.config;
    const base = 'assets/v2/';

    C.VERSION = 'v1.0 · 新美術預覽';
    C.UI_ASSET_BASE = base;
    C.HIDE_INPUT_NAMES = true;
    C.HIDE_PATTERN_NAMES = true;
    C.HIDE_TEAM_TAGS = true;
    C.UNIFIED_TOPPINGS = true;
    C.COMPACT_ENGLISH_SECTION_LABELS = true;
    C.PHOTO_SCORE_HOVER = true;
    C.HIDE_DIFFICULTY_FIRE = true;
    C.BOTTOM_ORDER_DOCK = true;
    C.HIDE_ORDER_HELP_LABELS = true;
    C.DICE_ICON_ONLY = true;
    C.DICE_AFTER_DIALOG = true;
    C.HIDE_ORDER_RANDOM_HINT = true;
    C.HIDE_ORDER_DIALOG_EMOJI = true;
    C.HOME_LOGO = base + 'home_logo.png';
    C.STORY.images = [base + 'story1.png', base + 'story2.png', base + 'story3.png'];

    const patternFiles = {
        sakura: 'pattern_sakura.png',
        d012: 'pattern_d012.png',
        d032: 'pattern_d032.png',
        d004: 'pattern_d004.png',
        star: 'pattern_star.png',
        circle1: 'pattern_circle1.png',
        circle2: 'pattern_circle2.png',
        flower1: 'pattern_flower1.png',
        flower2: 'pattern_flower2.png',
        hexagon: 'pattern_hexagon.png'
    };
    Object.entries(patternFiles).forEach(([key, file]) => { C.PATTERNS[key].icon = base + file; });

    const sauceFiles = {
        '紅醬': 'sauce_red.png', '白醬': 'sauce_white.png', '青醬': 'sauce_green.png',
        '清炒': 'sauce_aglio.png', '粉紅醬': 'sauce_pink.png',
        '彈珠汽水': 'sauce_soda.png', '墨魚': 'sauce_squid.png'
    };
    Object.entries(sauceFiles).forEach(([key, file]) => { C.SAUCES[key].img = base + file; });

    const toppingFiles = {
        tomato: 'topping_tomato.png', squid: 'topping_Calamari.png', basil: 'topping_basil.png',
        cheese: 'topping_cheese.png', mushroom: 'topping_mushroom.png', blueberry: 'topping_blueberry.png',
        bacon: 'topping_bacon.png', broccoli: 'topping_broccoli.png', caviar: 'topping_caviari.png'
    };
    Object.entries(toppingFiles).forEach(([key, file]) => { C.TOPPINGS[key].img = base + file; });

    C.STORES[0].chef.img = base + 'chef_koala.png';
    C.STORES[1].chef.img = base + 'chef_cat.png';
    ['suzi', 'shulei', 'manshu', 'wenhua', 'nuangua', 'feili'].forEach(key => {
        C.CHARACTERS[key].img = base + 'char_' + key + '.png';
    });

    document.documentElement.classList.add('art-v2');
    document.documentElement.style.setProperty('--setup-bg', `url(../${base}setup_bg.png)`);
    document.documentElement.style.setProperty('--order-bg', `url(../${base}order_menu_bg.png)`);
    document.documentElement.style.setProperty('--dialog-say-bg', `url(../${base}dialogSay.png)`);
})();
