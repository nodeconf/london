(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Configuration module
 *
 * Centralised configuration values - mainly UI
 */

exports.default = {
  MOBILE_BREAKPOINT: 600, // Max-width breakpoint before behaving as mobile
  NAV_THRESHOLD: 50 // Distance from a section before navigation active state updates
};

},{}],2:[function(require,module,exports){
'use strict';

var _rules = require('./ui/rules');

var _rules2 = _interopRequireDefault(_rules);

var _hashFix = require('./ui/hash-fix');

var _hashFix2 = _interopRequireDefault(_hashFix);

var _header = require('./ui/header');

var _header2 = _interopRequireDefault(_header);

var _themeSwitch = require('./ui/theme-switch');

var _themeSwitch2 = _interopRequireDefault(_themeSwitch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Index module
 *
 * Import and initialises all other modules that are needed to run the app
 */

// Initialise UI rules
_rules2.default.init();
_hashFix2.default.init();
_header2.default.init();
_themeSwitch2.default.init();

},{"./ui/hash-fix":3,"./ui/header":4,"./ui/rules":5,"./ui/theme-switch":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Hash fix module
 *
 * In order to fix the issue of browser going to hash location before the 
 * resizes from uiRules modules happened, this repeats the action one tick 
 * after page load
 */

exports.default = { init: init };

/*
 * Bind update to window load event
 */

function init() {
  window.addEventListener('load', update);
}

/*
 * Snap to current hash location
 */
function update() {
  if (!location.hash) {
    return;
  }

  var snapToElement = document.querySelector(location.hash);

  if (!snapToElement) {
    return;
  }

  setTimeout(function () {
    window.scrollTo(window.scrollLeft, snapToElement.offsetTop);
  });
}

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _dom = require('../util/dom');

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Header module
 *
 * Controls header / nav behaviour on mobile
 */

exports.default = { init: init, toggle: toggle };


var DRAG_AREA = 100,
    DRAGGING_CLASSNAME = 'dragging',
    OPEN_CLASSNAME = 'open',
    SNAP_THRESHOLD_PERCENT = 20,
    CSS_PREFIXES = ['', '-webkit-', '-moz-', '-o-', '-ms-'],
    dragging = false,
    header = document.querySelector('[data-header]'),
    nav = document.querySelector('[data-navigation]'),
    navToggle = document.querySelector('[data-navigation-toggle]'),
    offset = 0,
    isOpen = false,
    firstMove,
    initialOffset,
    pageWidth,
    dragStart,
    enabled;

/*
 * Initialise header behaviour, bind DOM events
 */
function init() {
    resize();
    navToggle.addEventListener('mousedown', toggle);
    navToggle.addEventListener('touchstart', toggle);
    window.addEventListener('touchstart', touchStart);
    window.addEventListener('touchend', touchEnd);
    window.addEventListener('touchmove', touchMove);
    window.addEventListener('resize', resize);
    window.addEventListener('hashchange', function () {
        setOpen(false);
    });
}

/*
 * Toggle open state
 * @param {Boolean=} state
 */
function toggle() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var event;

    if (state instanceof Event) {
        event = state;
        state = null;
        event.stopPropagation();
        event.preventDefault();
    }

    state = typeof state === 'boolean' ? state : !isOpen;

    setOpen(state);
}

/*
 * Set navigation open state, reset styles and toggle open class
 *
 * @param {Boolean} state
 */
function setOpen(state) {
    isOpen = !!state;
    reset();
}

/*
 * Start dragging if within threshold on a single touch
 *
 * @param {TouchEvent} e
 */
function touchStart(e) {
    var isSingle = e.touches.length === 1,
        inArea = e.touches[0].pageX < DRAG_AREA;

    if (isTouchElementRec(e.target)) {
        return;
    }

    if (!dragging && isSingle && (inArea || isOpen)) {
        initialOffset = isOpen ? pageWidth : 0;
        dragStart = e.touches[0].pageX;
        dragging = true;
        firstMove = true;
        _dom2.default.addClass(nav, DRAGGING_CLASSNAME);
    }
}

/*
 * Recursively detect if element or an element's parent has the attribute
 * `data-touch-element` set to prevent behaviour interferences with other
 * touch components
 *
 * @param {TouchEvent} e
 */
function isTouchElementRec(element) {
    if (element.hasAttribute('data-touch-element')) {
        return true;
    }

    if (element.parentElement && element.parentElement !== document.body) {
        return isTouchElementRec(element.parentElement);
    }

    return false;
}

/*
 * Stop dragging if drag state is on
 */
function touchEnd() {
    var snap,
        snapThreshold = pageWidth * SNAP_THRESHOLD_PERCENT / 100;

    if (!dragging) {
        return;
    }

    dragging = false;
    _dom2.default.removeClass(nav, DRAGGING_CLASSNAME);

    snap = Math.abs(offset) >= snapThreshold;

    if (snap) {
        setOpen(!isOpen);
    } else {
        reset();
    }
}

/*
 * Set offset from touch position on touch move
 *
 * @param {TouchEvent} e
 */
function touchMove(e) {
    if (!dragging) {
        return;
    }

    if (firstMove) {
        e.preventDefault();
        firstMove = false;
    }

    setOffset(e.touches[0].pageX - dragStart);
}

/*
 * Set navigation offset depending on current drag offset, edit nav CSS
 *
 * @param {Number} val
 */
function setOffset(val) {
    offset = val;

    if (isOpen && offset > 0) {
        offset = 0;
    } else if (!isOpen && offset < 0) {
        offset = 0;
    } else if (!isOpen && offset > pageWidth) {
        offset = pageWidth;
    }

    var transform = 'translateX(' + (initialOffset + offset) + 'px' + ')';

    CSS_PREFIXES.forEach(function (prefix) {
        nav.style[prefix + 'transform'] = transform;
    });
}

/*
 * Update layout variables on resize, close nav and reset if not under mobile
 * breakpoint
 */
function resize() {
    var newState;

    pageWidth = window.innerWidth;
    newState = pageWidth <= _config2.default.MOBILE_BREAKPOINT;

    if (enabled !== newState) {
        reset();
        setOpen(false);
    }

    enabled = newState;
}

/*
 * Reset inline styles on nav
 */
function reset() {
    nav.removeAttribute('style');
    offset = 0;
    _dom2.default.toggleClass(header, OPEN_CLASSNAME, isOpen);
}

},{"../config":1,"../util/dom":7}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _dom = require('../util/dom');

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * UI Rules
 *
 * Module that initialises and maintains UI element's rules by triggering
 * functions (Hooks) for configured selectors when certain DOM events are
 * triggered
 */

exports.default = { init: init };


var MAX_PADDING = 400,
    SCROLL_DELAY = 3000,
    sections = document.querySelectorAll('section'),
    nav = document.querySelectorAll('ul.nav a'),
    y = 0,
    rules = {};

rules['.scroll-pointer'] = {
    init: function init(el) {
        setTimeout(function () {
            _dom2.default.addClass(el, 'show');
        }, SCROLL_DELAY);
    }
};

// Full height sections rule
rules['[full-height]'] = {
    resize: function resize(el) {
        var windowHeight = window.innerHeight,
            padding;

        el.style.height = '';
        el.style.paddingTop = el.style.paddingBottom = 0;

        var height = el.offsetHeight;

        if (height < windowHeight) {
            padding = (windowHeight - height) / 2;

            if (padding > MAX_PADDING) {
                padding = MAX_PADDING;
            }

            el.style.paddingTop = padding + 'px';
            el.style.paddingBottom = padding + 'px';
        } else {
            el.removeAttribute('style');
        }
    }
};

/*
 * Generic scrolling behaviours
 */
rules['body'] = {

    // Convert node lists for sections and nav to arrays and concatenate to
    // provide full Array or elements to reset when switching to mobile layout
    clear: Array.prototype.slice.call(sections).concat(Array.prototype.slice.call(nav)),

    scroll: function scroll() {
        updateFixedHeader();
        updateActiveSection();
    }
};

/*
 * Toggle fix-header class on body
 */
function updateFixedHeader() {
    _dom2.default.toggleClass(document.body, 'fix-header', document.body.scrollTop > sections[0].offsetHeight);
}

/*
 * Update active voice in navigation depending on current scrolled distance
 */
function updateActiveSection() {
    var i, y, current, href;

    if (location.pathname !== '/') {
        var link = document.querySelector('[href="' + location.pathname + '"]');

        if (link) {
            _dom2.default.addClass(link, 'active');
        }

        return;
    }

    for (i = 0; i < sections.length; i++) {
        y = sections[i].offsetTop - _config2.default.NAV_THRESHOLD + sections[i].offsetHeight;

        if (y >= document.body.scrollTop) {
            current = sections[i].id;
            break;
        }
    }

    for (i = 0; i < nav.length; i++) {
        href = nav[i].getAttribute('href');
        _dom2.default.toggleClass(nav[i], 'active', href === '#' + current || href === '/#' + current);
    }
}

/*
 * Initialise UI rules
 */
function init() {
    runHook('init');

    window.addEventListener('load', function () {
        runHook('resize');
        runHook('scroll');
    });

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
        hooks,
        n;

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

            if (windowWidth > _config2.default.MOBILE_BREAKPOINT) {
                fn.call(hooks, el);
            } else {
                resetElement(el);

                if (rules[selector].clear) {
                    for (n = 0; n < rules[selector].clear.length; n++) {
                        resetElement(rules[selector].clear[n]);
                    }
                }
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

},{"../config":1,"../util/dom":7}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _dom = require('../util/dom');

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Theme Switch module
 *
 * Controls the behaviour of theme switch for night / day
 */

var switches = document.querySelectorAll('[theme-switch]'),
    night = false;

exports.default = { init: init };

/*
 * Initialise module - Bind switch clicks if any, update state
 */

function init() {
    switches = Array.prototype.slice.call(switches);

    if (!switches.length) {
        return;
    }

    switches.forEach(function (el) {
        el.addEventListener('mousedown', toggle);
        el.addEventListener('touchstart', toggle);
    });

    update();
}

/*
 * Toggle night / day state
 *
 * @param {Event=} e
 */
function toggle() {
    var e = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    if (e) {
        event.stopPropagation();
        event.preventDefault();
    }

    night = !night;
    update();
}

/*
 * Update classnames according to current state
 */
function update() {
    _dom2.default.toggleClass(document.body, 'night', night);

    switches.forEach(function (el) {
        _dom2.default.toggleClass(el, 'on', night);
    });
}

},{"../util/dom":7}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/*
 * DOM utility module
 *
 * A small module containing utilities to work with the DOM
 */

exports.default = { hasClass: hasClass, removeClass: removeClass, addClass: addClass, toggleClass: toggleClass };

/*
 * Returns true if element has given className
 *
 * @param {HTMLElement} element
 * @return {Boolean}
 */

function hasClass(element, className) {
    return element.className.split(' ').indexOf(className) !== -1;
}

/*
 * Removes class from element if it currently has it
 *
 * @param {HTMLElement} element
 * @param {String} className
 */
function removeClass(element, className) {
    var classNames = element.className.split(' ');

    if (!hasClass(element, className)) {
        return;
    }

    classNames.splice(classNames.indexOf(classNames), 1);
    element.className = classNames.join(' ');
}

/*
 * Adds class to element if doesn't currently have it
 *
 * @param {HTMLElement} element
 * @param {String} className
 */
function addClass(element, className) {
    if (hasClass(element, className)) {
        return;
    }

    element.className += ' ' + className;
}

/*
 * Toggles class on element - adds it or removes it if a state value is passed
 * depending wether it's truthy of not
 *
 * @param {HTMLElement} element
 * @param {String} className
 * @param {Boolean=} state
 */
function toggleClass(element, className, state) {
    state = typeof state !== 'undefined' ? state : !hasClass(element, className);

    if (state) {
        addClass(element, className);
    } else {
        removeClass(element, className);
    }
}

},{}]},{},[2]);
