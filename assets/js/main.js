/* ==========================================================================
   MamaMilkiva website: motion and small enhancements.
   Progressive enhancement only: every page works without this file.
   Motion stops when the OS asks for reduced motion or when the visitor
   uses the "pause animations" button in the footer.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  window.__mmReady = true;

  var reduceMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var fineMq = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;
  var STORE_KEY = 'mamamilkiva-motion';
  var userOff = false;
  try { userOff = window.localStorage.getItem(STORE_KEY) === 'off'; } catch (e) { /* storage unavailable */ }

  function osReduce() { return !!(reduceMq && reduceMq.matches); }
  function motionOff() { return osReduce() || userOff; }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function safe(fn) { try { fn(); } catch (err) { if (window.console) console.error(err); } }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('[data-reveal]');
  var revealIo = null;
  function revealAll() { revealEls.forEach(function (el) { el.classList.add('is-visible'); }); }

  safe(function () {
    if (!('IntersectionObserver' in window) || motionOff()) { revealAll(); return; }
    revealIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealIo.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    revealEls.forEach(function (el) { revealIo.observe(el); });
  });

  /* ---------- Header state + reading progress ---------- */
  var header = $('.site-header');
  var progressBar = $('.scroll-progress');
  function updateChrome() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.setProperty('--progress', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    }
  }

  /* ---------- Animated illustrations: use the still SVG when motion is off ---------- */
  function syncIllustrations() {
    var off = motionOff();
    $$('img[data-still]').forEach(function (img) {
      if (!img.getAttribute('data-moving')) img.setAttribute('data-moving', img.getAttribute('src'));
      var want = off ? img.getAttribute('data-still') : img.getAttribute('data-moving');
      if (img.getAttribute('src') !== want) img.setAttribute('src', want);
    });
  }

  /* ---------- Parallax: scroll depth (data-speed) + pointer depth (data-depth) ---------- */
  var layers = [];
  var scopes = [];
  $$('[data-speed]').forEach(function (el) {
    var scope = el.closest('[data-parallax]') || el.parentElement;
    if (scopes.indexOf(scope) < 0) scopes.push(scope);
    layers.push({
      el: el,
      speed: parseFloat(el.getAttribute('data-speed')) || 0,
      depth: parseFloat(el.getAttribute('data-depth')) || 0,
      si: scopes.indexOf(scope)
    });
  });
  var pointer = { x: 0, y: 0, tx: 0, ty: 0, scope: $('[data-pointer]') };

  /* ---------- The hero sun follows the dotted arc ---------- */
  var sun = {
    el: $('.hero__sun'),
    path: $('.hero__arc path'),
    box: null,
    len: 0,
    rest: 0.93,     // where the sun settles after "sunrise" (top right, inside the glow)
    travel: 0.05,   // extra distance while the hero scrolls away
    t: 0.78,        // starting point of the sunrise (it rises from behind the phones)
    moving: false
  };
  if (sun.el && sun.path) {
    sun.box = sun.el.parentElement;
    safe(function () { sun.len = sun.path.getTotalLength(); });
  }
  function placeSun(t) {
    if (!sun.el || !sun.len || !sun.box) return;
    var pt = sun.path.getPointAtLength(t * sun.len);
    var w = sun.box.offsetWidth;
    var h = sun.box.offsetHeight;
    sun.el.style.translate = (pt.x / 1440 * w).toFixed(1) + 'px ' + (pt.y / 700 * h).toFixed(1) + 'px';
  }
  function stepSun() {
    if (!sun.el || !sun.len) return false;
    var hero = sun.box.closest('.hero') || sun.box;
    var y = window.pageYOffset || 0;
    var scrolled = Math.max(0, Math.min(1, y / (hero.offsetHeight || 1)));
    var target = sun.rest + sun.travel * scrolled;
    sun.t += (target - sun.t) * 0.05;
    if (Math.abs(target - sun.t) < 0.0004) sun.t = target;
    placeSun(sun.t);
    return sun.t !== target;
  }

  var ticking = false;
  function requestTick() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
  }
  function frame() {
    ticking = false;
    updateChrome();
    if (motionOff()) return;

    var vh = window.innerHeight;
    var offsets = scopes.map(function (s) {
      var r = s.getBoundingClientRect();
      return { on: r.bottom > -150 && r.top < vh + 150, off: r.top + r.height / 2 - vh / 2 };
    });

    pointer.x += (pointer.tx - pointer.x) * 0.075;
    pointer.y += (pointer.ty - pointer.y) * 0.075;
    var easing = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.002;

    layers.forEach(function (L) {
      var o = offsets[L.si];
      if (!o.on) return;
      var px = pointer.x * L.depth * 14;
      var py = -o.off * L.speed + pointer.y * L.depth * 14;
      L.el.style.translate = px.toFixed(2) + 'px ' + py.toFixed(2) + 'px';
    });

    var sunMoving = stepSun();
    if (easing || sunMoving) requestTick();
  }

  safe(function () {
    if (!pointer.scope || !fineMq || !fineMq.matches) return;
    pointer.scope.addEventListener('pointermove', function (e) {
      var r = pointer.scope.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      requestTick();
    });
    pointer.scope.addEventListener('pointerleave', function () {
      pointer.tx = 0; pointer.ty = 0; requestTick();
    });
  });

  /* ---------- Cursor spotlight on feature cards ---------- */
  safe(function () {
    if (!fineMq || !fineMq.matches) return;
    $$('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      });
    });
  });

  /* ---------- How it works: sticky phone follows the active step ---------- */
  safe(function () {
    var stage = $('.stage');
    var steps = $$('.step');
    if (!stage || !steps.length || !('IntersectionObserver' in window)) return;
    var screens = $$('.stage__screens img', stage);
    var dots = $$('.stage__dots span', stage);
    function setActive(i) {
      if (i < 0) return;
      stage.setAttribute('data-active', String(i));
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      screens.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      dots.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    }
    // the active step is the one crossing the middle of the viewport;
    // above the list it is the first, below it the last
    function pick() {
      var mid = window.innerHeight / 2;
      var active = 0;
      for (var i = 0; i < steps.length; i++) {
        var r = steps[i].getBoundingClientRect();
        if (r.top <= mid) active = i;
      }
      setActive(active);
    }
    setActive(0);
    var io = new IntersectionObserver(pick, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    steps.forEach(function (s) { io.observe(s); });
  });

  /* ---------- Rotating encouragement (real phrases from the app) ---------- */
  var quotes = { start: function () {}, stop: function () {} };
  safe(function () {
    var box = $('[data-quotes]');
    if (!box) return;
    var list = JSON.parse(box.getAttribute('data-quotes') || '[]');
    var text = $('.quote__text', box);
    var dots = $$('.quote__dots span', box);
    var btn = $('.pause-btn', box.closest('.card') || box);
    if (!text || list.length < 2) return;
    var idx = 0, timer = null, paused = false, inView = false;

    function show(n) {
      text.classList.add('is-leaving');
      window.setTimeout(function () {
        idx = n;
        text.textContent = list[idx];
        text.classList.remove('is-leaving');
        text.classList.add('is-entering');
        void text.offsetWidth;
        text.classList.remove('is-entering');
        dots.forEach(function (d, k) { d.classList.toggle('is-active', k === idx); });
      }, 600);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (paused || !inView || motionOff()) return;
      timer = window.setInterval(function () { show((idx + 1) % list.length); }, 5600);
    }
    quotes.start = start;
    quotes.stop = stop;

    if (btn) {
      btn.addEventListener('click', function () {
        paused = !paused;
        btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
        if (paused) stop(); else start();
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }).observe(box);
    }
  });

  /* ---------- In-page scrollspy (header nav, policy table of contents) ---------- */
  safe(function () {
    if (!('IntersectionObserver' in window)) return;
    $$('[data-spy]').forEach(function (nav) {
      var value = nav.getAttribute('data-spy') || 'true';
      var links = $$('a[href^="#"]', nav);
      var byId = {};
      var order = [];
      links.forEach(function (a) {
        var id = decodeURIComponent(a.getAttribute('href').slice(1));
        byId[id] = a;
        order.push(id);
      });
      var inBand = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { inBand[e.target.id] = e.isIntersecting; });
        var current = null;
        order.forEach(function (id) { if (inBand[id]) current = id; });
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (current) byId[current].setAttribute('aria-current', value);
      }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
      order.forEach(function (id) {
        var target = document.getElementById(id);
        if (target) io.observe(target);
      });
    });
  });

  /* ---------- Motion on/off ---------- */
  function updateToggles() {
    $$('[data-motion-toggle]').forEach(function (btn) {
      var label = $('.motion-toggle__label', btn);
      if (label) label.textContent = btn.getAttribute(userOff ? 'data-label-start' : 'data-label-stop');
    });
  }
  function applyMotion() {
    var off = motionOff();
    root.classList.toggle('motion-off', off);
    syncIllustrations();
    updateToggles();
    if (off) {
      revealAll();
      layers.forEach(function (L) { L.el.style.translate = ''; });
      sun.t = sun.rest;
      placeSun(sun.rest);
      quotes.stop();
    } else {
      quotes.start();
      requestTick();
    }
  }
  $$('[data-motion-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      userOff = !userOff;
      try { window.localStorage.setItem(STORE_KEY, userOff ? 'off' : 'on'); } catch (e) { /* ignore */ }
      applyMotion();
    });
  });
  if (reduceMq) {
    if (reduceMq.addEventListener) reduceMq.addEventListener('change', applyMotion);
    else if (reduceMq.addListener) reduceMq.addListener(applyMotion);
  }

  /* ---------- Wire up ---------- */
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', function () {
    if (motionOff()) placeSun(sun.rest);
    requestTick();
  });
  window.addEventListener('load', requestTick);

  safe(applyMotion);
  updateChrome();
  if (motionOff()) placeSun(sun.rest);
  else requestTick();
})();
