(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _rules = require('./ui/rules');

var _rules2 = _interopRequireDefault(_rules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Index module
 *
 * Import and initialises all other modules that are needed to run the app
 */

// Initialise UI rules
_rules2.default.init();

window.addEventListener('load', function () {
  _rules2.default.init();
});

},{"./ui/rules":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/*
 * UI Rules
 *
 * Module that initialises and maintains UI element's rules by triggering
 * functions (Hooks) for configured selectors when certain DOM events are
 * triggered
 */

var sections = document.querySelectorAll('section'),
    nav = document.querySelectorAll('ul.nav a'),
    y = 0,
    rules = {},
    NAV_THRESHOLD = 50,
    MOBILE_BREAK = 600;

// Full height sections rule
rules['[full-height]'] = {
    resize: function resize(el) {
        var windowHeight = window.innerHeight,
            paddingTop;

        el.style.height = '';
        el.style.paddingTop = el.style.paddingBottom = 0;

        var height = el.offsetHeight;

        if (height < windowHeight) {
            paddingTop = (windowHeight - height) / 2;
            el.style.paddingTop = paddingTop + 'px';
            el.style.paddingBottom = paddingTop + 'px';
        } else {
            el.removeAttribute('style');
        }
    }
};

/*
 * Generic scrolling behaviours
 */
rules['body'] = {
    scroll: function scroll() {
        updateFixedHeader();
        updateActiveSection();
    }
};

/*
 * Toggle fix-header class on body
 */
function updateFixedHeader() {
    if (document.body.scrollTop > sections[0].offsetHeight) {
        document.body.className = 'fix-header';
    } else {
        document.body.className = '';
    }
}

/*
 * Update active voice in navigation depending on current scrolled distance
 */
function updateActiveSection() {
    var i, y, current, href;

    if (location.pathname !== '/') {
        return;
    }

    for (i = 0; i < sections.length; i++) {
        y = sections[i].offsetTop - NAV_THRESHOLD + sections[i].offsetHeight;

        if (y >= document.body.scrollTop) {
            current = sections[i].id;
            break;
        }
    }

    for (i = 0; i < nav.length; i++) {
        href = nav[i].getAttribute('href');

        if (href === '#' + current || href === '/#' + current) {
            nav[i].className = 'active';
        } else {
            nav[i].className = '';
        }
    }
}

/*
 * Initialise UI rules
 */
function init() {
    runHook('init');

    window.addEventListener('scroll', function () {
        runHook('scroll');
    });

    window.addEventListener('resize', function () {
        runHook('resize');
    });

    runHook('resize');
    runHook('scroll');
}

/*
 * Run specific UI rule's hook
 *
 * @param {Object} hook
 */
function runHook(hook) {
    var windowWidth = window.innerWidth,
        selector,
        fn,
        el,
        elements,
        i,
        hooks;

    y = document.body.scrollTop;

    for (selector in rules) {
        if (!rules.hasOwnProperty(selector)) {
            continue;
        }

        hooks = rules[selector];
        fn = hooks[hook];

        if (!fn) {
            continue;
        }

        elements = document.querySelectorAll(selector);

        for (i = 0; i < elements.length; i++) {
            el = elements[i];

            if (windowWidth > MOBILE_BREAK) {
                fn.call(hooks, el);
            } else {
                resetElement(el);
            }
        }
    }
}

/*
 * Reset element's style
 *
 * @param {DOMElement} el
 */
function resetElement(el) {
    if (el.getAttribute('style')) {
        el.removeAttribute('style');
    }
}

exports.default = { init: init };

},{}]},{},[1]);
